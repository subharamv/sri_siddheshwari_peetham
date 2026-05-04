import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, BookOpen, ChevronLeft, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import ScrollVelocity from './ScrollVelocity';

interface PublicationsPageProps {
  onBack?: () => void;
}

type Category = 'All' | 'Devotional' | 'Philosophy' | 'Literature' | 'Biography';

interface Publication {
  title: string;
  description: string;
  category: Category;
  language?: string;
  year?: string;
}

const PUBLICATIONS: Publication[] = [
  { title: 'Ambica Sahasri', description: '300 Sanskrit verses and 700 Telugu poems praising Sri Raja Rajeswari, detailing the innumerable miracles of Sri Jillellamudi Amma.', category: 'Devotional', language: 'Sanskrit & Telugu' },
  { title: 'Siva Sahasri', description: 'Spiritual guide containing 300 Sanskrit slokas and 700 Telugu poems explaining Siva philosophy for seekers.', category: 'Devotional', language: 'Sanskrit & Telugu' },
  { title: 'Aindri Sahasri', description: 'Focuses on ChinnaMasta from the Dasa Maha Vidyas, incorporating a yogic interpretation of this deity\'s iconography.', category: 'Devotional', language: 'Sanskrit & Telugu' },
  { title: 'Dasa Mahavidhyalu', description: 'Comprehensive guide to the ten Mahavidyas with devotional methods, descriptions, and sadhana practices.', category: 'Devotional', language: 'Telugu' },
  { title: 'Pratyangira Sadhana', description: 'Ancient spiritual procedures featuring the most powerful deity in Atharvaveda — Pratyangira Devi.', category: 'Devotional' },
  { title: 'Bhairava Sadhana', description: 'History and worship methods of Lord Bhairava across multiple temple sites and traditions.', category: 'Devotional' },
  { title: 'Naga Sadhana', description: 'Explores serpent worship and chakra activation through yoga practice and Naga Devata traditions.', category: 'Devotional' },
  { title: 'Radha Lahari', description: 'Sanskrit and Telugu praises of Radha Devi in 12 parts, celebrating her divine love and devotion.', category: 'Devotional', language: 'Sanskrit & Telugu', year: '2003' },
  { title: 'Soundarya Lahari', description: 'Translation of Adi Shankaracharya\'s celebrated text describing the universal mother in all her glory.', category: 'Devotional' },
  { title: 'Tantric World', description: 'Essays addressing misconceptions about Mantra and Tantra, originally published in Andhra Prabha (1970).', category: 'Philosophy', year: '1970' },
  { title: 'History of Lalitha Devi', description: 'Addresses concerns about Lalitha worship with biographical details about commentators and the tradition.', category: 'Philosophy' },
  { title: 'Our Problems and Mantra Sadhana', description: 'Solutions for contemporary human issues through mantra practice and spiritual discipline.', category: 'Philosophy' },
  { title: 'Andhra Bhagavatha Vimarsa', description: 'Doctoral dissertation on Andhra Bhagavatha criticism — noted as the most useful handbook for the research student.', category: 'Philosophy', language: 'Telugu' },
  { title: 'Samskruthi (Culture)', description: 'Analysis of Indian and Andhra cultural heritage, traditions, and their relevance today.', category: 'Philosophy', language: 'Telugu' },
  { title: 'Deities in America', description: '21-chapter compilation of speeches delivered at TANA meetings in the USA on Hindu deities and traditions.', category: 'Philosophy', year: '2001' },
  { title: 'Rasa Vahini', description: 'Explores devotion, love, and various mental vibrations and poetic values of the spiritual path.', category: 'Literature', language: 'Telugu' },
  { title: 'Rasa Ganga', description: 'Khanda Kavya with six sections: Devi Lahari, Yatra Lahari, Siddha Lahari, Tatvika Lahari, Mukthaka Lahari, Sahithi Lahari.', category: 'Literature', language: 'Telugu' },
  { title: 'Gandharva Geethi', description: 'Two-part philosophical work inspired by Omar Khayyam\'s ideas, combining traditional and modern poetic forms.', category: 'Literature' },
  { title: 'Aananda Yogini', description: 'Novel exploring metaphysical concepts through protagonist Aananda on a transformative spiritual path.', category: 'Literature', language: 'Telugu' },
  { title: 'Vraja Bhagatham', description: '21-chapter research work on Sri Krishna and Radha Devi in Telugu literature and their divine significance.', category: 'Literature', language: 'Telugu' },
  { title: 'Kavitha Mahendrajaalam', description: 'Survey of poetic traditions from ancient to modern periods, including Avadhana techniques and schools.', category: 'Literature', language: 'Telugu' },
  { title: 'Bhuvana Vijayam', description: '31 playlets based on royal court traditions and classical poets of Telugu literary history.', category: 'Literature', language: 'Telugu' },
  { title: 'Ramani Priya Doothika', description: 'Novel combining poetry and prose exploring themes of love and divine intervention in human life.', category: 'Literature', language: 'Telugu' },
  { title: 'Dyvee Sakthi', description: 'Historical narrative of Radha Mahalakshmi and the expression of divine grace through devotion.', category: 'Literature', language: 'Telugu' },
  { title: 'Vande Matharam', description: 'Translation and historical context of India\'s national song with spiritual interpretation.', category: 'Literature' },
  { title: 'Kavi Raju Katha', description: 'Biography of Srinadha Kavi including tantric secrets and the poet\'s extraordinary life and works.', category: 'Literature', language: 'Telugu' },
  { title: 'Kavi Brahma', description: 'Drama depicting the life of Tikkana, called the Kavi Brahma of Telugu literature — a monumental work.', category: 'Literature', language: 'Telugu' },
  { title: 'Kavya Kantha Roopkam', description: 'Seven-chapter biographical drama of Kavya Kantha Ganapathi Muni and his spiritual and literary legacy.', category: 'Literature', language: 'Telugu' },
  { title: 'Sri Mouna Swamy with Himalayan Siddhas', description: 'Details about the Peetham\'s revered founder Sri Mounaswamy meeting Himalayan yogis and receiving their blessings.', category: 'Biography' },
  { title: 'Yogis of Courtallam', description: 'Biographical accounts of notable spiritual figures connected to Courtallam, including the Peetham\'s own lineage.', category: 'Biography', language: 'Telugu' },
  { title: 'Jagadguru Shankaracharya', description: 'Biography emphasizing Shankaracharya as a great prophet chosen by the divine to restore dharma.', category: 'Biography' },
  { title: 'Vasistha Bharathi', description: 'Biography of Kavya Kantha Vasista Ganapathi Muni, released during his birth centenary celebration.', category: 'Biography' },
  { title: 'Brindavana Yogis', description: 'Comprehensive encyclopedia of Radha devotees including Haridas Maharaj, Chaitanya Maha Prabhu, and others.', category: 'Biography', language: 'Telugu' },
  { title: 'Brindavana Bhagavatham', description: 'Compilation from multiple Puranas analysing Radha-Krishna theology and Brindavan pilgrimage sites.', category: 'Biography', language: 'Telugu' },
  { title: 'Kali Siddhulu', description: 'Historical and mythological narratives of Kali worship and devotees — noted as unique in Telugu literature.', category: 'Biography', language: 'Telugu' },
  { title: 'History of Rana Pratap Singh', description: 'Lectures compiled from National Sahitya Parishad inspiring nationalist sentiment and historical pride.', category: 'Biography' },
  { title: 'The Student Movement (Vidhyardhi Udyamamu)', description: 'Critiques the decline of India\'s educational system post-independence and offers a dharmic perspective.', category: 'Philosophy', language: 'Telugu' },
  { title: 'Hanuman', description: 'Character study printed by TTD emphasising dharmacharana, good character, and an ideal life style.', category: 'Devotional' },
  { title: 'Tirupathi Venkata Kavulu & Kopparapu Sodara Kavulu', description: 'Lecture-based book on classical poet couples and their extraordinary literary achievements in Telugu.', category: 'Literature', language: 'Telugu' },
];

const CATEGORIES: Category[] = ['All', 'Devotional', 'Philosophy', 'Literature', 'Biography'];

const CATEGORY_COLORS: Record<Category, string> = {
  All: 'text-warm-cream/60 border-warm-cream/20',
  Devotional: 'text-spiritual-gold border-spiritual-gold/30 bg-spiritual-gold/5',
  Philosophy: 'text-blue-300 border-blue-400/30 bg-blue-900/10',
  Literature: 'text-emerald-300 border-emerald-400/30 bg-emerald-900/10',
  Biography: 'text-purple-300 border-purple-400/30 bg-purple-900/10',
};

const PublicationsPage = ({ onBack }: PublicationsPageProps) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);

  const filtered = useMemo(() => {
    return PUBLICATIONS.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const q = query.toLowerCase();
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [activeCategory, query]);

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
              Books & Publications
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            >
              Sacred knowledge preserved in ink and verse.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-base md:text-lg text-warm-cream/70 max-w-2xl leading-relaxed"
            >
              An extensive collection of works authored by Sri Swamiji spanning Vedic devotion, Tantric philosophy, Telugu literature, and spiritual biography — available through the Peetham.
            </motion.p>
          </div>

        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          {CATEGORIES.filter(c => c !== 'All').map(cat => (
            <div key={cat} className="rounded-2xl border border-warm-cream/8 bg-neutral-900 p-4 text-center">
              <p className="font-serif text-2xl font-bold text-warm-cream">
                {PUBLICATIONS.filter(p => p.category === cat).length}
              </p>
              <p className="text-xs tracking-[0.2em] uppercase text-warm-cream/40 mt-1">{cat}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter + Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-ui tracking-[0.2em] uppercase border transition-all ${activeCategory === cat
                  ? 'bg-sacred-red border-sacred-red text-neutral-900 font-semibold'
                  : 'border-warm-cream/15 text-warm-cream/50 hover:border-warm-cream/30 hover:text-warm-cream/80'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/30" />
            <input
              type="text"
              placeholder="Search titles…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-full border border-warm-cream/10 bg-neutral-900 pl-9 pr-4 py-2.5 text-sm text-warm-cream placeholder-warm-cream/30 outline-none focus:border-sacred-red/50 transition"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-cream/30 hover:text-warm-cream/70">
                <X size={13} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-xs text-warm-cream/30 tracking-[0.15em] uppercase mb-6">
          {filtered.length} publication{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          {query ? ` matching "${query}"` : ''}
        </p>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((pub, index) => (
              <motion.div
                key={pub.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
                onClick={() => setSelectedPub(pub)}
                className="group rounded-[22px] border border-warm-cream/8 bg-neutral-900 p-5 cursor-pointer hover:border-sacred-red/30 hover:bg-neutral-800/60 transition-all flex flex-col gap-3"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-sacred-red/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-sacred-red/80" />
                </div>

                {/* Category tag */}
                <span className={`self-start text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[pub.category]}`}>
                  {pub.category}
                </span>

                {/* Title */}
                <h3 className="font-serif text-base font-semibold text-warm-cream leading-snug group-hover:text-warm-cream transition-colors">
                  {pub.title}
                </h3>

                {/* Description */}
                <p className="text-xs leading-relaxed text-warm-cream/50 line-clamp-3 flex-1">
                  {pub.description}
                </p>

                {/* Meta */}
                {(pub.language || pub.year) && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-warm-cream/5">
                    {pub.language && (
                      <span className="text-[10px] text-warm-cream/30">{pub.language}</span>
                    )}
                    {pub.year && (
                      <span className="text-[10px] text-warm-cream/30 ml-auto">{pub.year}</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-warm-cream/30">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm tracking-[0.2em] uppercase">No publications found</p>
          </div>
        )}

        {/* Purchase info */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-14 rounded-[32px] border border-warm-cream/10 bg-neutral-900 p-8 md:p-10 shadow-2xl"
        >
          <p className="text-xs tracking-[0.35em] uppercase text-sacred-red/80 mb-3">How to Order</p>
          <h2 className="font-serif text-3xl font-bold text-warm-cream mb-4">Obtain these sacred texts</h2>
          <p className="text-warm-cream/60 text-sm leading-relaxed max-w-2xl mb-6">
            Books authored during the pre-monastic period are available through the AVKF website (US orders) and Sri Siddheswari Peetham branches (international orders).
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-warm-cream/8 bg-neutral-950 p-5">
              <p className="text-xs tracking-[0.2em] uppercase text-warm-cream/40 mb-2">Contact — Books</p>
              <p className="text-warm-cream font-semibold">Shri P. Kanta Rao Gaaru</p>
              <p className="text-warm-cream/50 text-sm mt-1">+91 98491 10864</p>
            </div>
            <div className="rounded-2xl border border-warm-cream/8 bg-neutral-950 p-5">
              <p className="text-xs tracking-[0.2em] uppercase text-warm-cream/40 mb-2">PRO Office</p>
              <p className="text-warm-cream font-semibold">Sri Siddheswari Peetham</p>
              <p className="text-warm-cream/50 text-sm mt-1">+91 94402 08103</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ScrollVelocity footer band */}
      <div className="bg-neutral-900 overflow-hidden py-14 border-b border-warm-cream/5 mt-10">
        <ScrollVelocity
          texts={['Sri Siddheswari Peetham • Sacred Texts • Vedic Knowledge • Telugu Literature • Spiritual Biography • ']}
          velocity={30}
          className="font-serif text-3xl italic text-warm-cream/20 mx-24 tracking-widest"
          numCopies={4}
        />
      </div>

      {/* Publication detail modal */}
      <AnimatePresence>
        {selectedPub && (
          <motion.div
            key="pub-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
            style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)' }}
            onClick={() => setSelectedPub(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg rounded-[32px] bg-neutral-900 border border-warm-cream/10 shadow-2xl p-8 md:p-10"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPub(null)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-neutral-800 border border-warm-cream/10 text-warm-cream/50 hover:text-warm-cream hover:bg-sacred-red transition-all"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-sacred-red/10 flex items-center justify-center mb-5">
                <BookOpen size={22} className="text-sacred-red" />
              </div>

              <span className={`inline-block text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border mb-4 ${CATEGORY_COLORS[selectedPub.category]}`}>
                {selectedPub.category}
              </span>

              <h2 className="font-serif text-2xl md:text-3xl font-bold text-warm-cream mb-4 leading-snug">{selectedPub.title}</h2>
              <p className="text-warm-cream/70 leading-relaxed text-sm">{selectedPub.description}</p>

              {(selectedPub.language || selectedPub.year) && (
                <div className="mt-6 pt-5 border-t border-warm-cream/10 flex gap-6">
                  {selectedPub.language && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-warm-cream/30 mb-1">Language</p>
                      <p className="text-sm text-warm-cream/70">{selectedPub.language}</p>
                    </div>
                  )}
                  {selectedPub.year && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-warm-cream/30 mb-1">Published</p>
                      <p className="text-sm text-warm-cream/70">{selectedPub.year}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-warm-cream/10">
                <p className="text-xs text-warm-cream/40 leading-relaxed">
                  To purchase this title, contact Shri P. Kanta Rao Gaaru at <span className="text-warm-cream/60">+91 98491 10864</span> or reach the Peetham PRO at <span className="text-warm-cream/60">+91 94402 08103</span>.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PublicationsPage;
