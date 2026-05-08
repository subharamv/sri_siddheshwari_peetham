import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, X, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import ScrollVelocity from './ScrollVelocity';
import InfiniteMenu, { MenuItem } from './InfiniteMenu';
import annadanamImg from '../assets/annadanam.jpg';
import goSevaImg from '../assets/go-seva.png';
import oldAgeHomeImg from '../assets/old-age-home.png';
import srisailamImg from '../assets/srisailam.jpg';
import dharmaRakshanaImg from '../assets/dharma-rakshana.jpg';
import homaImg from '../assets/homa.jpg';
import trivikramaTrustImg from '../assets/trivikrama-trust.jpg';
import vedicLibraryImg from '../assets/vedic-library.jpg';

interface ActivitiesPageProps {
  onBack?: () => void;
}

interface ActivityDetail {
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  images: string[];
  highlights: string[];
}

const ACTIVITY_DETAILS: ActivityDetail[] = [
  {
    title: 'Annadanam',
    subtitle: 'The Greatest Sacred Offering',
    description: 'Feeding the hungry with divine prasadam daily',
    longDescription:
      'Annadanam — the great gift of food — is considered the highest of all charitable acts in Sanatana Hindu Dharma. Sri Siddheswari Peetham operates the Raja Rajeswari Annadaana Samaajam in Courtallam, serving free meals twice daily to devotees, pilgrims, and the less fortunate, regardless of caste, creed, or background. This tradition was personally initiated by Sri Mounaswamy and continues unbroken to this day.',
    images: [
      annadanamImg,
    ],
    highlights: [
      'Free meals served twice daily',
      'Open to all regardless of background',
      'Tradition started by Sri Mounaswamy',
      'Managed by Raja Rajeswari Annadaana Samaajam',
    ],
  },
  {
    title: 'Go Shala',
    subtitle: 'Sacred Cow Sanctuary',
    description: 'Goseva — worship and care of sacred cows',
    longDescription:
      'The Peetham maintains a Go Shala (cow sanctuary) where cattle are treated with reverence as sacred beings. Daily worship (Gomata Puja), feeding, and medical care are provided. The Go Shala embodies the ancient Hindu belief that the cow is a sacred mother who sustains life. The Trivikrama Trust actively supports this cow protection initiative and sponsors its upkeep.',
    images: [
      goSevaImg,
    ],
    highlights: [
      'Daily Gomata Puja performed',
      'Veterinary care provided',
      'Supported by Trivikrama Trust',
      'Milk used for temple abhishekam',
    ],
  },
  {
    title: 'Old Age Home',
    subtitle: 'Spiritual Retirement Ashram',
    description: 'Peaceful residence for devotees seeking spiritual life',
    longDescription:
      'The Peetham offers apartment-style accommodations in Courtallam for retired devotees who wish to spend their twilight years in spiritual practice, worship, and peace. Residents have access to the temple, a library of Vedic texts, communal dining, and regular satsangs. The environment is designed to support a life of contemplation and devotion in the presence of the divine.',
    images: [
      oldAgeHomeImg,
    ],
    highlights: [
      'Apartment-style accommodations',
      'Temple access for daily worship',
      'Community dining and satsangs',
      'Library of Vedic literature',
    ],
  },
  {
    title: 'Sri Sailam Project',
    subtitle: 'Meditation & Pilgrimage Retreat',
    description: 'Meditation facilities near the sacred Sri Sailam temple',
    longDescription:
      'The Peetham has developed a retreat center near the holy Sri Sailam Jyotirlinga temple complex. The project offers single and double rooms on a time-share basis for devotees wishing to undertake extended meditation and pilgrimage. The location near one of the twelve Jyotirlingas provides an unparalleled environment for deep spiritual practice.',
    images: [
      srisailamImg,
    ],
    highlights: [
      'Located near Sri Sailam Jyotirlinga',
      'Single and double room accommodations',
      'Meditation and retreat programs',
      'Time-share basis availability',
    ],
  },
  {
    title: 'Dharma Rakshana Yagnas',
    subtitle: 'Protecting Sanatana Dharma',
    description: 'Large-scale sacred fire ceremonies for dharmic protection',
    longDescription:
      'The Peetham regularly conducts large-scale Yagnas (sacred fire rituals) with the specific intention of protecting and spreading Sanatana Hindu Dharma, both within India and across the world. These elaborate ceremonies involve hundreds of priests and thousands of devotees, invoking divine blessings for the preservation of ancient spiritual knowledge and values.',
    images: [
      dharmaRakshanaImg,
    ],
    highlights: [
      'Conducted in India and abroad',
      'Hundreds of priests participate',
      'Focused on dharmic protection',
      'Open to all devotees',
    ],
  },
  {
    title: 'Prayojana Homas',
    subtitle: 'Sacred Fire Rituals for Devotees',
    description: 'Homams for health, prosperity, education and family welfare',
    longDescription:
      'The Peetham conducts Prayojana Homas — specific fire rituals designed to address the needs of individual devotees and families. These include homas for health and healing, education and career success, removal of obstacles, family welfare, and spiritual progress. Trained priests perform these rituals following strict Vedic procedures on auspicious days.',
    images: [
      homaImg,
    ],
    highlights: [
      'Health and healing homas',
      'Education and career rituals',
      'Obstacle removal ceremonies',
      'Family welfare pujas',
    ],
  },
  {
    title: 'Trivikrama Trust',
    subtitle: 'Education & Cow Protection',
    description: 'Supporting Vedic education and cow protection initiatives',
    longDescription:
      'The Trivikrama Trust was established under the guidance of Sri Trivikrama Ramananda Saraswathi Swamiji to support two core missions: cow protection (Go Raksha) and education. The Trust sponsors deserving students in both Vedic and general education, ensuring that the ancient knowledge of the Vedas continues to be transmitted to future generations while also providing modern educational opportunities.',
    images: [
      trivikramaTrustImg,
    ],
    highlights: [
      'Vedic education scholarships',
      'General education support',
      'Go Raksha (cow protection)',
      'Founded by Sri Trivikrama Ramananda',
    ],
  },
  {
    title: 'Annadhana Samajam',
    subtitle: 'Charitable Meal Service',
    description: 'Sri Raja Rajeswari charitable organization for feeding all',
    longDescription:
      'Sri Raja Rajeswari Annadhana Samajam is a registered charitable organization operating under the Peetham\'s guidance. It is dedicated solely to providing wholesome meals to those in need — pilgrims, the elderly, students, and the destitute — without any discrimination. The samajam works in coordination with volunteers and donors to ensure that no one leaves hungry from the Peetham.',
    images: [
      annadanamImg,
    ],
    highlights: [
      'Registered charitable organization',
      'No discrimination in service',
      'Volunteer-driven operations',
      'Donor-supported daily meals',
    ],
  },
  {
    title: 'Vedic Library',
    subtitle: 'Repository of Sacred Knowledge',
    description: 'Collection of Vedas, Upanishads, Puranas in multiple languages',
    longDescription:
      'The Peetham maintains an extensive library housing rare and sacred texts including the four Vedas, 108 Upanishads, 18 Maha Puranas, Itihasas, and commentary literature in Sanskrit, Telugu, Hindi, Tamil, and English. The library is open to scholars, devotees, and researchers who wish to study the depth of Sanatana Dharma. Regular study circles and discourse sessions are held using these texts.',
    images: [
      vedicLibraryImg,
    ],
    highlights: [
      'Vedas, Upanishads, Puranas collection',
      'Sanskrit, Telugu, Hindi, Tamil, English',
      'Open to scholars and devotees',
      'Regular study circles conducted',
    ],
  },
];

const MENU_ITEMS: MenuItem[] = ACTIVITY_DETAILS.map(a => ({
  image: a.images[0],
  link: '',
  title: a.title,
  description: a.description,
}));

const ActivitiesPage = ({ onBack }: ActivitiesPageProps) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetail | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openActivity = (item: MenuItem) => {
    const detail = ACTIVITY_DETAILS.find(a => a.title === item.title);
    if (detail) {
      setSelectedActivity(detail);
      setGalleryIndex(0);
    }
  };

  const closeModal = () => setSelectedActivity(null);

  useEffect(() => {
    if (selectedActivity) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedActivity]);

  const prevImage = () => {
    if (!selectedActivity) return;
    setGalleryIndex(i => (i - 1 + selectedActivity.images.length) % selectedActivity.images.length);
  };

  const nextImage = () => {
    if (!selectedActivity) return;
    setGalleryIndex(i => (i + 1) % selectedActivity.images.length);
  };

  return (
    <section className="relative z-10 bg-neutral-950 text-warm-cream">
      {/* Back button — top left */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Home"
          className="hidden lg:flex fixed top-9 left-8 z-[100] items-center gap-2 rounded-full bg-neutral-950/80 backdrop-blur-sm border border-white/10 text-warm-cream/70 hover:text-warm-cream hover:border-white/30 hover:bg-[#A02d23] transition-all shadow-lg px-4 py-2"
        >
          <ChevronLeft size={16} />
          <span className="font-ui text-[10px] tracking-[0.2em] uppercase">Home</span>
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-14">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-ui text-[10px] tracking-[0.35em] uppercase text-sacred-red/80 mb-3 block"
            >
              Sacred Service
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            >
              Activities rooted in dharma, compassion, and divine service.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-base md:text-lg text-warm-cream/70 max-w-2xl leading-relaxed"
            >
              Explore the Peetham's living traditions — from daily annadanam and goseva to yagnas, education, and vedic preservation. Drag to rotate the globe and click ↗ to learn more.
            </motion.p>
          </div>

        </div>

        {/* InfiniteMenu Globe */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative mb-14"
        >
          {/* Corner peek hints — visible on mobile to signal draggable sphere */}
          <div className="absolute -top-3 -left-3 w-14 h-14 rounded-full border border-sacred-red/30 bg-sacred-red/10 blur-sm lg:hidden pointer-events-none z-10" />
          <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full border border-warm-cream/20 bg-warm-cream/5 blur-sm lg:hidden pointer-events-none z-10" />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full border border-warm-cream/20 bg-warm-cream/5 blur-sm lg:hidden pointer-events-none z-10" />
          <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full border border-sacred-red/30 bg-sacred-red/10 blur-sm lg:hidden pointer-events-none z-10" />

          <div
            className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 overflow-hidden shadow-2xl"
            style={{ height: '70vh', minHeight: 480 }}
          >
            <InfiniteMenu items={MENU_ITEMS} scale={1.0} onItemClick={openActivity} />
          </div>
        </motion.div>

        {/* Activity Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITY_DETAILS.map((activity, index) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.07 }}
              className="rounded-[28px] border border-warm-cream/10 bg-neutral-900 overflow-hidden cursor-pointer group shadow-xl hover:border-sacred-red/40 transition-all"
              onClick={() => { setSelectedActivity(activity); setGalleryIndex(0); }}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={activity.images[0]}
                  alt={activity.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent" />
              </div>
              <div className="p-6">
                <p className="text-xs tracking-[0.35em] uppercase text-sacred-red/70">{activity.subtitle}</p>
                <h3 className="mt-2 text-xl font-serif font-semibold text-warm-cream">{activity.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-warm-cream/60 line-clamp-2">{activity.description}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-sacred-red/80 hover:text-sacred-red transition-colors"
                >
                  Read More <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ScrollVelocity footer band */}
      <div className="bg-neutral-900 overflow-hidden py-14 border-b border-warm-cream/5 mt-10">
        <ScrollVelocity
          texts={['Sri Siddheswari Peetham • Annadanam • Go Seva • Dharma Rakshana • Vedic Library • Trivikrama Trust • ']}
          velocity={30}
          className="font-serif text-3xl italic text-warm-cream/20 mx-24 tracking-widest"
          numCopies={4}
        />
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            key="activity-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 pt-20 pb-4 md:p-8"
            style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)' }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[42rem] rounded-[28px] bg-neutral-900 border border-warm-cream/10 shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: 'calc(100dvh - 5.5rem)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button — absolute inside card, always visible */}
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-neutral-950/80 border border-warm-cream/15 text-warm-cream/60 hover:text-warm-cream hover:bg-[#A02d23] transition-all shadow-xl backdrop-blur-sm"
              >
                <X size={16} />
              </button>

              {/* Scrollable content */}
              <div className="overflow-y-auto activity-modal-scrollbar flex-1">
                {/* Gallery */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-[28px]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={galleryIndex}
                      src={selectedActivity.images[galleryIndex]}
                      alt={`${selectedActivity.title} image ${galleryIndex + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.35 }}
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />

                  {/* Gallery controls */}
                  {selectedActivity.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-950/70 border border-warm-cream/10 text-warm-cream hover:bg-[#A02d23] transition-all"
                      >
                        <ChevronLeftIcon size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-950/70 border border-warm-cream/10 text-warm-cream hover:bg-[#A02d23] transition-all"
                      >
                        <ChevronRightIcon size={18} />
                      </button>

                      {/* Dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedActivity.images.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setGalleryIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === galleryIndex ? 'bg-[#A02d23] w-4' : 'bg-warm-cream/30'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <p className="text-xs tracking-[0.35em] uppercase text-[#A02d23]/90 mb-2">{selectedActivity.subtitle}</p>
                  <h2 className="font-serif text-3xl font-bold text-warm-cream mb-3">{selectedActivity.title}</h2>
                  <p className="text-warm-cream/70 leading-relaxed mb-6 text-sm md:text-base">{selectedActivity.longDescription}</p>

                  {/* Highlights */}
                  <div className="border-t border-warm-cream/10 pt-4">
                    <p className="text-xs tracking-[0.25em] uppercase text-warm-cream/40 mb-3">Key Highlights</p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {selectedActivity.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-warm-cream/70">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#A02d23] flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ActivitiesPage;
