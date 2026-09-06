import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isDryRun = process.argv.includes('--dry-run');
const countArg = process.argv.find(a => a.startsWith('--count='));
const TOTAL_BOOKS = countArg ? parseInt(countArg.split('=')[1], 10) : 1200;

// Multilingual Catalog Seeds
const AUTHORS_AND_TITLES = {
  bn: {
    lang: 'bn',
    cat: 'Literature',
    data: [
      { author: 'রবীন্দ্রনাথ ঠাকুর', titles: ['গীতাঞ্জলি', 'গোরা', 'চোখের বালি', 'নৌকাডুবি', 'শেষের কবিতা', 'ডাকঘর', 'ঘরে বাইরে', 'রাজর্ষি'] },
      { author: 'কাজী নজরুল ইসলাম', titles: ['অগ্নিবীণা', 'বিষের বাঁশী', 'রিক্তের বেদন', 'কুহেলিকা', 'মৃত্যুক্ষুধা', 'সর্বহারা', 'দোলন-চাঁপা'] },
      { author: 'হুমায়ূন আহমেদ', titles: ['দেবী', 'নন্দিত নরকে', 'শঙ্খনীল কারাগার', 'ময়ূরাক্ষী', 'হিমুর হাতে কয়েকটি নীলপদ্ম', 'মিসির আলির চশমা', 'বহুব্রীহি'] },
      { author: 'শরৎচন্দ্র চট্টোপাধ্যায়', titles: ['দেবদাস', 'শ্রীকান্ত (১ম ও ২য় খণ্ড)', 'পল্লীসমাজ', 'চরিত্রহীন', 'গৃহদাহ', 'বিন্দুর ছেলে', 'দেনা পাওনা'] },
      { author: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়', titles: ['পথের পাঁচালী', 'অপরাজিত', 'আরণ্যক', 'চাঁদের পাহাড়', 'ইছামতী', 'আদর্শ হিন্দু হোটেল'] },
      { author: 'জীবনানন্দ দাশ', titles: ['বনলতা সেন', 'ধূসর পাণ্ডুলিপি', 'রূপসী বাংলা', 'ঝরা পালক', 'বেলা অবেলা কালবেলা'] },
    ],
  },
  hi: {
    lang: 'hi',
    cat: 'Literature',
    data: [
      { author: 'मुंशी प्रेमचंद', titles: ['गोदान', 'गबन', 'निर्मला', 'कर्मभूमि', 'रंगभूमि', 'मानसरोवर (कहानियां)', 'सेवासदन', 'प्रतिज्ञा'] },
      { author: 'हरिवंश राय बच्चन', titles: ['मधुशाला', 'मधुबाला', 'मधुकलश', 'क्या भूलूं क्या याद करूं', 'नीड़ का निर्माण फिर'] },
      { author: 'जयशंकर प्रसाद', titles: ['कामायनी', 'स्कंदगुप्त', 'चंद्रगुप्त', 'ध्रुवस्वामिनी', 'तितली', 'कंकाल'] },
      { author: 'रामधारी सिंह दिनकर', titles: ['रश्मिरथी', 'उर्वशी', 'कुरुक्षेत्र', 'संस्कृति के चार अध्याय', 'रेणुका'] },
      { author: 'महादेवी वर्मा', titles: ['यामा', 'दीपशिखा', 'नीरजा', 'अतीत के चलचित्र', 'स्मृति की रेखाएं'] },
    ],
  },
  ur: {
    lang: 'ur',
    cat: 'Literature',
    data: [
      { author: 'علامہ اقبال', titles: ['بانگ درا', 'بال جبریل', 'ضرب کلیم', 'ارمغان حجاز', 'پیام مشرق', 'زبور عجم'] },
      { author: 'مرزا غالب', titles: ['دیوان غالب', 'خطوط غالب', 'قاطع برہان', 'کلیات غالب'] },
      { author: 'سعادت حسن منٹو', titles: ['ٹوبہ ٹیک سنگھ', 'ٹھنڈا گوشت', 'دھواں', 'کالی شلوار', 'چغد', 'یزید'] },
      { author: 'فیض احمد فیض', titles: ['نقش فریادی', 'دست صبا', 'زنداں نامہ', 'دست تہ سنگ', 'شام شہر یاراں'] },
      { author: 'اشفاق احمد', titles: ['زاویہ (جلد اول و دوم)', 'من چلے کا سودا', 'گڈریا', 'ایک محبت سو افسانے'] },
    ],
  },
  es: {
    lang: 'es',
    cat: 'Literature',
    data: [
      { author: 'Miguel de Cervantes', titles: ['Don Quijote de la Mancha', 'Novelas Ejemplares', 'La Galatea', 'Viaje del Parnaso'] },
      { author: 'Gabriel García Márquez', titles: ['Cien años de soledad', 'El coronel no tiene quien le escriba', 'Crónica de una muerte anunciada', 'El amor en los tiempos del cólera'] },
      { author: 'Jorge Luis Borges', titles: ['Ficciones', 'El Aleph', 'El libro de arena', 'Historia universal de la infamia'] },
      { author: 'Federico García Lorca', titles: ['Romancero Gitano', 'Poeta en Nueva York', 'Bodas de Sangre', 'La Casa de Bernarda Alba'] },
      { author: 'Pablo Neruda', titles: ['Veinte poemas de amor y una canción desesperada', 'Canto General', 'Odas elementales', 'Residencia en la tierra'] },
    ],
  },
  zh: {
    lang: 'zh',
    cat: 'Literature',
    data: [
      { author: '曹雪芹', titles: ['红楼梦 (全本精校)', '脂砚斋重评石头记'] },
      { author: '罗贯中', titles: ['三国演义 (百回全注本)', '隋唐两朝志传'] },
      { author: '施耐庵', titles: ['水浒传 (全回本)', '水浒后传'] },
      { author: '吴承恩', titles: ['西游记 (全百回典藏版)', '花草新编'] },
      { author: '鲁迅', titles: ['狂人日记与呐喊', '彷徨', '朝花夕拾', '野草', '阿Q正传'] },
      { author: '老舍', titles: ['骆驼祥子', '四世同堂', '茶馆', '月牙儿'] },
    ],
  },
  en_tech: {
    lang: 'en',
    cat: 'Programming',
    data: [
      { author: 'Dr. Elena Vance', titles: ['Mastering Modern JavaScript Patterns 2026', 'TypeScript Clean Architecture at Scale', 'High-Performance Node.js Microservices', 'React 19 Server Components Deep Dive'] },
      { author: 'Marcus Sterling', titles: ['Python Data Analysis & Pandas Playbook', 'Applied Machine Learning with Scikit & PyTorch', 'Data Structures & Algorithms in Python', 'Automating Cloud Workflows with Python'] },
      { author: 'Arjun Mehta', titles: ['Designing Resilient Microservices & APIs', 'Fullstack Web Architecture with Next.js', 'System Design Interview Field Manual', 'Docker & Kubernetes in Production'] },
      { author: 'Linus Weber', titles: ['Linux Systems Programming Handbook', 'Go Concurrent Systems in Practice', 'Rust Memory Safety & High-Throughput Engines', 'SQL Query Optimization & Database Indexing'] },
    ],
  },
  en_biz: {
    lang: 'en',
    cat: 'Business',
    data: [
      { author: 'Sophia Rossi', titles: ['The Solo Founder Playbook: 0 to $10K MRR', 'SaaS Pricing Strategies for Bootstrapped Startups', 'B2B Sales Outreach & Cold Email Mastery', 'Product-Led Growth Blueprint'] },
      { author: 'Dr. Mara Chen', titles: ['Deep Focus: Engineering Unbreakable Concentration', 'The 90-Minute Focus Sprint Handbook', 'Attention Economics: Reclaiming Cognitive Energy', 'Digital Minimalism for Knowledge Workers'] },
      { author: 'David Vance', titles: ['The Automated Wealth Blueprint: Index Investing', 'The Weekend Financial Reset: Zero-Budget Money Systems', 'Tax-Advantaged Compounding Strategies', 'Real Estate Micro-Investing for Founders'] },
      { author: 'Studio Norr', titles: ['Design Systems Handbook: Tokens & Architecture', 'Typography for Screens: Responsive Scales', 'Figma to Code: Design Engineering Playbook', 'Accessible UI Patterns for Web Applications'] },
    ],
  },
  en_classics: {
    lang: 'en',
    cat: 'Literature',
    data: [
      { author: 'William Shakespeare', titles: ['Hamlet (Annotated Edition)', 'Macbeth', 'Romeo and Juliet', 'The Tempest', 'Othello', 'King Lear', 'A Midsummer Night\'s Dream'] },
      { author: 'Jane Austen', titles: ['Pride and Prejudice', 'Sense and Sensibility', 'Emma', 'Persuasion', 'Mansfield Park', 'Northanger Abbey'] },
      { author: 'Charles Dickens', titles: ['Great Expectations', 'A Tale of Two Cities', 'Oliver Twist', 'David Copperfield', 'Hard Times', 'Bleak House'] },
      { author: 'Leo Tolstoy', titles: ['War and Peace', 'Anna Karenina', 'The Death of Ivan Ilyich', 'Resurrection', 'The Kingdom of God Is Within You'] },
      { author: 'Fyodor Dostoevsky', titles: ['Crime and Punishment', 'The Brothers Karamazov', 'Notes from Underground', 'The Idiot', 'Demons'] },
      { author: 'Arthur Conan Doyle', titles: ['A Study in Scarlet', 'The Sign of the Four', 'The Hound of the Baskervilles', 'The Valley of Fear', 'The Adventures of Sherlock Holmes'] },
    ],
  },
  en_philosophy: {
    lang: 'en',
    cat: 'Self-Help',
    data: [
      { author: 'Marcus Aurelius', titles: ['Meditations (Modern Translation)', 'The Emperor\'s Handbook', 'Stoic Wisdom for Daily Resilience'] },
      { author: 'Seneca', titles: ['Letters from a Stoic', 'On the Shortness of Life', 'On Tranquility of Mind', 'On Anger'] },
      { author: 'Epictetus', titles: ['Discourses and Selected Writings', 'The Enchiridion (Manual for Living)', 'The Art of Living'] },
      { author: 'Sun Tzu', titles: ['The Art of War (Complete Unabridged)', 'Strategies for Competitive Supremacy', 'The Classical Commentary'] },
      { author: 'Plato', titles: ['The Republic (Annotated)', 'The Apology of Socrates', 'Symposium', 'Phaedo'] },
      { author: 'Aristotle', titles: ['Nicomachean Ethics', 'Politics', 'Poetics', 'The Organon'] },
    ],
  },
  en_science: {
    lang: 'en',
    cat: 'Technology',
    data: [
      { author: 'Isaac Newton', titles: ['Philosophiae Naturalis Principia Mathematica', 'Opticks', 'The System of the World'] },
      { author: 'Albert Einstein', titles: ['Relativity: The Special and General Theory', 'The Meaning of Relativity', 'Sidelights on Relativity'] },
      { author: 'Charles Darwin', titles: ['On the Origin of Species', 'The Voyage of the Beagle', 'The Descent of Man'] },
      { author: 'Alan Turing', titles: ['Computing Machinery and Intelligence', 'On Computable Numbers', 'Collected Works on Morphogenesis'] },
      { author: 'Marie Curie', titles: ['Radioactive Substances', 'Treatise on Radioactivity', 'Autobiographical Notes'] },
    ],
  },
};

function generateSlug(title, idSuffix) {
  let base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!base || base.length < 3) {
    base = 'book-' + Math.random().toString(36).substring(2, 8);
  }

  return `${base.slice(0, 50)}-${idSuffix}`;
}

async function run() {
  console.log(`\n📚 Bookshelf Industrial Catalog Seeder`);
  console.log(`Target Count: ${TOTAL_BOOKS} books | Dry Run: ${isDryRun ? 'YES (Simulated)' : 'NO (Live DB Upsert)'}\n`);

  if (!isDryRun && (!SUPABASE_URL || !SUPABASE_KEY)) {
    console.error('❌ Error: Missing Supabase credentials in environment.');
    process.exit(1);
  }

  const supabase = !isDryRun ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
  const booksToInsert = [];
  const groups = Object.values(AUTHORS_AND_TITLES);
  let globalIndex = 0;

  let nextId = 10000;
  if (!isDryRun) {
    const { data: topId } = await supabase
      .from('books')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    if (topId && topId[0]?.id) {
      nextId = topId[0].id + 1;
    }
  }

  while (booksToInsert.length < TOTAL_BOOKS) {
    for (const group of groups) {
      if (booksToInsert.length >= TOTAL_BOOKS) break;

      const randomAuthor = group.data[Math.floor(Math.random() * group.data.length)];
      const baseTitle = randomAuthor.titles[Math.floor(Math.random() * randomAuthor.titles.length)];
      globalIndex++;

      const editionSuffix = globalIndex > 200 ? ` (Vol. ${Math.floor(globalIndex / 200) + 1})` : '';
      const fullTitle = `${baseTitle}${editionSuffix}`;
      const slugSuffix = Math.random().toString(36).substring(2, 6);
      const slug = generateSlug(fullTitle, slugSuffix);
      const pages = 80 + Math.floor(Math.random() * 320);
      const downloads = 120 + Math.floor(Math.random() * 8500);
      const rating = +(4.6 + Math.random() * 0.4).toFixed(1);
      const reviews = Math.floor(downloads * (0.05 + Math.random() * 0.08));

      // Deterministic sample drive file IDs
      const driveSampleId = `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`;

      booksToInsert.push({
        id: nextId++,
        title: fullTitle,
        sub: `Official verified edition by ${randomAuthor.author} · Complete unabridged text with annotations and reading notes.`,
        author: randomAuthor.author,
        cat: group.cat,
        type: 'free',
        price: 0,
        list: 14.99,
        rating,
        reviews,
        pages,
        downloads,
        badge: downloads > 4000 ? 'Best Seller' : downloads > 2000 ? 'Trending' : 'Verified Open Access',
        bought: `${(downloads * 1.4).toFixed(0)} reads this month`,
        blurb: `Download and read "${fullTitle}" by ${randomAuthor.author} for free in high-speed PDF format. Completely verified text formatting for mobile, tablet, and Kindle.`,
        desc_html: `<p><strong>${fullTitle}</strong> by <strong>${randomAuthor.author}</strong> is cataloged in the Bookshelf Digital Archives for educational and literary preservation.</p><p>This edition has been typeset for modern screen reading with searchable typography, clean page layouts, and mobile-friendly chapters.</p>`,
        feat: [
          'Searchable high-resolution digital text',
          'Formatted for mobile, iPad, and desktop readers',
          'Instant Google Drive stream with zero ads or subscriptions',
          'Includes historical context and reading questions',
        ],
        drive_url: `https://drive.google.com/file/d/${driveSampleId}/view?usp=sharing`,
        slug,
        lang: group.lang,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 3600 * 1000)).toISOString(),
      });
    }
  }

  console.log(`Generated ${booksToInsert.length} book records across 6 languages:`);
  const langCounts = {};
  for (const b of booksToInsert) {
    langCounts[b.lang] = (langCounts[b.lang] || 0) + 1;
  }
  console.table(langCounts);

  if (isDryRun) {
    console.log('✅ Dry-run completed successfully. Zero database rows written.');
    return;
  }

  // Batch upsert to Supabase
  const BATCH_SIZE = 200;
  let insertedTotal = 0;

  for (let i = 0; i < booksToInsert.length; i += BATCH_SIZE) {
    const chunk = booksToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('books').upsert(chunk, { onConflict: 'slug' });
    if (error) {
      console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
    } else {
      insertedTotal += chunk.length;
      process.stdout.write(`\r🚀 Upserted ${insertedTotal} / ${booksToInsert.length} books into Supabase...`);
    }
  }

  console.log(`\n\n🎉 Seeding complete! Successfully added ${insertedTotal} books to the catalog.`);
  console.log(`💡 Next step: Go to /admin/books and click "Broadcast to IndexNow" to push these URLs to Bing & Google.`);
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
