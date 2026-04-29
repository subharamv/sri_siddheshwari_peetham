/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import {
  Menu,
  X,
  ChevronRight,
  Leaf,
  Heart,
  Eye,
  Music,
  Users,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Youtube,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  ChevronLeft,
  Play,
  Headphones,
  Filter,
  Search,
  Volume2,
  VolumeX,
  Video
} from 'lucide-react';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import SpotlightCard from './components/SpotlightCard';
import BlurText from './components/BlurText';
import ScrollVelocity from './components/ScrollVelocity';
import TiltedCard from './components/TiltedCard';
import CircularGallery from './components/CircularGallery';
import FlowingMenu from './components/FlowingMenu';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';
import Grainient from './components/Grainient/Grainient';
import BorderGlow from './components/BorderGlow';
import MagicRings from './components/MagicRings';
import SpiritualChatbot from './components/SpiritualChatbot';

// --- Constants ---
const NAVIGATION = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Swamiji', href: '#swamiji' },
  { name: 'Teachings', href: '#teachings' },
  { name: 'Discourses', href: '#discourses' },
  { name: 'Calendar', href: '#calendar' },
  { name: 'Activities', href: '#activities' },
];

const DISCOURSES = [
  {
    id: 1,
    title: "The Alchemy of Silence",
    series: "Essentials of Mouna",
    topic: "Philosophy",
    date: "2024-03-10",
    duration: "45:20",
    type: "video",
    thumbnail: "https://picsum.photos/seed/talk1/600/400",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder
  },
  {
    id: 2,
    title: "Vedas in the Modern Era",
    series: "Ancient Wisdom",
    topic: "Vedas",
    date: "2024-02-15",
    duration: "1:12:00",
    type: "audio",
    thumbnail: "https://picsum.photos/seed/talk2/600/400",
    url: "#"
  },
  {
    id: 3,
    title: "Practicing Seva in Daily Life",
    series: "Dharma Path",
    topic: "Spirituality",
    date: "2024-01-20",
    duration: "38:45",
    type: "video",
    thumbnail: "https://picsum.photos/seed/talk3/600/400",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 4,
    title: "The Science of Mantras",
    series: "Vedic Science",
    topic: "Vedas",
    date: "2023-12-05",
    duration: "52:10",
    type: "audio",
    thumbnail: "https://picsum.photos/seed/talk4/600/400",
    url: "#"
  },
  {
    id: 5,
    title: "Inner Awakening",
    series: "Dharma Path",
    topic: "Spirituality",
    date: "2023-11-22",
    duration: "1:05:30",
    type: "video",
    thumbnail: "https://picsum.photos/seed/talk5/600/400",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];

const EVENTS = [
  {
    id: 1,
    title: "Guru Purnima Celebrations",
    date: "2026-07-29",
    description: "A sacred day dedicated to honoring our Guru with special Abhishekam and spiritual discourses.",
    type: "Festival",
    time: "05:00 AM - 08:00 PM"
  },
  {
    id: 2,
    title: "Akshaya Tritiya",
    date: "2026-04-19",
    description: "A day of eternal prosperity; ideal for new beginnings, investments, and purchasing gold to invite lasting wealth.",
    type: "Festival",
    time: "05:30 AM - 06:00 PM"
  },
  {
    id: 3,
    title: "Buddha Purnima",
    date: "2026-05-01",
    description: "Commemorating the birth, enlightenment, and nirvana of Gautama Buddha; a day for meditation, peace, and acts of charity.",
    type: "Festival",
    time: "06:00 AM - 08:00 PM"
  },
  {
    id: 4,
    title: "Vedic Science Discourse",
    date: "2026-05-15",
    description: "Sri Siddheswarananda Bharathi Swamy speaks on the intersection of ancient Vedic wisdom and modern science.",
    type: "Discourse",
    time: "06:30 PM - 08:00 PM"
  },
  {
    id: 5,
    title: "Sravana Somavaram",
    date: "2026-08-10",
    description: "Special prayers and rituals performed during the auspicious Mondays of Sravana month.",
    type: "Activity",
    time: "04:30 AM - 10:00 AM"
  },
  {
    id: 6,
    title: "Varalakshmi Vratam",
    date: "2026-08-21",
    description: "A significant fast observed by married women for the well-being of their families and to seek the blessings of Goddess Lakshmi.",
    type: "Festival",
    time: "06:00 AM - 09:00 PM"
  },
  {
    id: 7,
    title: "Sri Krishna Janmashtami",
    date: "2026-09-04",
    description: "Celebrating the birth of Lord Krishna with midnight prayers, devotional songs, and the 'Dahi Handi' festivities.",
    type: "Festival",
    time: "12:00 AM - 11:59 PM"
  },
  {
    id: 8,
    title: "Srivari Annual Brahmotsavam",
    date: "2026-09-12",
    description: "The grand nine-day celestial celebration at Tirumala featuring spectacular Vahana Sevas, culminating in Chakra Snanam.",
    type: "Festival",
    time: "05:00 AM - 10:00 PM"
  },
  {
    id: 9,
    title: "Ganesh Chaturthi",
    date: "2026-09-14",
    description: "The arrival of Lord Ganesha to earth; characterized by the installation of clay idols and prayers for the removal of obstacles.",
    type: "Festival",
    time: "08:00 AM - 09:00 PM"
  },
  {
    id: 10,
    title: "Navaratri Brahmotsavam",
    date: "2026-10-12",
    description: "Nine nights of divine feminine energy worship with traditional Alankarams, spiritual music, and the special Garuda Seva.",
    type: "Festival",
    time: "06:00 AM - 09:00 PM"
  },
  {
    id: 11,
    title: "Deepavali (Diwali)",
    date: "2026-11-08",
    description: "The Festival of Lights celebrating the victory of light over darkness, featuring oil lamps, fireworks, and Lakshmi Puja.",
    type: "Festival",
    time: "05:30 PM - 10:00 PM"
  },
  {
    id: 12,
    title: "Kartika Purnima",
    date: "2026-11-24",
    description: "A highly sacred day dedicated to Lord Shiva and Lord Vishnu; marked by lighting lamps in temples and holy dips in rivers.",
    type: "Festival",
    time: "05:00 AM - 09:00 PM"
  },
  {
    id: 13,
    title: "Vaikunta Ekadasi",
    date: "2026-12-20",
    description: "The opening of the 'Gate of Vaikunta' (Uttara Dwara Darshanam); a day of intense fasting and prayer for spiritual liberation.",
    type: "Festival",
    time: "04:00 AM - 11:00 PM"
  },
  {
    id: 14,
    title: "Makara Sankranti",
    date: "2027-01-15",
    description: "The harvest festival marking the sun's transition into Capricorn; celebrated with kite flying, traditional sweets, and bonfires.",
    type: "Festival",
    time: "06:00 AM - 06:00 PM"
  },
  {
    id: 15,
    title: "Maha Shivaratri",
    date: "2027-03-06",
    description: "The Great Night of Shiva; observed with night-long vigils (Jagaram), meditation, and the chanting of 'Om Namah Shivaya'.",
    type: "Festival",
    time: "06:00 AM - 06:00 AM (Overnight)"
  },
  {
    id: 16,
    title: "Ugadi (Plavanga Nama Samvatsaram)",
    date: "2027-03-09",
    description: "The Telugu and Kannada New Year; celebrated with the tasting of 'Ugadi Pachadi' representing the six flavors of life experiences.",
    type: "Festival",
    time: "06:00 AM - 08:00 PM"
  },
  {
    id: 17,
    title: "Sri Rama Navami",
    date: "2027-03-16",
    description: "The birth anniversary of Lord Rama; celebrated with Sitarama Kalyanam (celestial wedding) and the distribution of Panakam.",
    type: "Festival",
    time: "09:00 AM - 02:00 PM"
  },
  {
    id: 18,
    title: "Akhanda Mouna Shivaratri",
    date: "2026-02-15",
    description: "A night of absolute silence and profound meditation dedicated to Lord Shiva.",
    type: "Meditation",
    time: "Full Day"
  }
];

const MARQUEE_ITEMS = [
  "VEDIC WISDOM", "PURA SEVA", "MOUNAVRATAM", "DHARMA PRACHARAM",
  "ANNADYANAM", "GOSHALA", "VYASA PEETHAM", "LOKA KALYANAM",
  "SANATANA DHARMA", "ADVAITA VEDANTA", "BHAKTI YOGA", "JNANA MARGAM",
  "KARMA PHALAM", "SHANTI MANTRAM", "UPANISHADIC TRUTH", "GURU KRUPA"
];

const TEACHINGS = [
  {
    quote: "Silence is not the absence of sound, but the presence of the self.",
    context: "On Mounavratam"
  },
  {
    quote: "Service to humanity is the highest form of worship to the Divine.",
    context: "On Seva"
  },
  {
    quote: "When the mind is calm, the truth reflects like a clear lake.",
    context: "On Meditation"
  },
  {
    quote: "The Vedas are the breath of the Supreme Lord for the world's welfare.",
    context: "On Scriptures"
  },
  {
    quote: "True freedom comes from internal discipline, not external indulgence.",
    context: "On Dharma"
  },
  {
    quote: "The goal of life is to realize the Divinity within and express it in every action.",
    context: "On Self-Realization"
  },
  {
    quote: "Humility is the foundation of all spiritual progress; without it, knowledge is just an ornament.",
    context: "On Character"
  },
  {
    quote: "In the depth of silence, the heart speaks the language of the universe.",
    context: "On Mounam"
  },
  {
    quote: "Let your life be a message of peace, written in the ink of compassion.",
    context: "On Living"
  },
  {
    quote: "Wisdom is knowing that I am nothing; Love is knowing that I am everything.",
    context: "On Oneness"
  }
];

const ACTIVITIES = [
  {
    title: "Mouna Vratam",
    description: "The practice of silence (Mouna) as a path to inner peace and self-realization, as taught by Mouna Swamy.",
    icon: Leaf,
    image: "https://picsum.photos/seed/silence/800/600"
  },
  {
    title: "Annadhanam",
    description: "Serving the community through the sacred tradition of providing free meals to those in need.",
    icon: Heart,
    image: "https://picsum.photos/seed/service/800/600"
  },
  {
    title: "Dharma Pracharam",
    description: "Spreading spiritual knowledge and Vedic wisdom through discourses and publications.",
    icon: Eye,
    image: "https://picsum.photos/seed/wisdom/800/600"
  },
  {
    title: "Veda Patasala",
    description: "Nurturing the future of Sanatana Dharma by preserving and teaching ancient Vedic scriptures.",
    icon: Music,
    image: "https://picsum.photos/seed/study/800/600"
  }
];

const GURU_LINEAGE = [
  {
    year: "1916 - 1943",
    name: "Sri Mouna Swamy",
    title: "Founder & Silent Sage",
    description: "The founding light of Courtallam Peetham, who maintained absolute silence for over 50 years as a path to liberation.",
    image: "./src/assets/mouna-swami-portrait-1.jpg"
  },
  {
    year: "1943 - 1950",
    name: "Sri Vimalananda Bharathi",
    title: "First Peethadhipathi (after Mounaswamy)",
    description: "A profound scholar of the Vedas who expanded the Peetham's reach and established the traditional Patasala structure.",
    image: "./src/assets/vimalananda-bharati-portrait.jpg"
  },
  {
    year: "1950 - 1991",
    name: "Sri Trivikrama Ramananda",
    title: "Second Peethadhipathi",
    description: "Known for his boundless love and service, he streamlined the Peetham's charitable activities and social welfare programs.",
    image: "./src/assets/trivikrama-ramananda-standing.jpg"
  },
  {
    year: "1991 - 2002",
    name: "Sri Sivachidananda Bharathi Swamy",
    title: "Third Peethadhipathi",
    description: "The current Peethadhipathi, bridging ancient Vedic wisdom with modern scientific understanding.",
    image: "./src/assets/siva-chidananda-standing.jpg"
  },
  {
    year: "2002 - Present",
    name: "Sri Siddheswarananda Bharati Swamy",
    title: "Fourth Peethadhipathi (Current)",
    description: "The current Peethadhipathi, bridging ancient Vedic wisdom with modern scientific understanding.",
    image: "./src/assets/peethadhipathi-updated.png"
  },
  {
    year: "Successor",
    name: "Sri Datteshwarananda Bharati",
    title: "Uttaradhikari (Successor)",
    description: "The current Peethadhipathi, bridging ancient Vedic wisdom with modern scientific understanding.",
    image: "./src/assets/datteshwarananda-final.jpg"
  }
];

const GALLERY_IMAGES = [
  { image: "https://picsum.photos/seed/sacred1/800/800", text: "Temple Morning" },
  { image: "https://picsum.photos/seed/sacred2/800/800", text: "Vedic Rituals" },
  { image: "https://picsum.photos/seed/sacred3/800/800", text: "Peetham Sanctity" },
  { image: "https://picsum.photos/seed/sacred4/800/800", text: "Silent Meditation" },
  { image: "https://picsum.photos/seed/sacred5/800/800", text: "Dharma Service" },
  { image: "https://picsum.photos/seed/sacred6/800/800", text: "Guru Krupa" },
  { image: "https://picsum.photos/seed/sacred7/800/800", text: "Evening Arathi" },
  { image: "https://picsum.photos/seed/sacred8/800/800", text: "Divine Peace" }
];

// --- Components ---

const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Core spring: extremely reactive for the center point
  const coreX = useSpring(mouseX, { damping: 20, stiffness: 1000 });
  const coreY = useSpring(mouseY, { damping: 20, stiffness: 1000 });

  // Aura spring: softer and trailing for the fluid "floaty" look
  const auraX = useSpring(mouseX, { damping: 25, stiffness: 120 });
  const auraY = useSpring(mouseY, { damping: 25, stiffness: 120 });

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Target buttons, links, inputs, and elements with the group class
      if (target.closest('button, a, input, .group')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Core Dot: Highly precise and disappears on hover */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-spiritual-gold rounded-full z-[10000] pointer-events-none hidden lg:block"
        style={{
          x: coreX,
          y: coreY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isHovering ? 0 : 1,
        }}
      />

      {/* Trailing Aura: Follows with momentum and blooms on hover */}
      <motion.div
        className={`fixed top-0 left-0 w-10 h-10 border rounded-full z-[9999] pointer-events-none hidden lg:block transition-colors duration-500 ${isHovering ? 'bg-spiritual-gold/10 border-spiritual-gold' : 'border-spiritual-gold/60'
          }`}
        style={{
          x: auraX,
          y: auraY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isHovering ? 1.5 : 1,
          boxShadow: '0 0 15px rgba(212,175,55,0.3)'
        }}
      />
    </>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkSectionIds = ['swamiji', 'teachings', 'discourses', 'darshan', 'activities', 'donate'];
    const checkBackground = () => {
      const navBottom = 80;
      let dark = false;
      for (const id of darkSectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= navBottom && rect.bottom > 0) {
            dark = true;
            break;
          }
        }
      }
      setIsDark(dark);
    };
    window.addEventListener('scroll', checkBackground, { passive: true });
    checkBackground();
    return () => window.removeEventListener('scroll', checkBackground);
  }, []);

  return (
    <nav className="fixed w-full z-[60] glass-nav transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <img src="src/assets/Logo (1).webp" alt="logo" className="w-14 h-14 mr-[10px]" />
            <span className="font-serif text-2xl font-bold text-sacred-red tracking-tighter">
              SRI SIDDHESHWARI <span className="font-light italic">PEETHAM</span>
            </span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {NAVIGATION.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`font-ui text-xs tracking-widest uppercase font-bold hover:text-sacred-red transition-colors duration-300 ${isDark ? 'text-white' : 'text-[#2d1a0a]'}`}
                >
                  {item.name}
                </a>
              ))}
              <button className="bg-sacred-red text-white px-6 py-2 font-ui text-xs tracking-widest uppercase hover:bg-neutral-900 transition-all">
                Contact
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={`transition-colors duration-300 ${isDark ? 'text-white' : 'text-sacred-red'}`}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="md:hidden bg-warm-cream border-b border-sacred-red/10 px-4 pt-2 pb-6 space-y-4"
        >
          {NAVIGATION.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block font-ui text-sm tracking-widest uppercase text-[#2d1a0a] font-bold"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

const SectionHeading = ({ subtitle, title, centered = false, dark = false }: { subtitle: string, title: string, centered?: boolean, dark?: boolean }) => (
  <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
    <motion.span
      initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`font-ui text-[10px] tracking-[0.3em] uppercase ${dark ? 'text-sacred-red' : 'text-sacred-red/60'} font-semibold block mb-4`}
    >
      {subtitle}
    </motion.span>
    <div className={`flex items-center gap-6 ${centered ? 'justify-center' : ''}`}>
      {!centered && <div className="line-decoration" />}
      <motion.h2
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`text-4xl md:text-5xl lg:text-7xl ${dark ? 'text-warm-cream' : 'text-neutral-900'} leading-tight`}
      >
        {title}
      </motion.h2>
      <div className="line-decoration" />
    </div>
  </div>
);

const InfiniteMarquee = () => (
  <div className="bg-sacred-red py-6 overflow-hidden border-y border-warm-cream/10">
    <ScrollVelocity
      texts={[MARQUEE_ITEMS.join(' ॐ ')]}
      velocity={40}
      className="mx-8 font-ui text-xs tracking-[0.4em] text-warm-cream uppercase font-medium flex items-center"
      numCopies={8}
    />
  </div>
);

const TeachingsSlider = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const autoScroll = () => {
      if (scrollRef.current && !isDraggingRef.current && !isHoveringRef.current) {
        scrollRef.current.scrollLeft += 0.8;
        const halfWidth = scrollRef.current.scrollWidth / 2;
        if (scrollRef.current.scrollLeft >= halfWidth) {
          scrollRef.current.scrollLeft -= halfWidth;
        }
      }
      animFrameRef.current = requestAnimationFrame(autoScroll);
    };
    animFrameRef.current = requestAnimationFrame(autoScroll);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isActive]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.pageX - scrollRef.current.offsetLeft;
    dragScrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.5;
    scrollRef.current.scrollLeft = dragScrollLeftRef.current - walk;
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const scrollBy = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 480 : -480, behavior: 'smooth' });
  };

  const allItems = [...TEACHINGS, ...TEACHINGS];

  return (
    <section id="teachings" ref={sectionRef} className="py-16 md:py-24 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading subtitle="Spiritual Essence" title="Divine Reflections" dark />
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-neutral-800/80 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream hover:bg-sacred-red transition-all shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => scrollBy('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-neutral-800/80 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream hover:bg-sacred-red transition-all shadow-lg"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={scrollRef}
          className={`overflow-x-scroll no-scrollbar py-12 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={() => { stopDragging(); isHoveringRef.current = false; }}
          onMouseEnter={() => { isHoveringRef.current = true; }}
        >
          <div className="flex gap-8 pl-6 md:pl-12 pr-6 md:pr-12" style={{ width: 'max-content' }}>
            {allItems.map((item, index) => {
              const isClone = index >= TEACHINGS.length;
              return (
                <BorderGlow
                  key={index}
                  glowColor="0 74 55"
                  backgroundColor="#1c1c1c"
                  borderRadius={16}
                  glowRadius={40}
                  glowIntensity={0.9}
                  coneSpread={25}
                  colors={['#dc2626', '#b45309', '#fbbf24']}
                  className="flex-shrink-0 w-[320px] md:w-[450px]"
                >
                  <div className="p-10 group">
                    <div className="h-12 w-12 bg-sacred-red/20 rounded-full flex items-center justify-center mb-8">
                      <Leaf className="text-sacred-red" size={24} />
                    </div>
                    {isClone ? (
                      <p className="text-2xl md:text-3xl font-serif text-warm-cream leading-relaxed mb-8 italic">
                        "{item.quote}"
                      </p>
                    ) : (
                      <BlurText
                        text={`"${item.quote}"`}
                        delay={50}
                        animateBy="words"
                        direction="bottom"
                        className="text-2xl md:text-3xl font-serif text-warm-cream leading-relaxed mb-8 italic"
                      />
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-[1px] bg-sacred-red" />
                      <span className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 group-hover:text-spiritual-gold transition-colors">
                        {item.context}
                      </span>
                    </div>
                  </div>
                </BorderGlow>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const CalendarSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Start at July 2026 for demo
  const [selectedEventId, setSelectedEventId] = useState<number | null>(EVENTS[0].id);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const selectedEvent = EVENTS.find(e => e.id === selectedEventId);

  return (
    <section id="calendar" className="py-16 md:py-24 bg-warm-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading subtitle="Upcoming Events" title="Sacred Almanac" centered />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-neutral-100">
          {/* Calendar side */}
          <div className="lg:col-span-7 p-6 md:p-12 bg-neutral-900 overflow-x-auto no-scrollbar">
            <div className="min-w-[600px] lg:min-w-0">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full border border-warm-cream/10 flex items-center justify-center text-warm-cream hover:bg-sacred-red transition-all">
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="text-3xl font-serif text-warm-cream">
                    {monthName} <span className="opacity-40 italic">{year}</span>
                  </h3>
                  <button onClick={handleNextMonth} className="w-10 h-10 rounded-full border border-warm-cream/10 flex items-center justify-center text-warm-cream hover:bg-sacred-red transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="hidden sm:flex gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, index) => (
                    <div key={`${d}-${index}`} className="w-10 h-10 flex items-center justify-center text-[10px] font-ui tracking-widest text-warm-cream/40">
                      {d}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-warm-cream/10 rounded-xl overflow-hidden border border-warm-cream/10">
                {Array.from({ length: 42 }).map((_, i) => {
                  const dayNumber = i - firstDay + 1;
                  const isCurrentMonth = dayNumber > 0 && dayNumber <= days;
                  const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                  const event = EVENTS.find(e => e.date === dateStr);

                  return (
                    <div
                      key={i}
                      className={`h-20 md:h-24 p-2 transition-all relative ${isCurrentMonth ? 'bg-neutral-900' : 'bg-neutral-800/50'}`}
                    >
                      {isCurrentMonth && (
                        <>
                          <span className="text-warm-cream/20 font-ui text-xs">{dayNumber}</span>
                          {event && (
                            <motion.button
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 1.2 }}
                              onClick={() => setSelectedEventId(event.id)}
                              className={`absolute inset-2 rounded-lg flex flex-col p-2 text-left transition-all ${selectedEventId === event.id ? 'bg-sacred-red shadow-lg scale-105' : 'bg-neutral-700 hover:bg-sacred-red/40'
                                }`}
                            >
                              <span className="text-[10px] font-ui tracking-tighter text-warm-cream leading-tight line-clamp-2">
                                {event.title}
                              </span>
                              <div className="mt-auto w-1.5 h-1.5 bg-spiritual-gold rounded-full" />
                            </motion.button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details side */}
          <div className="lg:col-span-5 p-8 md:p-12 flex flex-col">
            {selectedEvent ? (
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-sacred-red/10 text-sacred-red font-ui text-[10px] tracking-widest uppercase font-bold rounded-full">
                    {selectedEvent.type}
                  </span>
                  <div className="h-[1px] flex-1 bg-neutral-100" />
                </div>

                <h3 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-8 leading-tight">
                  {selectedEvent.title}
                </h3>

                <div className="space-y-6 mb-12">
                  <div className="flex items-center gap-4 text-neutral-500">
                    <CalendarIcon size={20} className="text-sacred-red" />
                    <span className="font-ui text-sm tracking-wide">
                      {new Date(selectedEvent.date).toLocaleDateString('default', { dateStyle: 'long' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-neutral-500">
                    <Clock size={20} className="text-sacred-red" />
                    <span className="font-ui text-sm tracking-wide">{selectedEvent.time}</span>
                  </div>
                </div>

                <p className="text-neutral-600 text-lg leading-relaxed mb-12 flex-1">
                  {selectedEvent.description}
                </p>

                <div className="pt-8 border-t border-neutral-100 flex gap-4">
                  <button className="sacred-button !py-4 flex-1">Register Participation</button>
                  <button className="w-14 h-14 border border-neutral-200 rounded-full flex items-center justify-center text-neutral-400 hover:text-sacred-red hover:border-sacred-red transition-all">
                    <Heart size={20} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <CalendarIcon size={64} className="text-neutral-100 mb-6" />
                <p className="text-neutral-400 font-ui text-sm tracking-widest uppercase">Select an event date to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const DiscoursesSection = () => {
  const [activeFilter, setActiveFilter] = useState<'topic' | 'series' | 'type'>('topic');
  const [filterValue, setFilterValue] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingMedia, setPlayingMedia] = useState<typeof DISCOURSES[0] | null>(null);

  const categories = useMemo(() => {
    const topics = Array.from(new Set(DISCOURSES.map(d => d.topic)));
    const series = Array.from(new Set(DISCOURSES.map(d => d.series)));
    const types = ['video', 'audio'];
    return { topic: topics, series: series, type: types };
  }, []);

  const filteredDiscourses = useMemo(() => {
    return DISCOURSES.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.series.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterValue === 'All' || d[activeFilter] === filterValue;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, filterValue]);

  return (
    <section id="discourses" className="py-16 md:py-24 bg-neutral-900 overflow-hidden border-t border-warm-cream/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <SectionHeading subtitle="Divine Library" title="Spiritual Discourses" dark />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-cream/20 group-focus-within:text-sacred-red transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search series or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-warm-cream/5 border border-warm-cream/10 rounded-full py-3 pl-12 pr-6 text-warm-cream font-sans text-sm focus:outline-none focus:border-sacred-red transition-all"
              />
            </div>
            <div className="flex bg-warm-cream/5 border border-warm-cream/10 p-1 rounded-full">
              {(['topic', 'series', 'type'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setActiveFilter(filter); setFilterValue('All'); }}
                  className={`px-6 py-2 rounded-full font-ui text-[10px] tracking-widest uppercase transition-all ${activeFilter === filter ? 'bg-sacred-red text-warm-cream' : 'text-warm-cream/40 hover:text-warm-cream'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Values */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => setFilterValue('All')}
            className={`px-4 py-1.5 rounded-full border text-[11px] font-ui tracking-wider transition-all ${filterValue === 'All' ? 'bg-warm-cream text-neutral-900 border-warm-cream' : 'bg-transparent text-warm-cream/40 border-warm-cream/10 hover:border-warm-cream/30'
              }`}
          >
            ALL
          </button>
          {categories[activeFilter].map((val) => (
            <button
              key={val}
              onClick={() => setFilterValue(val)}
              className={`px-4 py-1.5 rounded-full border text-[11px] font-ui tracking-wider uppercase transition-all ${filterValue === val ? 'bg-sacred-red text-warm-cream border-sacred-red' : 'bg-transparent text-warm-cream/40 border-warm-cream/10 hover:border-warm-cream/30'
                }`}
            >
              {val}
            </button>
          ))}
        </div>

      </div>

      {/* Flowing Menu ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â full width */}
      <div className="h-[70vh] min-h-[400px]">
        <FlowingMenu
          items={filteredDiscourses.map(d => ({
            text: d.title,
            image: d.thumbnail,
            link: "#"
          }))}
        />
      </div>

      {/* Media Player Modal */}
      {playingMedia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/95 p-4 md:p-12 backdrop-blur-xl"
        >
          <div className="relative w-full max-w-6xl aspect-video bg-neutral-900 rounded-[40px] overflow-hidden shadow-2xl ring-1 ring-white/10">
            <button
              onClick={() => setPlayingMedia(null)}
              className="absolute top-8 right-8 z-20 w-12 h-12 bg-white/10 hover:bg-sacred-red rounded-full flex items-center justify-center text-white transition-all shadow-lg"
            >
              <X size={24} />
            </button>

            {playingMedia.type === 'video' ? (
              <iframe
                src={playingMedia.url}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-neutral-900 to-sacred-red/10">
                <div className="w-32 h-32 bg-sacred-red/20 rounded-full flex items-center justify-center mb-12 animate-pulse">
                  <Volume2 size={64} className="text-sacred-red" />
                </div>
                <h2 className="text-4xl md:text-6xl text-warm-cream font-serif mb-4">{playingMedia.title}</h2>
                <p className="text-sacred-red font-ui text-sm tracking-widest uppercase mb-12">{playingMedia.series}</p>

                {/* Mock Audio Player Controls */}
                <div className="w-full max-w-2xl bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="h-1 bg-white/10 rounded-full mb-8 relative">
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-sacred-red rounded-full" />
                    <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-4 h-4 bg-warm-cream rounded-full shadow-lg" />
                  </div>
                  <div className="flex items-center justify-center gap-12 text-warm-cream">
                    <button className="opacity-40 hover:opacity-100 transition-opacity"><ChevronLeft size={32} /></button>
                    <button className="w-20 h-20 bg-warm-cream rounded-full flex items-center justify-center text-neutral-900 transform hover:scale-110 transition-all shadow-xl">
                      <Play fill="currentColor" size={32} className="ml-1" />
                    </button>
                    <button className="opacity-40 hover:opacity-100 transition-opacity"><ChevronRight size={32} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
};

const InteractiveDarshan = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <section id="darshan"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative py-16 md:py-24 min-h-[100svh] bg-black overflow-hidden cursor-crosshair group/darshan"
    >
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center origin-center transition-transform duration-700 group-hover/darshan:scale-105"
        style={{
          backgroundImage: 'url("https://picsum.photos/seed/sanctum/1920/1080")',
          WebkitMaskImage: `radial-gradient(circle 385px at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.32) 50%, rgba(0,0,0,0) 100%)`,
          maskImage: `radial-gradient(circle 385px at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.32) 50%, rgba(0,0,0,0) 100%)`
        }}
      />

      {/* Ambient Vignette */}
      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />

      {/* Interactive Overlay Text */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="space-y-4"
        >
          <span className="font-ui text-[10px] tracking-[0.6em] uppercase text-sacred-red font-bold block mb-4">
            Inner Sanctum
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-8xl text-warm-cream font-serif italic font-light drop-shadow-[0_0_15px_rgba(253,251,247,0.3)]">
            Seek the Light <span className="opacity-60 text-spiritual-gold">Within</span>
          </h2>
          <p className="text-warm-cream/30 font-ui text-[10px] tracking-widest uppercase mt-8 animate-pulse">
            Move your light across the darkness
          </p>
        </motion.div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-12 left-12 w-24 h-24 border-t border-l border-white/5 pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-24 h-24 border-b border-r border-white/5 pointer-events-none" />
    </section>
  );
};

const SwamijiPortrait = () => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: -((e.clientY - rect.top) / rect.height - 0.5),
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square max-w-[500px] mx-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMousePos({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
    >
      {/* Rings layer ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â radial mask fades rectangular canvas edges to transparent */}
      <div
        className="absolute inset-[-32%] z-0 pointer-events-none"
        style={{
          mixBlendMode: 'screen',
          maskImage: 'radial-gradient(ellipse 60% 60% at center, black 35%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at center, black 35%, transparent 78%)',
        }}
      >
        <MagicRings
          color="#F59E0B"
          colorTwo="#FDE68A"
          ringCount={4}
          speed={1.2}
          attenuation={5}
          lineThickness={3.5}
          baseRadius={0.30}
          radiusStep={0.10}
          scaleRate={0.10}
          opacity={1}
          noiseAmount={0.04}
          ringGap={1.4}
          fadeIn={0.6}
          fadeOut={0.45}
          followMouse={true}
          mouseInfluence={0.15}
          hoverScale={1.3}
          parallax={0.05}
          externalHovered={hovered}
          externalMousePos={mousePos}
        />
      </div>
      {/* Portrait on top */}
      <div className="relative z-10 w-full h-full">
        <TiltedCard
          imageSrc="./src/assets/peethadhipathi-updated.png"
          altText="Sri Siddheswarananda Bharathi Swamy"
          captionText="Sri Siddheswarananda Bharathi Swamy"
          containerHeight="100%"
          containerWidth="100%"
          imageHeight="100%"
          imageWidth="100%"
          rotateAmplitude={12}
          scaleOnHover={1.05}
          showTooltip={true}
          displayOverlayContent={true}
          overlayContent={
            <div className="absolute inset-0 rounded-full border border-warm-cream/10 z-10 pointer-events-none" />
          }
        />
      </div>
    </div>
  );
};

export default function App() {
  const [isMuted, setIsMuted] = useState(true);
  const heroRef = useRef(null);
  const aboutRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const aboutY = useTransform(aboutScroll, [0, 1], ["-5%", "5%"]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <CustomCursor />
      {/* Film Grain Overlay */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.04] animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px'
        }}
      />

      <iframe
        className="hidden"
        src={`https://www.youtube.com/embed/auu2JkFM03A?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=auu2JkFM03A`}
        allow="autoplay"
      />

      {/* Floating Audio Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-[100] w-14 h-14 bg-sacred-red/10 backdrop-blur-xl border border-sacred-red/20 rounded-full flex items-center justify-center text-sacred-red hover:bg-sacred-red hover:text-white transition-all group active:scale-95 shadow-2xl"
      >
        <div className="relative">
          <motion.div
            animate={{ opacity: isMuted ? 1 : 0, scale: isMuted ? 1 : 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <VolumeX size={24} />
          </motion.div>
          <motion.div
            animate={{ opacity: !isMuted ? 1 : 0, scale: !isMuted ? 1 : 0.5 }}
            className="flex items-center justify-center"
          >
            <Volume2 size={24} />
          </motion.div>
        </div>
        <span className="absolute -top-12 right-0 bg-neutral-900/80 backdrop-blur-md text-warm-cream text-[10px] tracking-widest uppercase py-1 px-3 rounded-full opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {isMuted ? 'Unmute Ambient Sound' : 'Mute Sound'}
        </span>
      </button>

      <SpiritualChatbot />
      <Navbar />

      <div className="relative z-10 bg-warm-cream shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-[60vh]">
        {/* Hero Section */}
        <section id="home" ref={heroRef} className="relative min-h-[100svh] pt-24 pb-32 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Grainient
              color1="#FFFBEB"
              color2="#B45309"
              color3="#FFFBEB"
              timeSpeed={0.25}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1}
              centerX={0}
              centerY={0}
              zoom={0.9}
            />
          </div>

          <div className="relative z-20 text-center px-4 max-w-4xl drop-shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-ui text-xs tracking-[0.4em] uppercase text-[#2D1A0A]/80 mb-6 block">
                Established in 1918 • Courtallam
              </span>
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.3
                    }
                  }
                }}
                className="text-6xl md:text-8xl lg:text-[7.5rem] text-[#2D1A0A] font-serif leading-[0.9] mb-10 lg:mb-12"
              >
                <div className="overflow-hidden inline-block mr-4">
                  <motion.span
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
                    }}
                    className="inline-block"
                  >
                    Silence
                  </motion.span>
                </div>
                <div className="overflow-hidden inline-block mr-4">
                  <motion.span
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
                    }}
                    className="inline-block"
                  >
                    is
                  </motion.span>
                </div>
                <div className="overflow-hidden inline-block">
                  <motion.span
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
                    }}
                    className="inline-block"
                  >
                    the
                  </motion.span>
                </div>
                <br />
                <div className="overflow-hidden inline-block mr-4 italic font-light opacity-60">
                  <motion.span
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
                    }}
                    className="inline-block"
                  >
                    Greatest
                  </motion.span>
                </div>
                <div className="overflow-hidden inline-block italic font-light opacity-60">
                  <motion.span
                    variants={{
                      hidden: { y: "100%" },
                      visible: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
                    }}
                    className="inline-block"
                  >
                    Speech
                  </motion.span>
                </div>
              </motion.h1>
              <p className="text-[#2D1A0A]/70 font-sans text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
                Experience the profound presence of divinity at Mouna Swamy Mutt, where ancient traditions meet universal wisdom.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="sacred-button shadow-2xl shadow-sacred-red/20 active:scale-95 transition-transform">Explore Peetham</button>
                <div className="hidden sm:block w-[1px] h-12 bg-gradient-to-b from-transparent via-sacred-red to-transparent opacity-50"></div>
                <button className="px-8 py-3 border border-warm-cream/20 text-warm-cream font-ui text-sm tracking-widest uppercase hover:bg-warm-cream hover:text-neutral-900 transition-all backdrop-blur-[40px] bg-warm-cream/10 shadow-xl active:scale-95">
                  Virtual Tour
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <InfiniteMarquee />

        {/* About Section */}
        <section id="about" ref={aboutRef} className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <SectionHeading subtitle="Rooted in Tradition" title="The Legacy of Silence" />
              <div className="space-y-6 text-neutral-600 leading-relaxed text-lg">
                <p>
                  Sri Siddheswari Peetham, located in the scenic town of Courtallam, was founded by the legendary Mouna Swamy. Known for his profound vow of silence, he established this Peetham as a sanctuary for those seeking spiritual solace.
                </p>
                <p>
                  Our philosophy centers on the transformative power of Mouna (Silence), which allows the soul to hear the whisper of the divine and find peace amidst the chaos of the modern world.
                </p>
                <div className="pt-2">
                  <a href="#" className="inline-flex items-center gap-2 text-sacred-red font-semibold group">
                    Learn about our history <ChevronRight className="transition-transform group-hover:translate-x-1" size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }}
              whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="relative aspect-[4/5] rounded-tl-[100px] rounded-br-[100px] overflow-hidden"
            >
              <motion.img
                style={{ y: aboutY }}
                src="https://srisiddheshwaripeetham.com/courtallam-temple-gopuram-and-peetham-campus.png"
                alt="Temple Entrance"
                className="w-full h-full object-cover scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-[20px] border-warm-cream/20 m-6 rounded-tl-[76px] rounded-br-[76px]" />
            </motion.div>
          </div>

          {/* Physical Stacking Timeline */}
          <div className="relative mt-32 mb-[20vh]">
            <SectionHeading subtitle="Succession of Wisdom" title="Guru Parampara" centered />
            <div className="max-w-5xl mx-auto">
              <ScrollStack
                itemDistance={100}
                itemScale={0.04}
                itemStackDistance={40}
                stackPosition="12.5%"
                useWindowScroll={true}
                className="relative"
              >
                {GURU_LINEAGE.map((guru, index) => (
                  <ScrollStackItem key={index}>
                    <div className="h-[75vh] w-full rounded-[40px] overflow-hidden relative shadow-[0_20px_80px_rgba(0,0,0,0.4)] group/card border border-white/5">
                      <img
                        src={guru.image}
                        alt={guru.name}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] group-hover/card:scale-110 group-hover/card:rotate-1"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-10 md:p-20">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        >
                          <span className="font-ui text-spiritual-gold text-lg md:text-xl tracking-[0.4em] font-bold block mb-6 drop-shadow-lg">
                            {guru.year}
                          </span>
                          <h3 className="text-5xl md:text-8xl font-serif text-warm-cream leading-none mb-8 drop-shadow-2xl">
                            {guru.name}
                          </h3>
                          <p className="text-warm-cream/70 text-lg md:text-xl max-w-2xl font-sans leading-relaxed border-l border-spiritual-gold/30 pl-6 italic">
                            {guru.description}
                          </p>
                        </motion.div>
                      </div>

                      {/* Decorative Year Watermark */}
                      <div className="absolute top-10 right-10 font-serif text-9xl pointer-events-none select-none" style={{ color: 'rgba(45,26,10,0.12)' }}>
                        {guru.year.split(' ')[0]}
                      </div>
                    </div>
                  </ScrollStackItem>
                ))}
              </ScrollStack>
            </div>
          </div>
        </section>

        {/* Swamiji Section */}
        <section id="swamiji" className="bg-neutral-900 py-16 md:py-24 overflow-hidden border-b border-warm-cream/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <SwamijiPortrait />
              </div>
              <div className="lg:col-span-7 order-1 lg:order-2">
                <SectionHeading subtitle="The Living Tradition" title="Sri Siddheswarananda Bharathi Swamy" dark />
                <div className="space-y-6 text-warm-cream/60 leading-relaxed text-lg italic font-serif border-l-2 border-sacred-red pl-8 mb-12">
                  "Spiritual realization is not about acquiring new things, but about revealing the eternal truth that is already within you."
                </div>
                <p className="text-warm-cream/40 text-lg leading-relaxed mb-8">
                  As the current Peethadhipathi, Swamiji continues the divine lineage with his profound wisdom in Vedas, Shastras, and modern science, bridging the gap for the contemporary seeker.
                </p>
                <button className="sacred-button !bg-warm-cream !text-neutral-900 border-none">Discourses & Teachings</button>
              </div>
            </div>
          </div>
        </section>

        <TeachingsSlider />
        <DiscoursesSection />
        <CalendarSection />
        <InteractiveDarshan />

        {/* Activities Section */}
        <section id="activities" className="bg-neutral-950 py-16 md:py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeading subtitle="Our Efforts" title="Compassion in Action" centered dark />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {ACTIVITIES.map((activity, index) => (
                <SpotlightCard
                  key={activity.title}
                  spotlightColor="rgba(212, 175, 55, 0.15)"
                  className="group relative bg-white/5 rounded-3xl p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-white/10"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                    whileHover={{ y: -10 }}
                  >
                    <div className="relative overflow-hidden mb-8 aspect-[4/5] rounded-2xl cinematic-grade">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-sacred-red/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 left-4 h-12 w-12 bg-warm-cream/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <activity.icon className="text-sacred-red" size={20} />
                      </div>
                    </div>
                    <div className="px-2 pb-4">
                      <h3 className="text-2xl font-serif mb-4 text-warm-cream group-hover:text-spiritual-gold transition-colors">{activity.title}</h3>
                      <p className="text-warm-cream/60 text-sm leading-relaxed group-hover:text-warm-cream/90 transition-colors">
                        {activity.description}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sacred-red opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="font-ui text-[10px] tracking-widest uppercase font-bold">Read Details</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Highlight */}
        <section id="gallery" className="bg-warm-cream py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <SectionHeading subtitle="Visual Journey" title="Sacred Moments" />
              </div>
              <button className="hidden md:block font-ui text-xs tracking-widest uppercase text-sacred-red border-b border-sacred-red/30 pb-2 mb-10">
                Drag to Explore Divinity
              </button>
            </div>

            <div className="w-full h-[600px] relative cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl cinematic-grade shadow-2xl">
              <CircularGallery items={GALLERY_IMAGES} bend={3} borderRadius={0.05} scrollSpeed={2} />
            </div>
          </div>
        </section>

        {/* Donation Banner */}
        <section id="donate" className="relative py-16 md:py-24 bg-sacred-red">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              <h2 className="text-4xl md:text-6xl text-warm-cream font-serif mb-8">Support the Mission</h2>
              <p className="text-warm-cream/70 text-lg mb-12 max-w-2xl mx-auto">
                Your contributions help us maintain the Peetham, run the Veda Patasala, and expand our social service activities. Become a part of this divine legacy.
              </p>
              <button className="px-12 py-5 bg-warm-cream text-sacred-red font-ui text-sm tracking-[0.2em] uppercase font-bold hover:scale-105 transition-transform">
                Make a Donation
              </button>
            </motion.div>
          </div>
        </section>

        <div className="bg-neutral-900 overflow-hidden py-14 border-b border-warm-cream/5">
          <ScrollVelocity
            texts={['Sri Siddheswari Peetham • Courtallam • Silence is Peace • Mouna Swamy Mutt • Sanatana Dharma • ']}
            velocity={30}
            className="font-serif text-3xl italic text-warm-cream/20 mx-24 tracking-widest"
            numCopies={4}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-0 h-[60vh] bg-neutral-900 pt-20 pb-12 px-4 border-t border-warm-cream/5 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="lg:col-span-2">
            <span className="font-serif text-3xl font-bold text-warm-cream tracking-tighter mb-8 block">
              SRI SIDDHESHWARI <span className="font-light italic opacity-50">PEETHAM</span>
            </span>
            <p className="text-warm-cream/40 max-w-sm mb-8 leading-relaxed">
              Preserving the sacred traditions of Hindu Dharma and the teachings of the lineage of Mouna Swamys through meditation, service, and wisdom.
            </p>
            <div className="flex gap-6">
              <a href="#" className="w-10 h-10 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream/40 hover:text-sacred-red hover:border-sacred-red transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream/40 hover:text-sacred-red hover:border-sacred-red transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream/40 hover:text-sacred-red hover:border-sacred-red transition-all">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-ui text-xs tracking-widest uppercase text-warm-cream mb-8">Navigation</h4>
            <ul className="space-y-4">
              {NAVIGATION.map(item => (
                <li key={item.name}>
                  <a href={item.href} className="text-warm-cream/40 hover:text-sacred-red transition-colors">{item.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-ui text-xs tracking-widest uppercase text-warm-cream mb-8">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start text-warm-cream/40">
                <MapPin size={20} className="text-sacred-red flex-shrink-0" />
                <span>Sri Siddheswari Peetham,<br />Courtallam - 627 802,<br />Tenkasi District, TN.</span>
              </li>
              <li className="flex gap-4 items-center text-warm-cream/40">
                <Phone size={20} className="text-sacred-red" />
                <span>+91 4633 283256</span>
              </li>
              <li className="flex gap-4 items-center text-warm-cream/40">
                <Mail size={20} className="text-sacred-red" />
                <span>info@srisiddheshwaripeetham.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-warm-cream/5 text-center text-warm-cream/20 font-ui text-[10px] tracking-widest uppercase mb-4">
          © {new Date().getFullYear()} Sri Siddheswari Peetham. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}