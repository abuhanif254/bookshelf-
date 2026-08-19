import { NextResponse } from 'next/server';
import { getBookBySlug, getAdSettings } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    // Rate limit: max 25 AI queries per 10 minutes per IP
    const rateLimit = checkRateLimit(`ai_chat:${clientIp}`, 25, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        message: 'AI chat query limit reached. Please wait a few minutes before asking more questions.',
      }, { status: 429 });
    }

    const body = await request.json();
    const { messages, bookId, bookSlug, bookTitle, bookAuthor, bookCat, bookDesc, bookPages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, message: 'Messages array is required' }, { status: 400 });
    }

    // Determine active API key and provider
    const settings = getAdSettings();
    const isGeminiKey = Boolean(process.env.GEMINI_API_KEY) || (settings.aiProvider === 'gemini');
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.AI_API_KEY ||
      settings.aiApiKey ||
      '';

    const rawProvider =
      process.env.AI_PROVIDER ||
      settings.aiProvider ||
      (isGeminiKey || apiKey.startsWith('AIzaSy') || apiKey.startsWith('AQ.') ? 'gemini' : apiKey.startsWith('gsk_') ? 'groq' : 'openai');

    // Build rich book context
    const cleanDesc = (bookDesc || '').replace(/<[^>]*>?/gm, ' ');
    const systemPrompt = `You are the official AI Study Companion for the PDF book "${bookTitle || 'this book'}" written by ${bookAuthor || 'the author'}.
Category: ${bookCat || 'General'}
Page Count: ${bookPages || 100} pages
Book Overview: ${cleanDesc}

Your Goal:
- Answer the reader's question directly, accurately, and concisely based on the themes, frameworks, protocols, and principles of this specific book.
- If the user greets you (e.g. "how are you?", "hello"), respond warmly as the AI Study Assistant for "${bookTitle}".
- Use clear markdown formatting (bullet points, bold key terms, short sections).
- Maintain an encouraging, intellectual, and helpful tone.`;

    if (!apiKey) {
      // Fallback response when no API key is configured yet
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      return NextResponse.json({
        success: true,
        reply: `### 🤖 AI Study Assistant for *"${bookTitle}"*:\n\nThank you for asking about **"${lastUserMsg}"**!\n\nIn *"${bookTitle}"*, ${bookAuthor} emphasizes that applying the principles of **${bookCat}** requires clear protocols and consistent execution. Key insights from this ${bookPages}-page PDF include:\n\n1. **Core Mental Model**: Focus on high-leverage frameworks rather than surface-level tactics.\n2. **Actionable Implementation**: Execute in focused sprints with zero distractions.\n3. **Continuous Review**: Track output metrics weekly.\n\n*(To activate live full-generative AI responses, add your Gemini, OpenAI, or Groq API key in your site settings or .env.local file!)*`,
        isMock: true,
      });
    }

    // Provider 1: Google Gemini (Recommended / Free Tier available)
    if (rawProvider === 'gemini' || apiKey.startsWith('AIzaSy') || apiKey.startsWith('AQ.')) {
      const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

      // Filter out leading welcome assistant message so contents starts with a user turn
      const validMessages = messages.filter(
        (m: ChatMessage, idx: number) => !(idx === 0 && m.role === 'assistant')
      );

      const contents = (validMessages.length > 0 ? validMessages : messages).map((m: ChatMessage) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return NextResponse.json({
          success: true,
          reply: data.candidates[0].content.parts[0].text,
        });
      } else if (data.error) {
        console.error('Gemini API returned error:', data.error);
        throw new Error(data.error.message || 'Gemini API Error');
      }
    }

    // Provider 2: OpenAI / Groq / OpenRouter / DeepSeek (OpenAI Compatible)
    const baseUrl =
      rawProvider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';

    const modelName =
      rawProvider === 'groq'
        ? 'llama-3.1-8b-instant'
        : process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const openAiRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const openAiData = await openAiRes.json();
    if (openAiData.choices && openAiData.choices[0]?.message?.content) {
      return NextResponse.json({
        success: true,
        reply: openAiData.choices[0].message.content,
      });
    } else if (openAiData.error) {
      throw new Error(openAiData.error.message || 'AI API Error');
    }

    throw new Error('No valid response received from AI model');
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({
      success: false,
      message: error?.message || 'Error communicating with AI service. Please try again later.',
    }, { status: 500 });
  }
}
