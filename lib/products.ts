export type ProductType = 'paid' | 'free' | 'affiliate';

export interface Product {
  id: number;
  slug: string;
  title: string;
  sub: string;
  author: string;
  cat: string;
  type: ProductType;
  price: number;
  list: number | null;
  rating: number;
  reviews: number;
  pages: number;
  badge: string | null;
  bought: string;
  bg: string;
  fg: string;
  ac: string;
  pat: string;
  blurb: string;
  feat: string[];
  desc: string;
  downloads?: number;
  partner?: string;
  partnerUrl?: string;
  driveUrl?: string;
  coverImage?: string;
  coverUrl?: string;
  createdAt?: string;
}

export const P: Product[] = [
  {id:1, slug:'deep-focus', title:'Deep Focus', sub:'Reclaim your attention in a distracted world', author:'Mara Chen, PhD', cat:'Productivity', type:'paid', price:12.99, list:24.99, rating:4.8, reviews:2341, pages:186, badge:'Best Seller', bought:'4.2K bought in past month', bg:'#0f2a43', fg:'#f5f1e8', ac:'#febd69', pat:'p-rings',
   blurb:'A neuroscience-backed system for doing your best work in 90-minute blocks — without willpower heroics.', feat:['The 3-layer distraction audit used by 12,000 readers','90-minute sprint protocol with printable planner','Deep-work environment design checklist','21-day attention rebuild program'],
   desc:'<p>Most focus advice tells you to try harder. <b>Deep Focus</b> shows you how to try <i>less</i> — by engineering your environment, your energy and your attention so concentration becomes the default.</p><p>Drawing on 400+ studies and interviews with surgeons, chess masters and air-traffic controllers, Dr. Mara Chen distills attention into a system anyone can run: the 90-minute sprint, the distraction audit, and the shutdown ritual that lets you actually stop working.</p>'},
  {id:2, slug:'indie-founder-playbook', title:'The Indie Founder Playbook', sub:'From idea to $10K MRR without VC money', author:'Dev Okafor', cat:'Business', type:'paid', price:19.99, list:34.99, rating:4.7, reviews:1187, pages:264, badge:'#1 New Release', bought:'2.8K bought in past month', bg:'#c92a2a', fg:'#fff5f5', ac:'#ffd814', pat:'p-lines',
   blurb:'The exact launch sequences, pricing pages and cold-DM scripts behind 30+ profitable solo businesses.', feat:['30 real launch teardowns with revenue numbers','Copy-paste landing page & pricing frameworks','The 14-day validation sprint','Distribution channels ranked by effort vs. return'],
   desc:'<p>No theory, no fundraising folklore. This is a field manual for building a profitable software or content business as a team of one.</p><p>Every chapter ends with a "do this tonight" action list, and the appendix contains every template the author used to reach $10K MRR three separate times.</p>'},
  {id:3, slug:'zero-to-launch', title:'Zero to Launch', sub:"The creator's guide to shipping digital products", author:'Priya Raman', cat:'Marketing', type:'affiliate', partner:'Gumroad', partnerUrl:'#', price:29, list:null, rating:4.6, reviews:894, pages:142, badge:'Partner Pick', bought:'1.9K bought in past month', bg:'#e8590c', fg:'#fff8f0', ac:'#232f3e', pat:'p-dots',
   blurb:'A step-by-step launch plan for your first digital product — audience, offer, page, and the 7-day launch week.', feat:['7-day launch week timeline','Offer validation worksheets','Email sequences that convert at 3%+'],
   desc:'<p>Priya Raman has launched 11 digital products. This PDF compresses her entire launch operating system into 142 pages you can execute in a weekend.</p>'},
  {id:4, slug:'design-systems-handbook', title:'Design Systems Handbook', sub:'Tokens, components & governance that scale', author:'Studio Norr', cat:'Design', type:'paid', price:29.00, list:49.00, rating:4.9, reviews:3102, pages:312, badge:'Best Seller', bought:'3.1K bought in past month', bg:'#0b7285', fg:'#e6fcf5', ac:'#ffd814', pat:'p-grid',
   blurb:'The definitive guide to building and maintaining design systems — from naming tokens to getting buy-in.', feat:['Token architecture for multi-brand systems','Component API design patterns','Figma ↔ code sync workflow','Contribution & governance models'],
   desc:"<p>Written by the team behind three of the most-used open design systems, this handbook covers everything between \"we need consistency\" and \"it's been consistent for two years.\"</p>"},
  {id:5, slug:'morning-reset', title:'The Morning Reset', sub:'A 21-day protocol for calmer, sharper mornings', author:'Dr. Elena Voss', cat:'Self-Help', type:'free', price:0, list:14.99, rating:4.9, reviews:5210, pages:84, badge:'Free', bought:'11K downloaded this month', bg:'#2b8a3e', fg:'#f4fce3', ac:'#ffd814', pat:'p-rings',
   blurb:'Our most-downloaded free PDF. Small morning levers, big daytime energy — with printable habit trackers.', feat:['21-day guided protocol','Printable habit tracker cards','The 10-minute "reset" routine'],
   desc:'<p>A short, practical read you can finish in one sitting and start the next morning. Free forever, as part of Free PDF Fridays.</p>'},
  {id:6, slug:'javascript-patterns-2e', title:'JavaScript Patterns, 2nd Ed.', sub:'Modern architecture for real-world apps', author:'Tomas Lindqvist', cat:'Programming', type:'paid', price:24.50, list:39.99, rating:4.7, reviews:1976, pages:398, badge:'Deal', bought:'2.2K bought in past month', bg:'#212529', fg:'#f8f9fa', ac:'#ffa94d', pat:'p-blocks',
   blurb:'The classic patterns book, fully rewritten for the modern stack — modules, streams, signals and edge runtimes.', feat:['47 patterns with runnable examples','Architecture decision flowcharts','Migration guides from legacy code','Interview-prep pattern index'],
   desc:'<p>From composition to concurrency, this second edition treats JavaScript as the serious application language it has become.</p>'},
  {id:7, slug:'100-ai-prompts', title:'100 AI Prompts That Work', sub:'Copy-paste prompts for writing, code & analysis', author:'The Bookshelf Lab', cat:'Technology', type:'free', price:0, list:9.99, rating:4.8, reviews:8730, pages:56, badge:'Free', bought:'24K downloaded this month', bg:'#364fc7', fg:'#edf2ff', ac:'#ffd814', pat:'p-dots',
   blurb:'One hundred battle-tested prompts with before/after examples. Updated for the 2026 model generation.', feat:['100 categorized prompts','Before/after output examples','Prompt-chaining recipes'],
   desc:'<p>The free starter edition of our annual AI Handbook. If it saves you ten minutes, tell a friend.</p>'},
  {id:8, slug:'personal-finance-blueprint', title:'Personal Finance Blueprint', sub:'Automate your money in one weekend', author:'Jordan Ellis', cat:'Finance', type:'paid', price:9.99, list:16.99, rating:4.6, reviews:1543, pages:158, badge:null, bought:'1.4K bought in past month', bg:'#5c940d', fg:'#f8ffe5', ac:'#232f3e', pat:'p-lines',
   blurb:'A one-weekend system: accounts, automation, and a set-and-forget investment plan in plain English.', feat:['The 5-account architecture','Automation flow diagrams','Net-worth tracker spreadsheet included'],
   desc:'<p>No crypto, no hustle. Just the boring, beautiful machinery of personal finance, set up in a single weekend.</p>'},
  {id:9, slug:'notion-os-mega-pack', title:'Notion OS: Mega Pack', sub:'The all-in-one life & business operating system', author:'TemplateForge', cat:'Productivity', type:'affiliate', partner:'Notion Market', partnerUrl:'#', price:39, list:null, rating:4.5, reviews:2210, pages:96, badge:'Partner Pick', bought:'3.4K bought in past month', bg:'#495057', fg:'#f8f9fa', ac:'#febd69', pat:'p-grid',
   blurb:'A complete Notion operating system plus a 96-page setup manual — sold through our partner Notion Market.', feat:['12 interlinked databases','Setup manual with video links','Quarterly review system'],
   desc:'<p>The companion manual to the best-selling Notion template pack of 2026.</p>'},
  {id:10, slug:'typography-for-screens', title:'Typography for Screens', sub:'Type systems for apps, dashboards & the web', author:'Ana Beatriz Costa', cat:'Design', type:'paid', price:15.00, list:null, rating:4.8, reviews:987, pages:174, badge:"Editor's Choice", bought:'980 bought in past month', bg:'#862e9c', fg:'#f8f0fc', ac:'#ffd814', pat:'p-rings',
   blurb:'Practical typographic systems: scales, hierarchy, variable fonts and accessibility — with 60 annotated screens.', feat:['Modular scale calculator tables','60 annotated UI screens','Variable font pairing guide','WCAG-safe contrast recipes'],
   desc:'<p>Stop guessing font sizes. This book gives you a repeatable system for type that reads beautifully at every breakpoint.</p>'},
  {id:11, slug:'habit-tracker-kit', title:'Habit Tracker Starter Kit', sub:'Printable trackers, streaks & reviews', author:'The Bookshelf Lab', cat:'Self-Help', type:'free', price:0, list:7.99, rating:4.7, reviews:4102, pages:38, badge:'Free', bought:'9K downloaded this month', bg:'#e67700', fg:'#fff9db', ac:'#232f3e', pat:'p-dots',
   blurb:'Beautiful printable habit trackers, monthly reviews and streak calendars. Print at home, start today.', feat:['12 tracker layouts','Monthly review pages','Streak calendar system'],
   desc:'<p>The printable companion to The Morning Reset — free for everyone, forever.</p>'},
  {id:12, slug:'python-for-analysts', title:'Python for Analysts', sub:'From spreadsheets to scripts in 30 days', author:'Dr. Samuel Adeyemi', cat:'Programming', type:'paid', price:21.99, list:29.99, rating:4.8, reviews:2870, pages:342, badge:'Best Seller', bought:'2.6K bought in past month', bg:'#0c8599', fg:'#e3fafc', ac:'#ffd814', pat:'p-blocks',
   blurb:'The gentlest serious path from Excel to Python: pandas, visualization and automation, taught with real datasets.', feat:['30-day structured curriculum','12 real datasets included','Excel-to-pandas translation tables','Automation recipes for boring reports'],
   desc:'<p>Written for analysts, not computer scientists. Every chapter starts from a spreadsheet problem you already have.</p>'},
  {id:13, slug:'creator-economy-report-2026', title:'Creator Economy Report 2026', sub:"Data on 4,000 creators' revenue & tools", author:'CreatorOS Press', cat:'Business', type:'affiliate', partner:'CreatorOS Press', partnerUrl:'#', price:49, list:null, rating:4.7, reviews:640, pages:118, badge:'Partner Pick', bought:'1.1K bought in past month', bg:'#131921', fg:'#febd69', ac:'#ff9900', pat:'p-lines',
   blurb:'The annual benchmark report: what 4,000 creators actually earn, spend and use in 2026. Partner exclusive.', feat:['Revenue benchmarks by niche','Tool-stack breakdowns','3-year trend charts'],
   desc:'<p>The report every creator newsletter quotes. Available exclusively through our partner CreatorOS Press.</p>'},
  {id:14, slug:'watercolor-warmups', title:'Watercolor Warm-ups', sub:'30 five-minute exercises for loose brushwork', author:'June Park', cat:'Design', type:'free', price:0, list:12.99, rating:4.9, reviews:3320, pages:64, badge:'Free', bought:'7K downloaded this month', bg:'#c2255c', fg:'#fff0f6', ac:'#ffd814', pat:'p-rings',
   blurb:'Loosen up your brush in five minutes a day. 30 graded exercises with photo references and palettes.', feat:['30 five-minute exercises','Printable reference photos','Mixing palette cards'],
   desc:'<p>From the author of the best-selling <i>Sketch Daily</i> — free as our gift to the maker community.</p>'},
  {id:15, slug:'negotiate-like-a-shark', title:'Negotiate Like a Shark', sub:'Scripts for salary, clients & everyday deals', author:'Rachel Kim, JD', cat:'Business', type:'paid', price:11.99, list:19.99, rating:4.5, reviews:1290, pages:148, badge:'Deal', bought:'1.7K bought in past month', bg:'#a61e4d', fg:'#fff5f5', ac:'#ffd814', pat:'p-lines',
   blurb:'Word-for-word scripts for the 20 negotiations that matter most — salary, scope, rent, rates and refunds.', feat:['20 word-for-word scripts','The "anchor & flinch" framework','Email templates for async negotiation'],
   desc:'<p>Readers report an average $6,300 return from one salary conversation. The book costs $11.99.</p>'},
  {id:16, slug:'figma-to-code', title:'Figma to Code Masterclass', sub:'Handoff workflows that developers love', author:'DevDesign Collective', cat:'Design', type:'affiliate', partner:'FigmaHub', partnerUrl:'#', price:25, list:null, rating:4.6, reviews:1105, pages:132, badge:'Partner Pick', bought:'1.3K bought in past month', bg:'#1971c2', fg:'#e7f5ff', ac:'#ffd814', pat:'p-grid',
   blurb:'Auto-layout, tokens and clean handoff: the workflow that ends the design-dev blame game. Via FigmaHub.', feat:['Token naming conventions','Auto-layout audit checklist','Handoff documentation templates'],
   desc:'<p>Sold through our partner FigmaHub with lifetime updates and the companion Figma community file.</p>'},
  {id:17, slug:'the-sleep-fix', title:'The Sleep Fix', sub:'Sleep better in 14 nights — without supplements', author:'Dr. Amara Diallo', cat:'Health', type:'paid', price:8.99, list:14.99, rating:4.6, reviews:2054, pages:132, badge:null, bought:'2.1K bought in past month', bg:'#3b5bdb', fg:'#edf2ff', ac:'#febd69', pat:'p-dots',
   blurb:'A CBT-I based 14-night protocol: wind-down routines, light hygiene and the 20-minute rule that actually works.', feat:['14-night guided protocol','Printable sleep diary','The 20-minute rule, explained'],
   desc:'<p>Based on cognitive behavioral therapy for insomnia — the gold standard — minus the clinic waitlist.</p>'},
  {id:18, slug:'sql-cheat-sheets', title:'SQL Cheat Sheet Collection', sub:'Every query pattern on one beautiful page', author:'The Bookshelf Lab', cat:'Programming', type:'free', price:0, list:6.99, rating:4.8, reviews:6540, pages:24, badge:'Free', bought:'15K downloaded this month', bg:'#495057', fg:'#e9ecef', ac:'#ffa94d', pat:'p-grid',
   blurb:'Eight gorgeous one-page cheat sheets: joins, window functions, CTEs, performance and more. Print & pin.', feat:['8 one-page reference sheets','Window function visualizer','Index & performance quick rules'],
   desc:'<p>The sheets pinned above 40,000 desks worldwide. Free, printable, forever.</p>'},
  {id:19, slug:'email-sequences-that-sell', title:'Email Sequences That Sell', sub:'12 plug-and-play flows for product businesses', author:'Marcus Webb', cat:'Marketing', type:'paid', price:17.99, list:27.99, rating:4.7, reviews:1420, pages:168, badge:null, bought:'1.2K bought in past month', bg:'#087f5b', fg:'#e6fcf5', ac:'#ffd814', pat:'p-blocks',
   blurb:'Welcome, launch, cart-abandon, win-back: 12 complete flows with subject lines tested on 2M subscribers.', feat:['12 complete sequence flows','94 tested subject lines','Deliverability quick-start guide'],
   desc:'<p>Copy the flows, swap in your voice, ship this week. Median reported lift: +31% email revenue in 60 days.</p>'},
  {id:20, slug:'ai-handbook-2026', title:'The 2026 AI Handbook', sub:'Models, prompts & workflows that matter this year', author:'The Bookshelf Lab', cat:'Technology', type:'paid', price:27.00, list:45.00, rating:4.9, reviews:3890, pages:512, badge:'#1 New Release', bought:'5.6K bought in past month', bg:'#0f2a43', fg:'#a5d8ff', ac:'#ff9900', pat:'p-blocks',
   blurb:'The quarterly-updated reference for working with AI in 2026 — 512 pages of what actually works.', feat:['Every major model compared','Prompt pattern library (200+)','Team workflow playbooks','Free quarterly updates for life'],
   desc:'<p>One handbook instead of 400 newsletters. Updated every quarter; your purchase includes every future edition.</p>'},
];

export const byId = (id: number): Product | undefined => P.find(p => p.id === id);
export const bySlug = (s: string): Product | undefined => P.find(p => p.slug === s);
