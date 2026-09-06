// Centralized Multilingual Configuration for Bookshelf (300,000+ Books Architecture)

export interface LanguageConfig {
  code: string;       // ISO 639-1: 'bn', 'hi', 'ur', 'es', 'zh', 'en'
  slug: string;       // URL slug: 'bangla', 'hindi', 'urdu', 'spanish', 'chinese', 'english'
  name: string;       // English display name
  nativeName: string; // Native script display name
  h1: string;
  seoTitle: string;
  seoDesc: string;
  intro: string;
  isRtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'bn',
    slug: 'bangla',
    name: 'Bangla',
    nativeName: 'বাংলা',
    h1: 'ফ্রি বাংলা বই ও উপন্যাস PDF ডাউনলোড (Free Bangla Books)',
    seoTitle: 'ফ্রি বাংলা বই ও উপন্যাস PDF ডাউনলোড — রবীন্দ্রনাথ, নজরুল, হুমায়ূন আহমেদ | Bookshelf',
    seoDesc: '৩০০,০০০+ সেরা ফ্রি বাংলা বই, উপন্যাস, কবিতা ও সাহিত্যের হাই-স্পিড গুগল ড্রাইভ সরাসরি PDF ডাউনলোড। রবীন্দ্রনাথ ঠাকুর, কাজী নজরুল ইসলাম ও হুমায়ূন আহমেদের বইসমূহ সম্পূর্ণ বিনামূল্যে পড়ুন।',
    intro: 'রবীন্দ্রনাথ ঠাকুর, কাজী নজরুল ইসলাম, হুমায়ূন আহমেদ ও শরৎচন্দ্রের অমর সাহিত্য সহ সেরা সব বাংলা বই ও উপন্যাসের ফ্রি পিডিএফ ডাউনলোড করুন উচ্চগতিতে।',
    isRtl: false,
  },
  {
    code: 'hi',
    slug: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    h1: 'मुफ्त हिन्दी पुस्तकें एवं कहानियां PDF डाउनलोड (Free Hindi Books)',
    seoTitle: 'मुफ्त हिन्दी पुस्तकें एवं कहानियां PDF डाउनलोड — प्रेमचंद व आधुनिक साहित्य | Bookshelf',
    seoDesc: 'हजारों प्रसिद्ध हिन्दी किताबें, कहानियां, उपन्यास, प्रेरक व धार्मिक साहित्य मुफ्त PDF में डाउनलोड करें। मुंशी प्रेमचंद व हरिवंश राय बच्चन की रचनाएं 100% फ्री डायरेक्ट गूगल ड्राइव डाउनलोड।',
    intro: 'मुंशी प्रेमचंद, हरिवंश राय बच्चन और आधुनिक लेखकों की प्रसिद्ध हिन्दी कहानियाँ, उपन्यास और ज्ञानवर्धक पुस्तकें मुफ्त पीडीएफ में डाउनलोड करें।',
    isRtl: false,
  },
  {
    code: 'ur',
    slug: 'urdu',
    name: 'Urdu',
    nativeName: 'اردو',
    h1: 'مفت اردو کتب، ناول اور شاعری پی ڈی ایف (Free Urdu Books)',
    seoTitle: 'مفت اردو کتب، ناول اور شاعری پی ڈی ایف ڈاؤن لوڈ — اقبال، غالب اور منٹو | Bookshelf',
    seoDesc: 'ہزاروں شاہکار اردو کتابیں، ناولز، افسانے، شاعری اور کتب مفت پی ڈی ایف میں ڈاؤن لوڈ کریں۔ علامہ اقبال، مرزا غالب، سعادت حسن منٹو کی کتب کے تیز رفتار گوگل ڈرائیو لنکس۔',
    intro: 'علامہ اقبال، مرزا غالب، سعادت حسن منٹو اور نامور ادیبوں کی شاہکار اردو کتب، شاعری اور ناولز کی مفت پی ڈی ایف ڈاؤن لوڈ کریں۔',
    isRtl: true,
  },
  {
    code: 'es',
    slug: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    h1: 'Libros Gratis en PDF en Español — Descarga Directa',
    seoTitle: 'Descargar Libros Gratis en PDF en Español — Novelas, Clásicos y Autoayuda | Bookshelf',
    seoDesc: 'Descarga miles de libros y novelas gratis en PDF en español sin registros ni límites. Obras completas de Gabriel García Márquez, Cervantes, finanzas y superación personal en Google Drive.',
    intro: 'Explora nuestra amplia colección de libros en español en formato PDF: literatura clásica de Cervantes y García Márquez, desarrollo personal y guías prácticas.',
    isRtl: false,
  },
  {
    code: 'zh',
    slug: 'chinese',
    name: 'Chinese',
    nativeName: '中文',
    h1: '免费中文PDF电子书下载 (Free Chinese PDF Books)',
    seoTitle: '免费中文PDF电子书下载 — 经典文学名著、商业与学习资料 | Bookshelf',
    seoDesc: '海量精校中文电子书PDF免费下载，涵盖古典四大名著、现当代文学、经管励志与前沿科技资料。高速Google Drive网盘直链下载，完全免费。',
    intro: '精选中国古典文学名著、历史典籍、商业思考与技术手册，提供高质量无水印排版PDF免费下载。',
    isRtl: false,
  },
  {
    code: 'en',
    slug: 'english',
    name: 'English',
    nativeName: 'English',
    h1: 'Free English PDF Books & Field Guides (Direct Download)',
    seoTitle: 'Download 300,000+ Free PDF Books & Field Guides — Clean DRM-Free | Bookshelf',
    seoDesc: 'Download verified free PDF books, handbooks, and toolkits across programming, computer science, business, mindset, and design. Direct 1-click Google Drive streams.',
    intro: 'Explore thousands of verified free English PDF books, toolkits, and playbooks. Instant direct high-speed downloads for desktop, mobile, and Kindle.',
    isRtl: false,
  },
];

// Mapping helper to resolve either slug ('bangla') or code ('bn')
export function getLanguageConfig(identifier: string): LanguageConfig | undefined {
  const clean = identifier.toLowerCase().trim();
  return SUPPORTED_LANGUAGES.find(l => l.slug === clean || l.code === clean);
}

// Normalize language code into standard 2-letter ISO or supported code
export function normalizeLanguageCode(lang?: string): string {
  if (!lang) return 'en';
  const clean = lang.toLowerCase().trim();
  if (clean === 'ben' || clean === 'bangla' || clean === 'bn') return 'bn';
  if (clean === 'hin' || clean === 'hindi' || clean === 'hi') return 'hi';
  if (clean === 'urd' || clean === 'urdu' || clean === 'ur') return 'ur';
  if (clean === 'spa' || clean === 'spanish' || clean === 'es') return 'es';
  if (clean === 'chi' || clean === 'zho' || clean === 'chinese' || clean === 'zh') return 'zh';
  if (clean === 'eng' || clean === 'english' || clean === 'en') return 'en';
  return clean;
}

// Generate contextual localized FAQs to eliminate thin content and boost target-language ranking
export function getLocalizedFaqs(langCode: string, bookTitle: string, authorName: string, pages: number = 80): { question: string; answer: string }[] {
  const norm = normalizeLanguageCode(langCode);

  switch (norm) {
    case 'bn':
      return [
        {
          question: `"${bookTitle}" বইটি কীভাবে PDF ফরম্যাটে বিনামূল্যে ডাউনলোড করবেন?`,
          answer: `উপরে দেওয়া "Download Free PDF" বাটনে ক্লিক করুন। একটি সংক্ষিপ্ত স্পনসর বার্তার পরেই আপনার উচ্চগতির গুগল ড্রাইভ সরাসরি ডাউনলোড লিংকটি চালু হয়ে যাবে। কোনো রেজিস্ট্রেশন বা সাবস্ক্রিপশনের প্রয়োজন নেই।`,
        },
        {
          question: `${authorName}-এর লেখা "${bookTitle}" বইটি কি সম্পূর্ণ ফ্রি?`,
          answer: `হ্যাঁ! Bookshelf-এ সংরক্ষিত এই সংস্করণটি ১০০% বিনামূল্যে ডাউনলোডের জন্য উন্মুক্ত। আপনি ব্যক্তিগত পাঠের জন্য সম্পূর্ণ ফ্রিতে এটি ডাউনলোড করতে পারবেন।`,
        },
        {
          question: `এই ${pages} পৃষ্ঠার PDF ফাইলটি কি মোবাইল এবং ট্যাবলেটে সহজে পড়া যাবে?`,
          answer: `হ্যাঁ, এই বইটি উচ্চমানের স্পষ্ট বাংলা ফন্টে সার্চেবল PDF হিসেবে তৈরি করা হয়েছে। এটি যেকোনো অ্যান্ড্রয়েড, আইফোন, আইপ্যাড অথবা কম্পিউটার স্ক্রিনে মসৃণভাবে পড়া যাবে।`,
        },
      ];

    case 'hi':
      return [
        {
          question: `"${bookTitle}" पुस्तक की पीडीएफ मुफ्त में कैसे डाउनलोड करें?`,
          answer: `ऊपर दिए गए "Download Free PDF" बटन पर क्लिक करें। एक संक्षिप्त प्रायोजक संदेश के बाद आपका उच्च-गति गूगल ड्राइव डाउनलोड लिंक तुरंत सक्रिय हो जाएगा। बिना किसी शुल्क के तुरंत डाउनलोड करें।`,
        },
        {
          question: `क्या ${authorName} द्वारा लिखित "${bookTitle}" पूरी तरह से मुफ्त है?`,
          answer: `हाँ! Bookshelf पर यह ${pages} पृष्ठों वाली पुस्तक 100% मुफ्त उपलब्ध है। इसके लिए किसी भी क्रेडिट कार्ड या पंजीकरण की आवश्यकता नहीं है।`,
        },
        {
          question: `क्या इस पीडीएफ को स्मार्टफोन और किंडल पर पढ़ा जा सकता है?`,
          answer: `बिल्कुल! यह पीडीएफ मानक रिज़ॉल्यूशन में तैयार की गई है, जो सभी मोबाइल पाठकों, टैबलेट और कंप्यूटर पर स्पष्ट रूप से प्रदर्शित होती है।`,
        },
      ];

    case 'ur':
      return [
        {
          question: `"${bookTitle}" کتاب کی پی ڈی ایف مفت میں کیسے ڈاؤن لوڈ کریں؟`,
          answer: `اوپر دیے گئے "Download Free PDF" بٹن پر کلک کریں۔ مختصر اسپانسر پیغام کے بعد آپ کا ہائی اسپیڈ گوگل ڈرائیو لنک فوری طور پر متحرک ہو جائے گا۔`,
        },
        {
          question: `کیا ${authorName} کی لکھی ہوئی "${bookTitle}" مکمل طور پر مفت ہے؟`,
          answer: `جی ہاں! Bookshelf پر یہ کتاب 100% مفت ڈاؤن لوڈ کے لیے دستیاب ہے۔ کسی بھی رجسٹریشن یا فیس کی ضرورت نہیں ہے۔`,
        },
        {
          question: `کیا یہ ${pages} صفحات کی پی ڈی ایف موبائل اور ٹیبلٹ پر باآسانی پڑھی جا سکتی ہے؟`,
          answer: `بالکل، یہ پی ڈی ایف بہترین کوالٹی کے ساتھ تیار کی گئی ہے اور ہر قسم کے اسمارٹ فون، آئی پیڈ اور کمپیوٹر پر آسانی سے پڑھی جا سکتی ہے۔`,
        },
      ];

    case 'es':
      return [
        {
          question: `¿Cómo descargar el libro "${bookTitle}" en formato PDF gratis?`,
          answer: `Haz clic en el botón "Download Free PDF" situado arriba. Tras un breve mensaje de patrocinador de 8 segundos, tu enlace de descarga directa de alta velocidad en Google Drive se activará automáticamente sin coste alguno.`,
        },
        {
          question: `¿El libro "${bookTitle}" de ${authorName} es 100% gratuito?`,
          answer: `Sí, esta edición de ${pages} páginas en Bookshelf es totalmente gratuita, sin suscripciones, registros ni pagos ocultos.`,
        },
        {
          question: `¿Puedo leer este archivo PDF en mi teléfono móvil, Kindle o tablet?`,
          answer: `Sí. Este libro está formateado como un PDF digital estándar de alta resolución con texto seleccionable, compatible con Apple Books, Kindle, Android y lectores de PC.`,
        },
      ];

    case 'zh':
      return [
        {
          question: `如何免费下载《${bookTitle}》高清PDF电子书？`,
          answer: `点击上方的“Download Free PDF”按钮，等待数秒赞助提示后，您的高速Google Drive直接下载链接将立即激活。无需任何注册或订阅费用。`,
        },
        {
          question: `${authorName}所著的《${bookTitle}》是否完全免费？`,
          answer: `是的！Bookshelf收录的这本共${pages}页的电子书为100%免费开放下载，供读者个人学习和阅读使用。`,
        },
        {
          question: `该PDF可以在手机、平板或Kindle上正常阅读吗？`,
          answer: `可以。本书经过高清排版并嵌入标准中文字体，兼容各类智能手机、iPad、Kindle及桌面端阅读器。`,
        },
      ];

    default:
      return [
        {
          question: `How can I download "${bookTitle}" in PDF format?`,
          answer: `Click the "Download Free PDF" button above. After a quick 8-second sponsor message, your high-speed Google Drive direct download link will activate immediately. No registration or credit card needed.`,
        },
        {
          question: `Is "${bookTitle}" by ${authorName} completely free?`,
          answer: `Yes! "${bookTitle}" is 100% free to download on Bookshelf with no subscription fees or hidden costs for personal educational use.`,
        },
        {
          question: `Can I open this ${pages}-page PDF on mobile, iPad, and Kindle?`,
          answer: `Yes. This edition is formatted as a standard, high-resolution PDF with searchable text, fully compatible with all PDF readers, mobile phones, iPads, Apple Books, and Kindle devices.`,
        },
      ];
  }
}
