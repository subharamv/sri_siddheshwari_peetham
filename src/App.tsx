/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import {
  X,
  LayoutGrid,
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
import CardNav from './components/CardNav';
import DonationPage from './components/DonationPage';
import logoImage from './assets/Logo (1).webp';
import mounaSwamiPortrait from './assets/mouna-swami-portrait-1.jpg';
import vimalanandaPortrait from './assets/vimalananda-bharati-portrait.jpg';
import trivikramaPortrait from './assets/trivikrama-ramananda-standing.jpg';
import sivaChidanandaPortrait from './assets/siva-chidananda-standing.jpg';
import peethadhipathiImage from './assets/peethadhipathi-updated.png';
import datteshwaranandaImage from './assets/datteshwarananda-final.jpg';

// --- Constants ---
const AUDIO_TRACKS = [
  { id: 'Veziy5HKVQ8', name: 'Om Chants' },
  { id: 'CKATBj4xn9g', name: 'Temple Rhythms' },
  { id: 'auu2JkFM03A', name: 'Meditation Music' },
];

const NAVIGATION = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Swamiji', href: '#swamiji' },
  { name: 'Teachings', href: '#teachings' },
  { name: 'Discourses', href: '#discourses' },
  { name: 'Calendar', href: '#calendar' },
  { name: 'Activities', href: '#activities' },
];

const CARD_NAV_ITEMS = [
  {
    label: 'Peetham',
    bgColor: '#6B1A14',
    textColor: '#FDFBF7',
    links: [
      { label: 'Home', href: '#home', ariaLabel: 'Go to Home' },
      { label: 'About', href: '#about', ariaLabel: 'About the Peetham' },
    ],
  },
  {
    label: 'Dharma',
    bgColor: '#3E2B1C',
    textColor: '#FDFBF7',
    links: [
      { label: 'Swamiji', href: '#swamiji', ariaLabel: 'About Swamiji' },
      { label: 'Teachings', href: '#teachings', ariaLabel: 'Teachings' },
      { label: 'Discourses', href: '#discourses', ariaLabel: 'Discourses' },
    ],
  },
  {
    label: 'Sangha',
    bgColor: '#1E1209',
    textColor: '#D4AF37',
    links: [
      { label: 'Calendar', href: '#calendar', ariaLabel: 'Event Calendar' },
      { label: 'Activities', href: '#activities', ariaLabel: 'Activities' },
    ],
  },
  {
    label: 'Spiritual',
    bgColor: '#2C1654',
    textColor: '#E8D5FF',
    links: [
      { label: 'Deities', href: '#deities', ariaLabel: 'Sacred Deities & Seva' },
      { label: 'Homam', href: '#homam', ariaLabel: 'Vedic Homam Rituals' },
    ],
  },
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
  "ANNADANAM", "GOSHALA", "VYASA PEETHAM", "LOKA KALYANAM",
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
    image: "https://assets.architecturaldigest.in/photos/68d3b9c70bfdf7c518fac33d/2:3/w_720,h_1080,c_limit/cover%20image%20template%203%20(1).jpg"
  },
  {
    title: "Annadhanam",
    description: "Serving the community through the sacred tradition of providing free meals to those in need.",
    icon: Heart,
    image: "https://srisiddheshwaripeetham.com/annadanam-seva-peetham.jpg"
  },
  {
    title: "Go Seva",
    description: "Support cow protection and care. Cows are sacred in our tradition, and their welfare brings divine blessings and prosperity.",
    icon: Eye,
    image: "https://srisiddheshwaripeetham.com/go-seva-cow-protection.png"
  },
  {
    title: "Veda Patasala",
    description: "Nurturing the future of Sanatana Dharma by preserving and teaching ancient Vedic scriptures.",
    icon: Music,
    image: "https://vedapatashala.in/images/gallery/veda2.webp"
  }
];

const GURU_LINEAGE = [
  {
    year: "1916 - 1943",
    name: "Sri Mouna Swamy",
    title: "Founder & Silent Sage",
    description: "The founding light of Courtallam Peetham, who maintained absolute silence for over 50 years as a path to liberation.",
    image: mounaSwamiPortrait
  },
  {
    year: "1943 - 1950",
    name: "Sri Vimalananda Bharathi",
    title: "First Peethadhipathi (after Mounaswamy)",
    description: "A profound scholar of the Vedas who expanded the Peetham's reach and established the traditional Patasala structure.",
    image: vimalanandaPortrait
  },
  {
    year: "1950 - 1991",
    name: "Sri Trivikrama Ramananda",
    title: "Second Peethadhipathi",
    description: "Known for his boundless love and service, he streamlined the Peetham's charitable activities and social welfare programs.",
    image: trivikramaPortrait
  },
  {
    year: "1991 - 2002",
    name: "Sri Sivachidananda Bharathi Swamy",
    title: "Third Peethadhipathi",
    description: "The current Peethadhipathi, bridging ancient Vedic wisdom with modern scientific understanding.",
    image: sivaChidanandaPortrait
  },
  {
    year: "2002 - Present",
    name: "Sri Siddheswarananda Bharati Swamy",
    title: "Fourth Peethadhipathi (Current)",
    description: "The current Peethadhipathi, bridging ancient Vedic wisdom with modern scientific understanding.",
    image: peethadhipathiImage
  },
  {
    year: "Successor",
    name: "Sri Datteshwarananda Bharati",
    title: "Uttaradhikari (Successor)",
    description: "The current Peethadhipathi, bridging ancient Vedic wisdom with modern scientific understanding.",
    image: datteshwaranandaImage
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

const DEITIES = [
  {
    id: 'raja-rajeswari',
    name: 'Sri Raja Rajeswari Devi',
    grad: 'linear-gradient(145deg,#6B1A14,#C2185B)',
    description: 'The supreme goddess of prosperity, wisdom, and divine grace. Sri Raja Rajeswari embodies the cosmic power of creation and is worshipped for material and spiritual abundance.',
    sevas: [],
    image: 'https://srisiddheshwaripeetham.com/sri-raja-rajeswari-exact.png'
  },
  {
    id: 'chakra-maha-meru',
    name: 'Sri Chakra Maha Meru',
    grad: 'linear-gradient(145deg,#5D1A00,#8B6914)',
    description: 'Sri Vidya upasana, Maha Meru worship, and Sri Lalita parayana on auspicious days.',
    sevas: [],
    image: 'https://srisiddheshwaripeetham.com/maha-meru-worship-with-lamps.png'
  },
  {
    id: 'naadi-ganapathi',
    name: 'Naadi Ganapathi',
    grad: 'linear-gradient(145deg,#7A3500,#D4690A)',
    description: 'Remover of obstacles. Special Sankatahara Chaturthi puja and archana.',
    sevas: [],
    image: 'https://srisiddheshwaripeetham.com/naadi-ganapathi-exact.jpg'
  },
  {
    id: 'pratyangira-devi',
    name: 'Paathala Pratyangira Devi',
    grad: 'linear-gradient(145deg,#0D0D1A,#4A0E2A)',
    description: 'Pratyangira Homam for protection and removal of negativities on select tithis.',
    sevas: [],
    image: 'https://srisiddheshwaripeetham.com/pratyangira-devi-elaborate.png'
  },
  {
    id: 'kaala-bhairava',
    name: 'Kaala Bhairava',
    grad: 'linear-gradient(145deg,#0A0A0A,#3D2020)',
    description: 'Kalashtami puja to the guardian of time and dharma.',
    sevas: [],
    image: 'https://srisiddheshwaripeetham.com/kala-bhairava-exact.png'
  },
  {
    id: 'kameswara-swami',
    name: 'Kameswara Swami',
    grad: 'linear-gradient(145deg,#1A1A5E,#4A2E8B)',
    description: 'Lord Shiva in the form of Kameswara, beautifully adorned and worshipped at the Peetham.',
    sevas: ['Abhishekam', 'Rudrabhishekam', 'Archana'],
    image: 'https://srisiddheshwaripeetham.com/kameswara-swami.png'
  },
  {
    id: 'ratnagarbha-ganapati',
    name: 'Ratnagarbha Ganapati',
    grad: 'linear-gradient(145deg,#5E3A00,#B8860B)',
    description: 'The jewel-bellied form of Lord Ganesha, bestowing prosperity and removing obstacles. Special worship and offerings on Chaturthi days.',
    sevas: ['Ganapathi Homam', 'Abhishekam', 'Modaka Offering'],
    image: 'https://srisiddheshwaripeetham.com/naadi-ganapathi-exact.jpg' // Using Naadi Ganapathi as placeholder if not provided
  },
  {
    id: 'narasimha-swami',
    name: 'Sri Narasimha Swami',
    grad: 'linear-gradient(145deg,#5E1A00,#8B4513)',
    description: 'The fierce half-man, half-lion avatar of Lord Vishnu, protector of devotees and destroyer of evil. Worshipped for courage, protection, and victory over obstacles.',
    sevas: ['Narasimha Homam', 'Abhishekam', 'Archana', 'Sahasranama Parayana'],
    image: 'https://srisiddheshwaripeetham.com/narasimha-swami-exact.png'
  },
  {
    id: 'radha-krishna',
    name: 'Sri Radha Krishna',
    grad: 'linear-gradient(145deg,#0D3B5E,#1A6B5E)',
    description: 'The divine couple representing pure, eternal love and devotion. Worshipped together for spiritual bliss, devotion, and harmony.',
    sevas: ['Abhishekam', 'Archana', 'Bhagavad Gita Parayana', 'Bhajans'],
    image: 'https://srisiddheshwaripeetham.com/radha-krishna-new.png'
  },
  {
    id: 'sanjeevaraya-hanuman',
    name: 'Sanjeevaraya Hanuman',
    grad: 'linear-gradient(145deg,#5E2000,#C25020)',
    description: 'The mighty devotee of Lord Rama, symbol of strength, devotion, and selfless service. Worshipped for courage, protection, health, and overcoming obstacles.',
    sevas: ['Hanuman Chalisa', 'Abhishekam', 'Archana', 'Sundara Kanda Parayana'],
    image: 'https://srisiddheshwaripeetham.com/sanjeevaraya-hanuman-final.png'
  },
  {
    id: 'swetha-kali',
    name: 'Swetha Kali',
    grad: 'linear-gradient(145deg,#1A1A1A,#4A4A5A)',
    description: 'The benevolent white form of Goddess Kali, radiating divine grace and compassion. Worshipped for protection, strength, and spiritual transformation.',
    sevas: ['Kali Puja', 'Abhishekam', 'Archana', 'Sahasranama Parayana', 'Special Friday Puja'],
    image: 'https://srisiddheshwaripeetham.com/swetha-kali-exact.png'
  },
  {
    id: 'naga-devatha',
    name: 'Naga Devatha',
    grad: 'linear-gradient(145deg,#0D3B1A,#1A6B3A)',
    description: 'The sacred serpent deity worshipped under the sacred tree, embodying protection, fertility, and divine blessings. The five-headed cobra represents cosmic energy and spiritual awakening.',
    sevas: ['Naga Puja', 'Milk Abhishekam', 'Archana', 'Naga Kavacham', 'Special Panchami Puja'],
    image: 'https://srisiddheshwaripeetham.com/naga-devatha.png'
  },
  {
    id: 'dandaayudha-pani',
    name: 'Dandaayudha Pani',
    grad: 'linear-gradient(145deg,#3B0D3B,#6B1A5E)',
    description: 'The divine form holding the sacred staff (danda), symbolizing righteousness, discipline, and divine authority. Worshipped for justice, protection, and upholding dharma.',
    sevas: ['Abhishekam', 'Archana', 'Special Puja', 'Danda Puja'],
    image: 'https://srisiddheshwaripeetham.com/dandaayudha-pani.png'
  },
  {
    id: 'seetha-rama',
    name: 'Seetha Rama',
    grad: 'linear-gradient(145deg,#0D3B6B,#1A5E8B)',
    description: 'The divine couple from the Ramayana, representing ideal virtue, devotion, and dharma. Worshipped for righteousness, marital harmony, and spiritual strength.',
    sevas: ['Ramayana Parayana', 'Abhishekam', 'Archana', 'Sahasranama Parayana', 'Special Rama Navami Puja'],
    image: 'https://srisiddheshwaripeetham.com/seetha-rama.png'
  },
];

const DAILY_SEVA_SCHEDULE = [
  { time: '5:30 AM', name: 'Suprabhatam', description: 'Morning awakening prayers' },
  { time: '6:00 AM', name: 'Abhishekam', description: 'Sacred bathing ritual' },
  { time: '7:30 AM', name: 'Alankaram', description: 'Divine decoration' },
  { time: '12:00 PM', name: 'Madhyahna Puja', description: 'Noon worship' },
  { time: '6:00 PM', name: 'Sandhya Arati', description: 'Evening prayers' },
  { time: '8:00 PM', name: 'Sayana Arati', description: 'Night rest ritual' },
];

const HOMAM_PROCEDURE_STEPS = [
  'Purification: Āchamanam, Prāṇāyāma, Sankalpa.',
  'Setup: Kalasha preparation; Kunda Mekalā Pūjā (8 directions); Agni Pīṭha Pūjā (10 directions).',
  'Agni: Seat Agni, light camphor, invoke with beejas, shield, initial offerings.',
  'Pancha Pūjā to Agni: Water, sandal, flowers, incense, deepam, naivedyam; ghee and darbha.',
  'Ganapati & Guru Homam: Sequential aahutis for obstacle removal and guru grace.',
  'Main Deity: Invocation, Moola Mantra union, Nāḍi Sandhānam, Devatā Preetardham.',
  'Main Homam: Aahutis with ghee and dravyas; Mahā Vyāhṛti Homam.',
  'Offerings: Devatā Bali, Pūrṇāhuti (12 ghee), Dikpālaka Bali (10 directions), Bhūta Bali.',
  'Conclusion: Samarpanam, Udvāsanam, Raksha (apply sacred ash).',
];

const HOMAM_TYPES = [
  { id: 'pratyangira', name: 'Pratyangira Homam', icon: '🔥', description: 'Amavasya Homam is performed each new moon at Paathala Pratyangira Devi temple. Rahu Kala Pooja on Tuesdays 2:30–4:00 pm.' },
  { id: 'ganapathi', name: 'Ganapathi Homam', icon: '🪔', description: 'For auspicious beginnings and obstacle removal at the Naadi Ganapathi shrine; Vidya and Lakshmi variants available.' },
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

const ClassicNavGroup = ({ group, isDark }: { group: typeof CARD_NAV_ITEMS[number]; isDark: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`flex items-center gap-1 font-ui text-xs tracking-widest uppercase font-bold hover:text-sacred-red transition-colors duration-300 ${isDark ? 'text-white' : 'text-[#2d1a0a]'}`}>
        {group.label}
        <ChevronRight size={11} className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 w-44 pt-2 z-50">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="bg-warm-cream/98 backdrop-blur-xl shadow-2xl rounded-xl border border-sacred-red/12 py-1.5"
          >
            {group.links.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 font-ui text-[10px] tracking-widest uppercase font-bold text-[#2d1a0a] hover:text-sacred-red hover:bg-sacred-red/5 transition-colors"
              >
                <ChevronRight size={10} className="text-sacred-red/50" />
                {link.label}
              </a>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Navbar = ({ onDonate }: { onDonate: () => void }) => {
  const [isDark, setIsDark] = useState(false);
  const [navStyle, setNavStyle] = useState<'card' | 'classic'>(() =>
    (localStorage.getItem('ssp-nav-style') as 'card' | 'classic') || 'card'
  );

  const toggleNavStyle = () =>
    setNavStyle(prev => {
      const next = prev === 'card' ? 'classic' : 'card';
      localStorage.setItem('ssp-nav-style', next);
      return next;
    });

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
    <>
      {/* ── Classic navbar: desktop only, shown when toggled ── */}
      {navStyle === 'classic' && (
        <nav className="hidden md:block fixed w-full z-[60] glass-nav transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={logoImage} alt="logo" className="w-14 h-14 mr-[10px]" />
                <span className="font-serif text-2xl font-bold text-sacred-red tracking-tighter">
                  SRI SIDDHESHWARI <span className="font-light italic">PEETHAM</span>
                </span>
              </div>
              <div className="flex items-center gap-5">
                {CARD_NAV_ITEMS.map((group) => (
                  <ClassicNavGroup key={group.label} group={group} isDark={isDark} />
                ))}

                {/* Toggle back to card style */}
                <button
                  onClick={toggleNavStyle}
                  title="Switch to card navigation"
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-ui text-[10px] tracking-widest uppercase font-semibold border rounded-lg transition-all duration-200 ${isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-sacred-red/30 text-sacred-red hover:bg-sacred-red/[0.07]'}`}
                >
                  <LayoutGrid size={12} />
                  <span>Card</span>
                </button>
                <button className="bg-sacred-red text-white px-6 py-2 font-ui text-xs tracking-widest uppercase hover:bg-neutral-900 transition-all" type="button">
                  Contact
                </button>
                <button
                  type="button"
                  onClick={onDonate}
                  className={`px-6 py-2 font-ui text-xs tracking-widest uppercase border transition-all ${isDark ? 'border-spiritual-gold text-spiritual-gold hover:bg-spiritual-gold hover:text-neutral-900' : 'border-sacred-red text-sacred-red hover:bg-sacred-red hover:text-white'}`}
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* ── CardNav pill: always on mobile/tablet; on desktop only when card style ── */}
      <div
        className={`fixed top-0 left-0 w-full z-[60] ${navStyle === 'classic' ? 'md:hidden' : ''}`}
        style={{ pointerEvents: 'none' }}
      >
        <CardNav
          logo={logoImage}
          logoAlt="Sri Siddheswari Peetham"
          logoTitle="SRI SIDDHESHWARI PEETHAM"
          items={CARD_NAV_ITEMS}
          baseColor="#FDFBF7"
          menuColor="#A02D23"
          buttonBgColor="#A02D23"
          buttonTextColor="#FDFBF7"
          ctaLabel="Contact"
          ctaHref="#contact"
          donateLabel="Donate"
          onDonate={onDonate}
          onStyleToggle={toggleNavStyle}
        />

      </div>
    </>
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
          imageSrc={peethadhipathiImage}
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

// ── Deity card ────────────────────────────────────────────────────────────────
const DeityCard = ({ deity }: { deity: typeof DEITIES[0] }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.55, ease: 'easeOut' }}
    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col group"
  >
    {/* Image / gradient area */}
    <div className="relative h-64 flex items-end overflow-hidden" style={{ background: deity.grad }}>
      {/* Subtle sacred pattern overlay */}
      <div className="absolute inset-0 opacity-[0.1]" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Deity Image */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.img
          src={deity.image}
          alt={deity.name}
          className="h-full w-full object-cover object-top drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] z-10"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </div>

      {/* OM watermark */}
      <span className="absolute top-4 right-5 text-white/10 font-serif text-7xl select-none leading-none z-0">ॐ</span>

      {/* Action buttons overlay on hover */}
      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent p-4 flex gap-3">
        <a href="#calendar" className="flex-1 text-center bg-spiritual-gold text-neutral-900 font-ui text-[10px] tracking-widest uppercase font-bold py-2 rounded-lg hover:bg-white transition-colors">
          View Schedule
        </a>
        <a href="#homam" className="flex-1 text-center border border-white text-white font-ui text-[10px] tracking-widest uppercase font-bold py-2 rounded-lg hover:bg-white hover:text-neutral-900 transition-colors">
          Book Seva
        </a>
      </div>
    </div>

    {/* Text body */}
    <div className="p-5 flex flex-col flex-1">
      <h3 className="font-serif text-xl text-sacred-red font-semibold mb-2 leading-snug">{deity.name}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed flex-1 line-clamp-3">{deity.description}</p>
      {deity.sevas.length > 0 && (
        <div className="mt-4">
          <p className="font-ui text-[9px] tracking-widest uppercase text-sacred-red/60 font-semibold mb-2">Sevas</p>
          <div className="flex flex-wrap gap-1.5">
            {deity.sevas.map(s => (
              <span key={s} className="bg-sacred-red/5 text-sacred-red font-ui text-[9px] tracking-wide px-2.5 py-0.5 rounded-full border border-sacred-red/10">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

// ── Deities Section ────────────────────────────────────────────────────────────
const DeitiesSection = () => (
  <section id="deities" className="bg-warm-cream py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4">
      <SectionHeading subtitle="Sacred Worship" title="Deities & Nithya Seva" centered />
      <p className="text-center text-neutral-500 text-base max-w-2xl mx-auto -mt-6 mb-14 leading-relaxed">
        Experience divine darshan of our sacred deities, each with their unique spiritual significance and daily worship rituals preserved for generations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DEITIES.map(d => <DeityCard key={d.id} deity={d} />)}
      </div>

      {/* Daily Seva Schedule */}
      <div className="mt-20">
        <SectionHeading subtitle="Temple Timings" title="Daily Seva Schedule" centered />
        <div className="relative max-w-3xl mx-auto mt-10">
          {/* vertical line */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-sacred-red/20" />
          <div className="space-y-8">
            {DAILY_SEVA_SCHEDULE.map((seva, i) => (
              <motion.div
                key={seva.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`flex items-center gap-6 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <p className="font-ui text-[10px] tracking-widest uppercase text-sacred-red/70 font-semibold mb-0.5">{seva.time}</p>
                  <h4 className="font-serif text-xl text-neutral-900">{seva.name}</h4>
                  <p className="text-neutral-500 text-sm">{seva.description}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-sacred-red ring-4 ring-sacred-red/20 z-10 flex-shrink-0" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
        <p className="text-center text-neutral-400 text-xs mt-10 max-w-xl mx-auto">
          Schedules are indicative and may vary on festival days. Please check Events for the latest timings and special celebrations.
        </p>
      </div>
    </div>
  </section>
);

// ── Homam Section ──────────────────────────────────────────────────────────────
const HomamSection = () => {
  const [form, setForm] = useState({ type: '', date: '', name: '', gotra: '', nakshatra: '', sankalpa: '' });
  const [submitted, setSubmitted] = useState(false);
  const [procedureOpen, setProcedureOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="homam" className="bg-neutral-950 py-16 md:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading subtitle="Vedic Fire Ritual" title="Homam" centered dark />
        <p className="text-center text-warm-cream/50 text-base max-w-2xl mx-auto -mt-6 mb-14 leading-relaxed">
          Homam (Havan) is a sacred Vedic fire ritual performed for purification, protection, and fulfillment of noble intentions.
        </p>

        {/* Procedure accordion */}
        <div className="max-w-3xl mx-auto mb-14">
          <button
            onClick={() => setProcedureOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-warm-cream font-ui text-xs tracking-widest uppercase font-semibold transition-colors"
          >
            <span>Standard Homa Procedure (Overview)</span>
            <ChevronRight size={16} className={`transition-transform duration-300 ${procedureOpen ? 'rotate-90' : ''}`} />
          </button>
          {procedureOpen && (
            <motion.ol
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 bg-white/5 border border-white/10 rounded-xl px-6 py-5 space-y-3 list-decimal list-inside"
            >
              {HOMAM_PROCEDURE_STEPS.map((step, i) => (
                <li key={i} className="text-warm-cream/60 text-sm leading-relaxed">
                  {step}
                </li>
              ))}
              <li className="pt-2">
                <a href="#" className="text-spiritual-gold font-ui text-xs tracking-widest uppercase underline underline-offset-4">
                  Download: Homa Procedure (PDF)
                </a>
              </li>
            </motion.ol>
          )}
        </div>

        {/* Homam type cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {HOMAM_TYPES.map(h => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-sacred-red/30 hover:bg-white/8 transition-all group"
            >
              <div className="text-3xl mb-3">{h.icon}</div>
              <h3 className="font-serif text-2xl text-warm-cream mb-3 group-hover:text-spiritual-gold transition-colors">{h.name}</h3>
              <p className="text-warm-cream/50 text-sm leading-relaxed mb-5">{h.description}</p>
              <button
                onClick={() => setForm(f => ({ ...f, type: h.id }))}
                className="font-ui text-[10px] tracking-widest uppercase font-semibold text-sacred-red border border-sacred-red/40 px-4 py-2 rounded-lg hover:bg-sacred-red hover:text-white transition-all"
              >
                Book Seva
              </button>
            </motion.div>
          ))}
        </div>

        {/* Booking form */}
        <div className="max-w-2xl mx-auto">
          <h3 className="font-serif text-3xl text-warm-cream text-center mb-8">Offer a Homam</h3>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-6 bg-white/5 border border-spiritual-gold/30 rounded-2xl"
            >
              <div className="text-4xl mb-4">🙏</div>
              <h4 className="font-serif text-2xl text-spiritual-gold mb-3">Request Received</h4>
              <p className="text-warm-cream/50 text-sm">Our team will contact you to confirm the schedule. May the divine blessings be upon you.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-7 space-y-5">
              <div>
                <label className="block font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-2">Homam</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-warm-cream text-sm focus:outline-none focus:border-sacred-red/60 transition-colors"
                >
                  <option value="" disabled>Select a Homam</option>
                  {HOMAM_TYPES.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-2">Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-warm-cream text-sm focus:outline-none focus:border-sacred-red/60 transition-colors"
                />
              </div>
              {[
                { name: 'name', label: 'Devotee Name', placeholder: 'Your full name' },
                { name: 'gotra', label: 'Gotra', placeholder: 'Your gotra' },
                { name: 'nakshatra', label: 'Nakshatra', placeholder: 'Your birth star' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-2">{f.label}</label>
                  <input
                    type="text"
                    name={f.name}
                    value={(form as Record<string, string>)[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-warm-cream text-sm placeholder-white/20 focus:outline-none focus:border-sacred-red/60 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-2">Sankalpa / Notes</label>
                <textarea
                  name="sankalpa"
                  value={form.sankalpa}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Your intention or prayer..."
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-warm-cream text-sm placeholder-white/20 focus:outline-none focus:border-sacred-red/60 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-sacred-red text-white font-ui text-xs tracking-widest uppercase font-semibold py-3.5 rounded-xl hover:bg-neutral-900 transition-all active:scale-[0.98]"
              >
                Submit Request
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const GuruHorizontalTimeline = ({
  gurus,
  activeIndex,
  onSelect,
}: {
  gurus: typeof GURU_LINEAGE;
  activeIndex: number;
  onSelect?: (index: number) => void;
}) => {
  const lineProgress = gurus.length > 1 ? activeIndex / (gurus.length - 1) : 0;
  return (
    <div className="relative mb-2 select-none">
      {/* Track - z-0 to stay behind */}
      <div className="absolute top-[22px] md:top-[28px] left-[4%] right-[4%] h-px bg-[#2d1a0a]/10 z-0" />
      {/* Fill - z-0 to stay behind */}
      <div
        className="absolute top-[22px] md:top-[28px] left-[4%] h-px bg-sacred-red transition-all duration-700 ease-out z-0"
        style={{ width: `${lineProgress * 92}%` }}
      />
      <div className="relative flex justify-between px-[4%] z-10">
        {gurus.map((guru, i) => {
          const past = i < activeIndex;
          const current = i === activeIndex;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onSelect?.(i)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect?.(i); } }}
            >
              <motion.div
                animate={{ scale: current ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className={`w-9 h-9 md:w-[44px] md:h-[44px] rounded-full overflow-hidden border-2 shadow-sm transition-all duration-500 bg-warm-cream ${current
                  ? 'border-sacred-red shadow-sacred-red/20'
                  : past
                    ? 'border-sacred-red/30'
                    : 'border-[#2d1a0a]/10'
                  }`}
              >
                <img
                  src={guru.image}
                  alt={guru.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${past || current ? '' : 'grayscale opacity-30'
                    }`}
                />
              </motion.div>
              <span
                className={`font-ui text-[8px] md:text-[10px] tracking-[0.1em] uppercase text-center leading-tight transition-colors duration-400 ${past || current ? 'text-sacred-red font-bold' : 'text-[#2d1a0a]/30'
                  }`}
              >
                {guru.year}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [isMuted, setIsMuted] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(AUDIO_TRACKS[0].id);
  const [trackMenuOpen, setTrackMenuOpen] = useState(false);
  const [page, setPage] = useState<'home' | 'donate'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#donate' ? 'donate' : 'home'
  );
  const [activeGuruIndex, setActiveGuruIndex] = useState(0);
  const [isGuruFixed, setIsGuruFixed] = useState(false);
  const [guruHeaderHeight, setGuruHeaderHeight] = useState(0);
  const NAVBAR_HEIGHT = 80;
  const heroRef = useRef(null);

  const aboutRef = useRef(null);
  const guruSectionRef = useRef<HTMLDivElement>(null);
  const guruHeaderRef = useRef<HTMLDivElement>(null);
  const guruCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToGuruCard = (index: number) => {
    const card = guruCardRefs.current[index];
    if (!card) return;

    setActiveGuruIndex(index);
    const rect = card.getBoundingClientRect();
    const headerHeight = guruHeaderRef.current?.getBoundingClientRect().height ?? 0;
    const offset = NAVBAR_HEIGHT + 12 + headerHeight + 24;

    window.scrollTo({
      top: Math.max(0, window.scrollY + rect.top - offset),
      behavior: 'smooth'
    });
  };

  const goToDonatePage = () => {
    setPage('donate');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#donate');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToHomePage = () => {
    setPage('home');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      setPage(window.location.hash === '#donate' ? 'donate' : 'home');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      const el = guruSectionRef.current;
      const header = guruHeaderRef.current;
      if (!el || !header) return;

      const sectionRect = el.getBoundingClientRect();
      const sectionTop = sectionRect.top + window.scrollY;
      const sectionHeight = sectionRect.height;
      const headerHeight = header.getBoundingClientRect().height;
      const topOffset = NAVBAR_HEIGHT + 12;
      const stickyStart = sectionTop - topOffset;
      const stickyEnd = sectionTop + sectionHeight - topOffset - headerHeight;
      const isFixed = window.scrollY >= stickyStart && window.scrollY < stickyEnd;

      setIsGuruFixed(isFixed);
      setGuruHeaderHeight(headerHeight);

      const scrollable = el.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY - sectionTop;
      const progress = Math.max(0, Math.min(1, scrolled / Math.max(1, scrollable)));
      const fallbackIndex = Math.min(Math.round(progress * (GURU_LINEAGE.length - 1)), GURU_LINEAGE.length - 1);

      const headerOffset = NAVBAR_HEIGHT + 12 + headerHeight + 24;
      const bestMatch = guruCardRefs.current.reduce(
        (best, card, cardIndex) => {
          if (!card) return best;
          const top = card.getBoundingClientRect().top;
          const distance = Math.abs(top - headerOffset);
          if (best === null || distance < best.distance) {
            return { index: cardIndex, distance };
          }
          return best;
        },
        null as { index: number; distance: number } | null
      );

      setActiveGuruIndex(bestMatch?.index ?? fallbackIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

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
        key={currentTrack}
        className="hidden"
        src={`https://www.youtube.com/embed/${currentTrack}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${currentTrack}`}
        allow="autoplay"
      />

      {/* Floating Audio Toggle + Track Picker */}
      <div
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-[100] flex flex-col items-end gap-2"
        onMouseEnter={() => setTrackMenuOpen(true)}
        onMouseLeave={() => setTrackMenuOpen(false)}
      >
        {/* Track picker popup */}
        <AnimatePresence>
          {trackMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="bg-neutral-900/95 backdrop-blur-xl border border-sacred-red/20 rounded-2xl overflow-hidden shadow-2xl"
            >
              <p className="px-4 pt-3 pb-1.5 font-ui text-[9px] tracking-[0.3em] uppercase text-warm-cream/30">Ambient Track</p>
              {AUDIO_TRACKS.map(track => (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrack(track.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sacred-red/10 transition-colors text-left"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${currentTrack === track.id ? 'bg-sacred-red' : 'bg-warm-cream/20'}`} />
                  <span className={`font-ui text-[10px] tracking-widest uppercase whitespace-nowrap transition-colors ${currentTrack === track.id ? 'text-sacred-red' : 'text-warm-cream/50'}`}>
                    {track.name}
                  </span>
                </button>
              ))}
              <div className="h-px bg-sacred-red/10 mx-3 my-1" />
              <button
                onClick={() => setIsMuted(m => !m)}
                className="w-full flex items-center gap-3 px-4 py-2.5 pb-3 hover:bg-sacred-red/10 transition-colors text-left"
              >
                <span className={`font-ui text-[9px] tracking-widest uppercase whitespace-nowrap ${isMuted ? 'text-warm-cream/30' : 'text-spiritual-gold'}`}>
                  {isMuted ? 'Unmuted off' : 'Playing'}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <button
          onClick={() => setIsMuted(m => !m)}
          className="w-14 h-14 bg-sacred-red/10 backdrop-blur-xl border border-sacred-red/20 rounded-full flex items-center justify-center text-sacred-red hover:bg-sacred-red hover:text-white transition-all active:scale-95 shadow-2xl"
        >
          <div className="relative w-6 h-6">
            <motion.div
              animate={{ opacity: isMuted ? 1 : 0, scale: isMuted ? 1 : 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <VolumeX size={24} />
            </motion.div>
            <motion.div
              animate={{ opacity: !isMuted ? 1 : 0, scale: !isMuted ? 1 : 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Volume2 size={24} />
            </motion.div>
          </div>
        </button>
      </div>

      <SpiritualChatbot />
      <Navbar onDonate={goToDonatePage} />

      {page === 'home' ? (
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
                  <button className="px-8 py-3 border border-sacred-red/10 text-[#2D1A0A] font-ui text-sm tracking-widest uppercase hover:bg-warm-cream/30 transition-all backdrop-blur-[20px] bg-warm-cream/20 shadow-xl active:scale-95 rounded-sm">
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
            <div ref={guruSectionRef} className="relative mt-8 mb-[40vh]">
              <div
                ref={guruHeaderRef}
                className={`z-[110] bg-warm-cream/95 backdrop-blur-md pt-4 pb-3 border-b border-sacred-red/5 ${isGuruFixed ? 'fixed left-0 right-0' : 'sticky'}`}
                style={{ top: `${NAVBAR_HEIGHT + 12}px` }}
              >
                <div className="max-w-7xl mx-auto px-4">
                  <span className="font-ui text-[9px] tracking-[0.28em] uppercase text-sacred-red/70 font-semibold block mb-2">
                    Succession of Wisdom
                  </span>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-[1px] bg-spiritual-gold/40 flex-1" />
                    <h2 className="text-3xl md:text-4xl lg:text-5xl text-neutral-900 leading-tight whitespace-nowrap font-serif">
                      Guru Parampara
                    </h2>
                    <div className="h-[1px] bg-spiritual-gold/40 flex-1" />
                  </div>
                  <div className="-mt-3">
                    <GuruHorizontalTimeline gurus={GURU_LINEAGE} activeIndex={activeGuruIndex} onSelect={scrollToGuruCard} />
                  </div>
                </div>
              </div>
              {isGuruFixed && (
                <div style={{ height: guruHeaderHeight }} aria-hidden="true" className="w-full" />
              )}

              <div className="max-w-5xl mx-auto px-4 mt-160">
                <ScrollStack
                  itemDistance={70}
                  itemScale={0.04}
                  itemStackDistance={24}
                  stackPosition="20%"
                  useWindowScroll={true}
                  className="relative"
                >
                  {GURU_LINEAGE.map((guru, index) => (
                    <ScrollStackItem
                      key={index}
                      ref={(el) => { guruCardRefs.current[index] = el; }}
                    >
                      <div className="h-[54vh] w-[80%] md:w-[70%] lg:w-[65%] mx-auto rounded-[32px] overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.1)] group/card border border-white/5">
                        <img
                          src={guru.image}
                          alt={guru.name}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] group-hover/card:scale-110 group-hover/card:rotate-1"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/30 to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          >
                            <span className="font-ui text-spiritual-gold text-base md:text-lg tracking-[0.4em] font-bold block mb-4 drop-shadow-lg">
                              {guru.year}
                            </span>
                            <h3 className="text-4xl md:text-6xl font-serif text-warm-cream leading-tight mb-6 drop-shadow-2xl">
                              {guru.name}
                            </h3>
                            <p className="text-warm-cream/70 text-sm md:text-base max-w-xl font-sans leading-relaxed border-l border-spiritual-gold/30 pl-4 italic">
                              {guru.description}
                            </p>
                          </motion.div>
                        </div>

                        {/* Decorative Year Watermark */}
                        <div className="absolute top-8 right-8 font-serif text-4xl md:text-4xl pointer-events-none select-none" style={{ color: 'rgba(253, 251, 247, 0.1)' }}>
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
          <DeitiesSection />
          <HomamSection />
          <CalendarSection />

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

          <InteractiveDarshan />

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
      ) : (
        <DonationPage onBack={goToHomePage} />
      )}

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