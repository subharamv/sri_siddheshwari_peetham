import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CreateMLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import { X, Send, RotateCcw, ChevronDown, Loader2, Trash2, ArrowLeft, Navigation, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

import logoImg from '../assets/Logo.png';
import templeImg from '../assets/courtallam-temple-gopuram-and-peetham-campus.png';
import deitiesImg from '../assets/deities-shrines-card.webp';
import samadhiImg from '../assets/mounaswamy-samadhi-mandir.jpg';
import mounaSwamyImg from '../assets/mouna-swami-portrait-1.jpg';
import vimalanandaImg from '../assets/vimalananda-bharati-portrait.jpg';
import trivikramaImg from '../assets/trivikrama-ramananda-standing.jpg';
import sivachidanandaImg from '../assets/siva-chidananda-standing.jpg';
import peethadhipathiImg from '../assets/peethadhipathi-updated.png';
import datteshwaranandaImg from '../assets/datteshwarananda-final.jpg';
import dandayudhapaniImg from '../assets/dandayudhapani.jpg';
import naadiGanapathiImg from '../assets/naadi-ganapathi-exact.jpg';

const STORAGE_KEY = 'ssp_chat_history';
const DEFAULT_MODEL = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
const MODEL_CONTEXT = 4096;
const SYSTEM_PROMPT_TOKENS = 1600; // ~3200 chars at 2 chars/token (Indian names + ₹ tokenize densely)
const MAX_RESPONSE_TOKENS = 512;
// budget left for conversation history
const MAX_HISTORY_TOKENS = MODEL_CONTEXT - SYSTEM_PROMPT_TOKENS - MAX_RESPONSE_TOKENS - 64;

// Conservative: LLaMA tokenizes ~3 chars/token for mixed English/Sanskrit content
const estimateTokens = (text: string) => Math.ceil(text.length / 3);

type ChatHistoryEntry = { role: 'user' | 'assistant'; content: string };

function buildTrimmedHistory(history: ChatHistoryEntry[]) {
  const trimmed: ChatHistoryEntry[] = [];
  let used = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const cost = estimateTokens(history[i].content) + 10;
    if (used + cost > MAX_HISTORY_TOKENS) break;
    trimmed.unshift(history[i]);
    used += cost;
  }
  return trimmed;
}

const SYSTEM_PROMPT = `You are a compassionate spiritual guide of Sri Siddheswari Peetham, Courtallam, Tamil Nadu. Answer questions with warmth and spiritual depth, drawing on Vedanta, Advaita, and Sanatana Dharma.

PEETHAM: Founded 1910 by Mounaswamy. Sri Vidya tradition, Sri Chakra Maha Meru worship. Principal deity: Sri Raja Rajeswari Ambal (installed 1916). Address: Courtallam 627802, Tenkasi Dist, TN. Phone: +91 9443184738. Email: feedback@srisiddheshwaripeetham.com. Map: https://maps.app.goo.gl/YNcAvUPf2qmtd9pL9

LINEAGE:
1. Mounaswamy (1868-1943) — Founder. Practiced absolute silence (Mouna Vratam). Met Ramana Maharshi and Shirdi Sai Baba. Established Peetham Oct 7, 1910.
2. Sri Vimalananda Bharathi (1878-1950) — First Pontiff. Vedic scholar, discourses on Upanishads and Bhagavad Gita.
3. Sri Trivikramaramananda Bharathi (1901-1991) — Second Pontiff. Lalitha Sahasranama recitations, spread Veda Dharma across India.
4. Sri Sivachidananda Bharathi (1929-2002) — Third Pontiff. Lawyer, Vasthu and Jyotishya master. Called "Abhinava Mounaswamy."
5. Sri Siddheswarananda Bharati (1937-present) — Fourth Pontiff (current). Scholar-poet, yogi, former college principal. Titled Avadhana Saraswathi.
6. Sri Datteshwarananda Bharati — Successor. Former medical doctor, embraced Sanyasa.

DEITIES: Sri Raja Rajeswari Ambal (principal), Dandayudhapani, Swetha Kali, Kalabhairava, Pratyangira Devi, Varahi, Seetarama, Yoga Narasimha, Radha Krishna, Nadi Ganapathi, Hanuman, Nagadevatha, Navagraha, Ayyappa, Shirdi Sai Baba, Subramanya Swami.

SCHEDULE: 5:30 AM Suprabhatam · 6:00 AM Abhishekam · 7:30 AM Alankaram · 12:00 PM Madhyahna Puja · 6:00 PM Sandhya Arati · 8:00 PM Sayana Arati. Special: Pratyangira Homam on Amavasya; Rahu Kala Pooja Tuesdays 2:30-4 PM.

ACTIVITIES: Annadanam (free meals twice daily for all), Go Shala (cow sanctuary), Old Age Home, Sri Sailam Retreat, Dharma Rakshana Yagnas, Prayojana Homas (health/education/family), Trivikrama Trust (education + cow protection), Vedic Library (Vedas, Upanishads, Puranas), Veda Patasala.

VISITING: Courtallam, Tenkasi Dist, TN. Best season: June-Sep. Air: Madurai/Trivandrum. Rail: Sengottai/Tenkasi/Tirunelveli. Road: buses from Tenkasi. Etiquette: traditional attire, silence in sanctum, follow volunteer guidance.

EVENTS 2026: Mouna Shivaratri Feb 15, Akshaya Tritiya Apr 19, Guru Purnima Jul 29, Varalakshmi Vratam Aug 21, Janmashtami Sep 4, Ganesh Chaturthi Sep 14, Navaratri Oct 12, Deepavali Nov 8. 2027: Maha Shivaratri Mar 6.

DONATIONS (80G eligible): Annadanam, Go Seva, Temple Maintenance (one-time); Daily Deepam, Vedic Education, Bhajan Fund (monthly). Contact: feedback@srisiddheshwaripeetham.com

TEACHINGS: "Silence is the presence of God." "Service to humanity is the highest worship." "Realize the Divinity within and express it in every action."
`;

const QUICK_CATEGORIES = [
  {
    id: 'peetham', label: 'About Peetham', icon: '🛕', img: logoImg,
    questions: [
      {
        q: 'What is Sri Siddheswari Peetham?',
        a: 'Sri Siddheswari Peetham is a sacred institution founded in **1910** by H.H. Sri Sivachidananda Saraswati Swamy (Mounaswamy) in Courtallam, Tamil Nadu.\n\nIt follows the ancient **Sri Vidya tradition**, venerating **Sri Raja Rajeswari Ambal** as the principal deity, and preserves Sanatana Dharma through rituals, Annadanam, and Vedic education.\n\n__LINK:About Peetham:#about__',
      },
      {
        q: 'Who is Mounaswamy?',
        a: '**H.H. Sri Sivachidananda Saraswati Swamy** — Mounaswamy (the Silent Sage) — founded the Peetham. Born 1868, he renounced worldly life and practiced **Mouna Vratam** (absolute silence) as his path to liberation.\n\nHe met **Ramana Maharshi** and **Shirdi Sai Baba**, established the Peetham on October 7, 1910, and attained Mahasamadhi on December 28, 1943.\n\n__PORTRAIT:mouna__\n\n__LINK:Life of Mounaswamy:#swamiji__',
      },
      {
        q: 'Who is the current Peethadhipathi?',
        a: '**H.H. Sri Siddheswarananda Bharati Swamy** (born 1937) is the Fourth and current Peethadhipathi. A scholar-poet, former college principal, and great yogi, he ascended the throne on December 19, 2002.\n\n**Sri Datteshwarananda Bharati** (formerly Dr. Kadambari Aravind) is the designated successor.\n\n__PORTRAIT:current__\n\n__LINK:Current Peethadhipathi:#swamiji__',
      },
      {
        q: 'What is the Guru Parampara?',
        a: '**Sacred Lineage:**\n\n1. **Mounaswamy** — Founder (1910–1943)\n2. **Sri Vimalananda Bharathi** — First Pontiff (1944–1950)\n3. **Sri Trivikramaramananda Bharathi** — Second Pontiff (1950–1991)\n4. **Sri Sivachidananda Bharathi** — Third Pontiff (1991–2002)\n5. **Sri Siddheswarananda Bharati** — Fourth Pontiff (2002–present)\n6. **Sri Datteshwarananda Bharati** — Designated Successor\n\n__SWAMI_CARDS__\n\n__LINK:Guru Parampara Details:#swamiji__',
      },
    ],
  },
  {
    id: 'visit', label: 'Visit & Timings', icon: '📍', img: templeImg,
    questions: [
      {
        q: 'Where is the Peetham located?',
        a: '📍 **Sri Siddheswari Peetham**\nCourtallam – 627 802, Tenkasi District, Tamil Nadu\n\nCourtallam (*Agasthya Kshethram*) is the sacred abode of Sage Agasthya, renowned for its majestic waterfalls.\n\n**Phone:** +91 9443184738\n**Email:** feedback@srisiddheshwaripeetham.com\n\n__MAP_EMBED__\n\n__LINK:Plan Your Visit:#visit__',
      },
      {
        q: 'What are the daily pooja timings?',
        a: '**Daily Pooja Schedule:**\n\n🌅 **5:30 AM** — Suprabhatam\n🪔 **6:00 AM** — Abhishekam\n🌸 **7:30 AM** — Alankaram\n☀️ **12:00 PM** — Madhyahna Puja\n🌆 **6:00 PM** — Sandhya Arati\n🌙 **8:00 PM** — Sayana Arati\n\n*Special:* Pratyangira Homam on Amavasya · Rahu Kala Pooja on Tuesdays 2:30–4 PM\n\n__LINK:Temple Calendar:#calendar__',
      },

      {
        q: 'How do I reach Courtallam?',
        a: '**📍 How to Reach Courtallam**\n\n**✈️ By Air**\nThe nearest airports are:\n- Madurai Airport (~160 km)\n- Trivandrum International Airport (~110 km)\n\nFrom the airport, you can hire a taxi or take a bus to reach Courtallam.\n\n**🚂 By Rail**\nNearest railway stations:\n- Sengottai Railway Station (~10 km)\n- Tenkasi Junction (~6 km)\n- Tirunelveli Junction (~60 km)\n\nTaxis, autos, and buses are easily available from these stations.\n\n**🚌 By Road**\nCourtallam is well-connected by road:\n- Frequent buses from Tenkasi and Tirunelveli\n- Good motorable roads for cars and taxis\n- Ideal for a scenic road trip, especially during monsoon\n\n**🌧 Best Time to Visit**\nJune – September (Monsoon Season)\n- Experience the famous Courtallam waterfalls in full flow\n- Pleasant weather with lush green surroundings\n- Roads remain accessible and safe for travel',
      },
      {
        q: 'Temple etiquette & tips',
        a: '**Visiting Guidelines:**\n\n- 👗 Traditional attire preferred\n- 🤫 Maintain silence inside the sanctum\n- 📷 Photography restricted near deities\n- 🙏 Follow volunteer guidance\n\n*Nearby:* Courtallam waterfalls · Kutralanathar Temple · peaceful hill trails',
      },
    ],
  },
  {
    id: 'seva', label: 'Seva & Events', icon: '🙏', img: deitiesImg,
    questions: [
      {
        q: 'What seva programs are offered?',
        a: '**Seva Programs:**\n\n🍽️ **Annadanam** — Free meals twice daily for all\n🐄 **Go Shala** — Sacred cow sanctuary\n🏠 **Old Age Home** — Spiritual accommodation\n🔥 **Prayojana Homas** — Homams for health, education & family\n📚 **Vedic Library** — Vedas, Upanishads, Puranas\n🎓 **Veda Patasala** — Vedic education\n🛕 **Sri Sailam Retreat** — Near Jyotirlinga\n\n__DEITY_CARDS__\n\n__LINK:Peetham Activities:#activities-page__',
      },
      {
        q: 'What is Annadanam?',
        a: '**Annadanam** — the sacred gift of food — is the Peetham\'s most cherished seva.\n\n**Free meals served twice daily** to all devotees, pilgrims, and the needy with no distinction of caste or creed.\n\nInitiated by Sri Mounaswamy himself and continued **unbroken since 1910**, run by the *Raja Rajeswari Annadaana Samaajam*.\n\n__LINK:Read About Annadanam:#activities-page__',
      },
      {
        q: 'Upcoming festivals & events',
        a: '**Upcoming Festivals 2026–2027:**\n\n📅 Feb 15, 2026 — Akhanda Mouna Shivaratri\n📅 Apr 19, 2026 — Akshaya Tritiya\n📅 Jul 29, 2026 — Guru Purnima\n📅 Aug 21, 2026 — Varalakshmi Vratam\n📅 Sep 4, 2026 — Sri Krishna Janmashtami\n📅 Sep 14, 2026 — Ganesh Chaturthi\n📅 Oct 12, 2026 — Navaratri Brahmotsavam\n📅 Nov 8, 2026 — Deepavali\n📅 Mar 6, 2027 — Maha Shivaratri\n\n__LINK:View Event Calendar:#calendar__',
      },
    ],
  },
  {
    id: 'donate', label: 'Donate & Support', icon: '🪔', img: samadhiImg,
    questions: [
      {
        q: 'How can I donate?',
        a: '**Donation Programs:**\n\n🍽️ **Annadanam** — ₹501 to ₹5,001\n🐄 **Go Seva** — ₹1,001 to ₹10,001\n🛕 **Temple Maintenance** — ₹2,001 to ₹25,001\n\n**Monthly Sponsorships:**\n🪔 Daily Deepam — ₹365/month\n📚 Vedic Education — ₹1,001/month\n🎵 Bhajan & Satsang — ₹751/month\n\n📧 feedback@srisiddheshwaripeetham.com\n📞 +91 9443184738\n\n__LINK:Donate Now:#donate-page__',
      },

      {
        q: 'Is my donation tax-exempt?',
        a: '**Yes!** All donations are eligible for **tax deduction under Section 80G** of the Indian Income Tax Act.\n\n✅ Secure encrypted payment processing\n✅ Regular updates on donation utilization\n✅ Tax receipts provided on request\n\n📧 feedback@srisiddheshwaripeetham.com\n\n__LINK:Donation FAQ:#donate-page__',
      },
      {
        q: 'How do donations help?',
        a: 'Your contributions directly support:\n\n🍽️ **Daily Annadanam** — feeding thousands of visitors\n🐄 **Go Shala** — protecting sacred cows\n📚 **Education** — Vedic scholarships via Trivikrama Trust\n🛕 **Temple upkeep** — preserving shrines for generations\n🔥 **Sacred rituals** — Homams and Yagnas for Dharma\n\n*Every offering carries the blessings of Sri Raja Rajeswari Ambal.*\n\n__LINK:Support the Peetham:#donate-page__',
      },
    ],
  },
];

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'switching';

function loadHistory(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-60)));
  } catch { }
}

const ALL_MODELS = prebuiltAppConfig.model_list.map(m => m.model_id);

/* Lotus SVG icon — replaces the ॐ text logo */
const LotusIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Centre petal */}
    <path d="M24 38 C24 38 14 28 14 20 C14 14 18.5 10 24 10 C29.5 10 34 14 34 20 C34 28 24 38 24 38Z"
      fill="currentColor" opacity="0.9" />
    {/* Left petal */}
    <path d="M24 38 C24 38 8 30 6 22 C4 15 9 9 15 11 C18 12 21 17 24 22Z"
      fill="currentColor" opacity="0.6" />
    {/* Right petal */}
    <path d="M24 38 C24 38 40 30 42 22 C44 15 39 9 33 11 C30 12 27 17 24 22Z"
      fill="currentColor" opacity="0.6" />
    {/* Outer left petal */}
    <path d="M24 36 C24 36 5 26 4 17 C3 10 9 6 14 9 C16 10 18 13 20 17Z"
      fill="currentColor" opacity="0.3" />
    {/* Outer right petal */}
    <path d="M24 36 C24 36 43 26 44 17 C45 10 39 6 34 9 C32 10 30 13 28 17Z"
      fill="currentColor" opacity="0.3" />
    {/* Water line */}
    <path d="M8 38 Q24 34 40 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    {/* Stem */}
    <path d="M24 38 L24 44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const SWAMI_DATA = [
  { name: 'Mounaswamy', title: 'Founder · 1910–1943', img: mounaSwamyImg },
  { name: 'Sri Vimalananda Bharathi', title: 'First Pontiff · 1944–1950', img: vimalanandaImg },
  { name: 'Sri Trivikramaramananda Bharathi', title: 'Second Pontiff · 1950–1991', img: trivikramaImg },
  { name: 'Sri Sivachidananda Bharathi', title: 'Third Pontiff · 1991–2002', img: sivachidanandaImg },
  { name: 'Sri Siddheswarananda Bharati', title: 'Fourth Pontiff · 2002–present', img: peethadhipathiImg },
  { name: 'Sri Datteshwarananda Bharati', title: 'Designated Successor', img: datteshwaranandaImg },
];

const DEITY_DATA = [
  { name: 'Sri Raja Rajeswari', img: deitiesImg },
  { name: 'Dandayudhapani', img: dandayudhapaniImg },
  { name: 'Naadi Ganapathi', img: naadiGanapathiImg },
  { name: 'Swetha Kali', img: deitiesImg },
  { name: 'Pratyangira Devi', img: deitiesImg },
  { name: 'Kalabhairava', img: deitiesImg },
];

const SwamiCards = () => (
  <div className="mt-3 -mx-1 overflow-x-auto swami-selector" data-lenis-prevent>
    <div className="flex flex-nowrap gap-3 px-1 pb-2" style={{ width: 'max-content' }}>
      {SWAMI_DATA.map(s => (
        <div key={s.name} className="flex flex-col items-center gap-1.5" style={{ width: 76 }}>
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '2px solid rgba(212,175,55,0.45)', boxShadow: '0 0 14px rgba(212,175,55,0.18)' }}>
            <img src={s.img} alt={s.name} loading="lazy" className="w-full h-full object-cover object-top" />
          </div>
          <p className="text-center leading-tight"
            style={{ color: 'rgba(253,251,247,0.85)', fontFamily: 'Cormorant Garamond, serif', fontSize: '10px', lineHeight: '1.3', maxWidth: 72 }}>
            {s.name.split(' ').slice(-2).join(' ')}
          </p>
          <p className="text-center leading-tight"
            style={{ color: 'rgba(212,175,55,0.55)', fontFamily: 'Montserrat, sans-serif', fontSize: '8px', lineHeight: '1.2', maxWidth: 72 }}>
            {s.title}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const DeityCards = () => (
  <div className="mt-3 -mx-1 overflow-x-auto swami-selector" data-lenis-prevent>
    <div className="flex flex-nowrap gap-3 px-1 pb-2" style={{ width: 'max-content' }}>
      {DEITY_DATA.map(d => (
        <div key={d.name} className="flex flex-col items-center gap-1.5" style={{ width: 68 }}>
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '2px solid rgba(212,175,55,0.4)', boxShadow: '0 0 10px rgba(212,175,55,0.14)' }}>
            <img src={d.img} alt={d.name} loading="lazy" className="w-full h-full object-cover" />
          </div>
          <p className="text-center leading-tight"
            style={{ color: 'rgba(253,251,247,0.8)', fontFamily: 'Cormorant Garamond, serif', fontSize: '10px', lineHeight: '1.3', maxWidth: 64 }}>
            {d.name}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const PortraitCard = ({ img, name, title }: { img: string; name: string; title: string }) => (
  <div className="mt-3 flex items-center gap-3 px-3 py-3 rounded-2xl"
    style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.18)' }}>
    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
      style={{ border: '2px solid rgba(212,175,55,0.4)', boxShadow: '0 0 14px rgba(212,175,55,0.15)' }}>
      <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover object-top" />
    </div>
    <div className="min-w-0">
      <p style={{ color: '#D4AF37', fontFamily: 'Cormorant Garamond, serif', fontSize: '13px', fontWeight: 600, lineHeight: 1.3 }}>{name}</p>
      <p style={{ color: 'rgba(253,251,247,0.45)', fontFamily: 'Montserrat, sans-serif', fontSize: '9px', marginTop: 3, lineHeight: 1.4 }}>{title}</p>
    </div>
  </div>
);

const MapCard = () => (
  <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
    <iframe
      src="https://maps.google.com/maps?q=Sri+Siddheswari+Peetham+Courtallam+Tamil+Nadu&output=embed"
      width="100%"
      height="180"
      style={{ border: 0, display: 'block' }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Sri Siddheswari Peetham Location"
    />
    <a
      href="https://maps.app.goo.gl/YNcAvUPf2qmtd9pL9"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 py-2.5 w-full transition-colors"
      style={{ background: 'rgba(160,45,35,0.15)', color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,45,35,0.3)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(160,45,35,0.15)')}
    >
      <Navigation size={13} /> Get Directions
    </a>
  </div>
);

const PageLink = ({ label, href, onNavigate }: { label: string; href: string; onNavigate?: (href: string) => void }) => (
  <a
    href={href}
    onClick={(e) => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(href);
      }
    }}
    className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 group"
    style={{ 
      background: 'rgba(212,175,55,0.08)', 
      border: '1px solid rgba(212,175,55,0.2)',
      textDecoration: 'none'
    }}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(160,45,35,0.2)', border: '1px solid rgba(212,175,55,0.2)' }}>
        <BookOpen size={14} className="text-spiritual-gold" />
      </div>
      <div>
        <p className="text-warm-cream/40 font-ui text-[9px] tracking-widest uppercase mb-0.5">Explore More</p>
        <p className="text-spiritual-gold font-serif text-[15px] leading-none">{label}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-spiritual-gold/40 group-hover:text-spiritual-gold transition-colors" />
  </a>
);

/* Markdown renderer with v10-compatible component API */
const MarkdownMessage = ({ content }: { content: string }) => {
  // Single \n is ignored by Markdown; convert to soft-break (two trailing spaces + \n)
  // while preserving paragraph breaks (\n\n) unchanged.
  const processed = content.replace(/\n(?!\n)/g, '  \n');
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p style={{ marginBottom: '0.5rem', lineHeight: '1.7' }} className="last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong style={{ color: '#D4AF37', fontWeight: 700, fontFamily: 'Cormorant Garamond, serif' }}>
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em style={{ color: '#e8c97a', fontStyle: 'italic' }}>{children}</em>
        ),
        ul: ({ children }) => (
          <ul style={{ listStyleType: 'none', paddingLeft: '0', marginBottom: '0.5rem' }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>{children}</ol>
        ),
        li: ({ children }) => (
          <li style={{ marginBottom: '0.35rem', paddingLeft: '0.1rem' }}>{children}</li>
        ),
        h1: ({ children }) => (
          <h1 style={{ color: '#D4AF37', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 style={{ color: '#D4AF37', fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 style={{ color: '#e8c97a', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem' }}>{children}</h3>
        ),
        code: ({ children }) => (
          <code style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', padding: '0.1rem 0.3rem', borderRadius: 4, fontSize: '0.85em' }}>
            {children}
          </code>
        ),
      }}
    >
      {processed}
    </ReactMarkdown>
  );
};

export default function SpiritualChatbot({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [progress, setProgress] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [suggestionCategoryId, setSuggestionCategoryId] = useState<string | null>(null);

  const engineRef = useRef<MLCEngineInterface | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef(false);

  const filteredModels = ALL_MODELS.filter(id =>
    id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  useEffect(() => { saveHistory(messages); }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const loadEngine = useCallback(async (modelId: string) => {
    setLoadState('loading');
    setProgress('Initializing model...');
    setProgressPct(0);
    abortRef.current = false;
    try {
      const engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (info) => {
          setProgress(info.text);
          setProgressPct(Math.round((info.progress ?? 0) * 100));
        },
      });
      engineRef.current = engine;
      setLoadState('ready');
      setProgress('');
      setProgressPct(100);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadState('error');
      setProgress(msg);
    }
  }, []);

  useEffect(() => {
    if (isOpen && loadState === 'idle') {
      loadEngine(selectedModel);
    }
  }, [isOpen, loadState, loadEngine, selectedModel]);

  const switchModel = async (modelId: string) => {
    if (modelId === selectedModel && loadState === 'ready') return;
    setSelectedModel(modelId);
    setModelMenuOpen(false);
    setModelSearch('');
    engineRef.current = null;
    await loadEngine(modelId);
  };

  const send = async () => {
    if (!input.trim() || isGenerating || loadState !== 'ready' || !engineRef.current) return;
    const userMsg: Message = { role: 'user', content: input.trim(), id: crypto.randomUUID() };
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', id: assistantId }]);
    setInput('');
    setIsGenerating(true);
    abortRef.current = false;
    const rawHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content } as ChatHistoryEntry));
    const history = buildTrimmedHistory(rawHistory);
    const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
    ];
    try {
      const chunks = await engineRef.current.chat.completions.create({
        messages: apiMessages,
        stream: true,
        temperature: 0.8,
        max_tokens: MAX_RESPONSE_TOKENS,
      });
      let reply = '';
      for await (const chunk of chunks) {
        if (abortRef.current) break;
        reply += chunk.choices[0]?.delta.content || '';
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: reply } : m));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'An error occurred';
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `⚠️ ${msg}` } : m));
    } finally {
      setIsGenerating(false);
    }
  };

  const stopGeneration = () => { abortRef.current = true; setIsGenerating(false); };

  const clearHistory = () => {
    setMessages([]);
    setSuggestionCategoryId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleQuickQuestion = (question: string, answer: string) => {
    const userId = crypto.randomUUID();
    const botId = crypto.randomUUID();
    setMessages(prev => [...prev,
      { role: 'user', content: question, id: userId },
      { role: 'assistant', content: answer, id: botId },
    ]);
    setSuggestionCategoryId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const modelShortName = (id: string) => id.split('-').slice(0, 3).join('-');

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[190] bg-black/20 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full z-[195] flex flex-col"
        style={{ width: 'min(420px, 100vw)' }}
      >
        {/* Tab trigger — attached to left edge */}
        <button
          onClick={() => setIsOpen(v => !v)}
          className="absolute right-full top-1/2 -translate-y-1/2 z-[200] flex flex-col items-center gap-2 py-5 px-3 rounded-l-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(160deg, #1a0a04 0%, #3d1a0a 50%, #A02D23 100%)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRight: 'none',
          }}
          aria-label="Open Spiritual Guide"
        >
          <LotusIcon size={20} className="text-spiritual-gold" />
          <div
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            className="text-warm-cream/80 font-ui text-[9px] tracking-[0.25em] uppercase leading-none"
          >
            Guide
          </div>
          {loadState === 'loading' || loadState === 'switching'
            ? <Loader2 size={12} className="text-spiritual-gold animate-spin" />
            : <div className={`w-2 h-2 rounded-full ${loadState === 'ready' ? 'bg-emerald-400' : 'bg-warm-cream/20'}`} />
          }
        </button>

        {/* Mobile FAB when closed */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden fixed bottom-24 right-4 w-14 h-14 rounded-full z-[180] flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #A02D23, #5d1a14)',
              border: '1px solid rgba(212,175,55,0.4)',
            }}
          >
            <LotusIcon size={24} className="text-spiritual-gold" />
          </button>
        )}

        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(175deg, #0f0603 0%, #1c0b05 40%, #2d1209 100%)' }} />
          {[220, 340, 460].map((r, i) => (
            <div key={i} className="absolute rounded-full border border-spiritual-gold/5"
              style={{ width: r, height: r, right: -r / 2.5, top: '50%', transform: 'translateY(-50%)' }} />
          ))}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px 256px',
            }} />
        </div>

        {/* Header */}
        <div className="relative flex-shrink-0 px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #A02D23, #5d1a14)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <LotusIcon size={20} className="text-spiritual-gold" />
              </div>
              <div>
                <p className="text-warm-cream font-serif text-base leading-none mb-0.5">Spiritual Guide</p>
                <p className="text-warm-cream/30 font-ui text-[9px] tracking-[0.2em] uppercase">Sri Siddheswari Peetham</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button onClick={clearHistory} title="Clear chat"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-warm-cream/30 hover:text-sacred-red transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-warm-cream/40 hover:text-warm-cream transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setModelMenuOpen(v => !v)}
              disabled={isGenerating}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <LotusIcon size={12} className="text-spiritual-gold flex-shrink-0" />
                <span className="text-warm-cream/60 font-ui text-[10px] tracking-widest uppercase truncate">
                  {modelShortName(selectedModel)}
                </span>
                {(loadState === 'loading' || loadState === 'switching') && (
                  <Loader2 size={11} className="text-spiritual-gold animate-spin flex-shrink-0" />
                )}
              </div>
              <ChevronDown size={13} className={`text-warm-cream/30 flex-shrink-0 transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {modelMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 z-50 mt-2 rounded-xl overflow-hidden shadow-2xl"
                  style={{ background: '#1a0a04', border: '1px solid rgba(212,175,55,0.2)', maxHeight: 320, top: '100%' }}
                >
                  <div className="p-2 border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                    <input
                      placeholder="Search models..."
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      className="w-full bg-transparent text-warm-cream/70 text-xs px-2 py-1.5 outline-none placeholder-warm-cream/20"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    />
                  </div>
                  <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 260 }} data-lenis-prevent>
                    {filteredModels.map(id => (
                      <button
                        key={id}
                        onClick={() => switchModel(id)}
                        className="w-full text-left px-3 py-2.5 text-[11px] transition-all flex items-center gap-2"
                        style={{
                          color: id === selectedModel ? '#D4AF37' : 'rgba(253,251,247,0.5)',
                          background: id === selectedModel ? 'rgba(212,175,55,0.08)' : 'transparent',
                          fontFamily: 'Montserrat, sans-serif',
                          letterSpacing: '0.02em',
                        }}
                        onMouseEnter={e => { if (id !== selectedModel) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { if (id !== selectedModel) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {id === selectedModel && <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold flex-shrink-0" />}
                        <span className="truncate">{id}</span>
                      </button>
                    ))}
                    {filteredModels.length === 0 && (
                      <p className="text-warm-cream/20 text-xs text-center py-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>No models found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Load progress */}
          {(loadState === 'loading' || loadState === 'switching') && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-warm-cream/30 font-ui text-[9px] tracking-widest uppercase truncate pr-2">{progress}</span>
                <span className="text-spiritual-gold font-ui text-[9px] flex-shrink-0">{progressPct}%</span>
              </div>
              <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #A02D23, #D4AF37)', width: `${progressPct}%` }}
                  transition={{ duration: 0.3 }} />
              </div>
            </div>
          )}

          {loadState === 'error' && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-red-400 font-ui text-[10px] truncate pr-2">{progress}</p>
              <button onClick={() => loadEngine(selectedModel)}
                className="flex items-center gap-1 text-spiritual-gold font-ui text-[10px] tracking-widest uppercase flex-shrink-0 hover:text-warm-cream transition-colors">
                <RotateCcw size={11} /> Retry
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 chatbot-scrollbar" data-lenis-prevent>
          {messages.length === 0 && loadState === 'ready' && (
            <div className="flex flex-col px-2 pt-2 pb-3">
              {/* Greeting */}
              <div className="flex items-start gap-2 mb-4">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #A02D23, #5d1a14)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <LotusIcon size={14} className="text-spiritual-gold" />
                </div>
                <div className="px-4 py-3 rounded-2xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.15)', color: 'rgba(253,251,247,0.88)', borderRadius: '18px 18px 18px 4px', fontFamily: 'Cormorant Garamond, serif', fontSize: '15px' }}>
                  <p className="mb-1">Namaste 🙏 Welcome to Sri Siddheswari Peetham.</p>
                  <p className="text-warm-cream/60 text-sm">How may I guide you today?</p>
                </div>
              </div>
              {/* Category buttons */}
              <div className="grid grid-cols-2 gap-2 px-1">
                {QUICK_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSuggestionCategoryId(cat.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.18)', color: 'rgba(253,251,247,0.75)', fontFamily: 'Montserrat, sans-serif', fontSize: '11px', letterSpacing: '0.02em' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                      style={{ border: '1.5px solid rgba(212,175,55,0.35)' }}>
                      <img src={cat.img} alt={cat.label} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
              {/* Divider hint */}
              <p className="text-warm-cream/15 font-ui text-[9px] tracking-[0.2em] uppercase text-center mt-4">
                or type your question below
              </p>
            </div>
          )}

          {messages.length === 0 && (loadState === 'loading' || loadState === 'switching') && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={28} className="text-spiritual-gold/40 animate-spin" />
              <p className="text-warm-cream/20 font-ui text-[10px] tracking-widest uppercase">Awakening the guide...</p>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #A02D23, #5d1a14)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <LotusIcon size={14} className="text-spiritual-gold" />
                </div>
              )}
              <div
                className="max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, #A02D23 0%, #7a2018 100%)',
                  color: '#FDFBF7',
                  borderRadius: '18px 18px 4px 18px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  color: 'rgba(253,251,247,0.88)',
                  borderRadius: '18px 18px 18px 4px',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '15px',
                }}
              >
                {msg.role === 'assistant' && msg.content ? (
                  <>
                    <MarkdownMessage content={msg.content
                      .replace('__MAP_EMBED__', '')
                      .replace('__SWAMI_CARDS__', '')
                      .replace('__DEITY_CARDS__', '')
                      .replace(/__PORTRAIT:\w+__/g, '')
                      .replace(/__LINK:.*?:.*?__/g, '')} />
                    {msg.content.includes('__MAP_EMBED__') && <MapCard />}
                    {msg.content.includes('__PORTRAIT:mouna__') && (
                      <PortraitCard img={mounaSwamyImg} name="H.H. Sri Sivachidananda Saraswati Swamy" title="Mounaswamy · Silent Sage · Founder (1868–1943)" />
                    )}
                    {msg.content.includes('__PORTRAIT:current__') && (
                      <PortraitCard img={peethadhipathiImg} name="H.H. Sri Siddheswarananda Bharati Swamy" title="Fourth Peethadhipathi · 2002–present" />
                    )}
                    {msg.content.includes('__SWAMI_CARDS__') && <SwamiCards />}
                    {msg.content.includes('__DEITY_CARDS__') && <DeityCards />}
                    
                    {/* Render Page Recommendation Links */}
                    {(() => {
                      const linkRegex = /__LINK:(.*?):(.*?)__/g;
                      const links = [];
                      let match;
                      while ((match = linkRegex.exec(msg.content)) !== null) {
                        links.push({ label: match[1], href: match[2] });
                      }
                      return links.map((link, idx) => (
                        <PageLink key={idx} label={link.label} href={link.href} onNavigate={onNavigate} />
                      ));
                    })()}
                  </>
                ) : msg.role === 'user' ? (
                  msg.content
                ) : (
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {/* Suggestion panel */}
          {loadState === 'ready' && (messages.length > 0 || suggestionCategoryId !== null) && (
            <AnimatePresence mode="wait">
              {suggestionCategoryId === null ? (
                <motion.div key="cats" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }} className="pt-2 pb-1 px-1">
                  <p className="text-warm-cream/20 font-ui text-[9px] tracking-[0.2em] uppercase text-center mb-2">Quick topics</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setSuggestionCategoryId(cat.id)}
                        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)', color: 'rgba(253,251,247,0.65)', fontFamily: 'Montserrat, sans-serif', fontSize: '10px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0"
                          style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
                          <img src={cat.img} alt={cat.label} loading="lazy" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key={suggestionCategoryId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }} className="pt-2 pb-1 px-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setSuggestionCategoryId(null)}
                      className="flex items-center gap-1 text-warm-cream/30 hover:text-spiritual-gold transition-colors font-ui text-[9px] tracking-widest uppercase">
                      <ArrowLeft size={11} /> Back
                    </button>
                    <span className="text-warm-cream/20 font-ui text-[9px] tracking-widest uppercase">
                      {QUICK_CATEGORIES.find(c => c.id === suggestionCategoryId)?.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_CATEGORIES.find(c => c.id === suggestionCategoryId)?.questions.map(q => (
                      <button key={q.q} onClick={() => handleQuickQuestion(q.q, q.a)}
                        className="text-left px-3 py-2 rounded-xl transition-all hover:scale-[1.01] active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)', color: 'rgba(253,251,247,0.7)', fontFamily: 'Montserrat, sans-serif', fontSize: '11px', lineHeight: '1.4' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                        {q.q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative flex-shrink-0 p-4" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <div className="absolute top-0 left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />

          <div className="flex gap-2 items-end">
            <div className="flex-1 relative rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                disabled={loadState !== 'ready' || isGenerating}
                placeholder={
                  loadState === 'loading' || loadState === 'switching' ? 'Loading model...'
                    : loadState === 'error' ? 'Model failed to load'
                      : loadState === 'idle' ? 'Opening sidebar loads the model...'
                        : 'Ask about teachings, festivals, dharma...'
                }
                className="w-full bg-transparent resize-none outline-none px-4 py-3 text-sm"
                data-lenis-prevent
                style={{ color: 'rgba(253,251,247,0.8)', fontFamily: 'Inter, sans-serif', maxHeight: 120, caretColor: '#D4AF37' }}
              />
            </div>

            <button
              onClick={isGenerating ? stopGeneration : send}
              disabled={loadState !== 'ready' || (!input.trim() && !isGenerating)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-30"
              style={{
                background: isGenerating
                  ? 'linear-gradient(135deg, #5d1a14, #A02D23)'
                  : 'linear-gradient(135deg, #A02D23, #7a2018)',
                border: '1px solid rgba(212,175,55,0.2)',
                boxShadow: '0 4px 15px rgba(160,45,35,0.4)',
              }}
            >
              {isGenerating
                ? <span className="w-3 h-3 rounded-sm bg-warm-cream/80" />
                : <Send size={16} className="text-warm-cream/90 -translate-x-0.5" />
              }
            </button>
          </div>

          <p className="text-warm-cream/15 font-ui text-[9px] text-center mt-2 tracking-widest uppercase">
            Powered by WebLLM · Runs locally in browser
          </p>
        </div>
      </motion.div>
    </>
  );
}
