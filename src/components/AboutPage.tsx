import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ChevronLeft, Heart, Leaf, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import React from 'react';
import ScrollVelocity from './ScrollVelocity';

interface AboutPageProps {
    onBack?: () => void;
}

const FEATURES = [
    {
        title: 'Sacred Location',
        description: 'Nestled in Courtallam, the Peetham sits in the holy Agasthya Kshethram near the healing waterfalls.',
        icon: <MapPin size={20} className="text-sacred-red" />,
    },
    {
        title: 'Vedic Traditions',
        description: 'Following Sri Adi Shankaracharya’s path, the Peetham preserves Veda Dharma, meditation, and devotional ritual.',
        icon: <BookOpen size={20} className="text-sacred-red" />,
    },
    {
        title: 'Natural Healing',
        description: 'Courtallam’s medicinal springs and mountain herbs complement every spiritual retreat and pilgrimage.',
        icon: <Leaf size={20} className="text-sacred-red" />,
    },
];

const GURU_PARAMAPARA = [
    {
        name: 'H.H. Sri Sivachidananda Saraswati Swamy (Mounaswamy)',
        role: 'Founder',
        years: '1910 - 1943',
    },
    {
        name: 'H.H. Sri Vimalananda Bharathi Swamy',
        role: 'First Peethadhipathi',
        years: '1944 – 1950',
    },
    {
        name: 'H.H. Sri Trivikramaramananda Bharathi Swamy',
        role: 'Second Peethadhipathi',
        years: '1950 – 1991',
    },
    {
        name: 'H.H. Sri Sivachidananda Bharathi Swamy',
        role: 'Third Peethadhipathi',
        years: '1991 – 2002',
    },
    {
        name: 'H.H. Sri Siddheswarananda Bharati Swamy',
        role: 'Fourth Peethadhipathi',
        years: '2002 – Present',
    },
    {
        name: 'Sri Datteshwarananda Bharati',
        role: 'Uttaradhikari',
        years: 'Successor',
    },
];

const GALLERY_IMAGES = [
    {
        src: 'https://srisiddheshwaripeetham.com/_next/image?url=%2Fmounaswami%2Fmouna-swami-tapas.jpg&w=828&q=75',
        caption: 'H.H. Sri Mouna Swamy — Founder',
    },
    {
        src: 'https://srisiddheshwaripeetham.com/_next/image?url=%2FSiddheswarananda%20Bharati%2Fsiddheswarananda-bharati-current.jpg&w=828&q=75',
        caption: 'H.H. Sri Siddheswarananda Bharati Swamy — Current Peethadhipathi',
    },
    {
        src: 'https://srisiddheshwaripeetham.com/_next/image?url=%2Fmounaswami%2Fmouna-swami-tapas.jpg&w=828&q=75',
        caption: 'The sacred atmosphere of Sri Siddheswari Peetham',
    },
    {
        src: 'https://srisiddheshwaripeetham.com/_next/image?url=%2FSiddheswarananda%20Bharati%2Fsiddheswarananda-bharati-current.jpg&w=828&q=75',
        caption: 'Courtallam’s devotional landscape',
    },
];

const AboutPage = ({ onBack }: AboutPageProps) => {
    return (
        <section className="relative z-10 bg-neutral-950 text-warm-cream mb-[60vh]">
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
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-14">
                    <div className="max-w-3xl">
                        <motion.span
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="font-ui text-[10px] tracking-[0.35em] uppercase text-sacred-red/80 mb-3 block"
                        >
                            About Sri Siddheswari Peetham
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                        >
                            A sacred lineage of silence, service, and spiritual sanctuary.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-6 text-base md:text-lg text-warm-cream/70 max-w-2xl leading-relaxed"
                        >
                            Founded by H.H. Sri Sivachidananda Saraswati Swamy (Mounaswamy), the Peetham honors Sri Raja Rajeswari Ambal, preserves Vedic wisdom, and welcomes seekers to Courtallam’s healing fold.
                        </motion.p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 mb-14">
                    {FEATURES.map((feature) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.65 }}
                            className="rounded-[32px] border border-warm-cream/10 bg-neutral-900 p-8 shadow-2xl"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sacred-red/10 text-sacred-red mb-6">
                                {feature.icon}
                            </div>
                            <h2 className="text-2xl font-serif text-warm-cream mb-3">{feature.title}</h2>
                            <p className="text-sm leading-relaxed text-warm-cream/65">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid gap-10 xl:grid-cols-[1.4fr_1fr] mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <Sparkles size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">Sacred Foundation</p>
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-6">From Sri Dattatreya Matam to a living Peetham.</h2>
                        <div className="space-y-6 text-warm-cream/70 leading-relaxed text-base">
                            <p>
                                Sri Siddheswari Peetham was established in 1910 by H.H. Sri Sivachidananda Saraswati Swamy (Mounaswamy) as Sri Dattatreya Matam. The first deity worshipped was Sri Dandayudhapani Swamy, and in 1916 Sri Raja Rajeswari Devi and Sri Kameswara Swamy were consecrated as the principal deities.
                            </p>
                            <p>
                                The Peetham’s spiritual heart is Sri Raja Rajeswari Ambal, also known as Sri Siddeshwari Devi, whose grace continues to guide devotees through ritual, meditation, and seva.
                            </p>
                            <p>
                                This sanctuary remains devoted to preserving Sanatana Dharma, ancient Vedic practice, and the gentle discipline of silence for all who seek deeper peace.
                            </p>
                        </div>
                        <div className="mt-10 rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-2">Parivara Deities</p>
                            <p className="text-sm leading-relaxed text-warm-cream/70">
                                Sri Dandayudha Pani, Sri Ayyappa Swami, Sri Swetha Kali Devi, Sri Kalabhairava Swamy, Sri Naadi Ganapathi, Sri Sanjeevaraya Hanuman, Sri Pathala Pratyangira Devi, Sri Varahi Devi, Sri Naga Devatha, Sri Seetha Rama, Sri Yoga Narasimha, Sri Santana Venu Gopala Swamy, Sri Radha Krishna, Sri Shiridi Sai Baba, Sri Valli Devasena Sametha Subramanya Swami, Sri Navagraha, Sri Shankaracharya, Sri Dakshinamoorthy, Sri Dattatreya, Guru Brindavanam.
                            </p>
                        </div>
                        <div className="mt-10 space-y-6">

                            <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-2">Tradition</p>
                                <p className="font-semibold text-warm-cream">Mouna, puja, and Veda Dharma</p>
                            </div>
                            <a href="mailto:feedback@srisiddheshwaripeetham.com" className="inline-flex items-center justify-between gap-3 rounded-3xl border border-sacred-red/30 bg-sacred-red/10 px-6 py-4 text-sm text-warm-cream hover:bg-sacred-red/20 transition-colors">
                                <span>Contact the Peetham</span>
                                <ArrowRight size={18} />
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <ShieldCheck size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">Presiding Deity</p>
                        </div>
                        <h3 className="text-3xl font-serif font-bold mb-6">Sri Raja Rajeswari Devi</h3>
                        <div className="mb-8 overflow-hidden rounded-2xl border border-warm-cream/10 bg-neutral-950 shadow-2xl">
                            <img
                                src="https://srisiddheshwaripeetham.com/sri-raja-rajeswari-exact.png"
                                alt="Sri Raja Rajeswari Devi"
                                className="w-full h-auto object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <p className="text-sm leading-relaxed text-warm-cream/70">
                            Sri Raja Rajeswari Devi, venerated as Sri Siddeshwari Devi, was installed on October 3, 1916. Her divine blessings continue to inspire pilgrimage, peace, and spiritual upliftment at the Peetham.
                        </p>
                        <div className="rounded-3xl mt-10 border border-warm-cream/10 bg-neutral-950 p-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-2">Location</p>
                            <p className="font-semibold text-warm-cream">Courtallam, Tamil Nadu</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid gap-10 xl:grid-cols-[1.35fr_0.95fr] mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <Sparkles size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">Guru Parampara</p>
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-6">A living lineage of masters.</h2>
                        <div className="space-y-5 text-warm-cream/70">
                            {GURU_PARAMAPARA.map((guru) => (
                                <div key={guru.name} className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                    <div className="flex items-center justify-between gap-4 mb-3">
                                        <span className="text-sm uppercase tracking-[0.35em] text-sacred-red/70">{guru.years}</span>
                                        <span className="text-sm font-semibold text-warm-cream/80">{guru.role}</span>
                                    </div>
                                    <p className="text-lg font-semibold text-warm-cream">{guru.name}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <Heart size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">Healing & Seva</p>
                        </div>
                        <h3 className="text-3xl font-serif font-bold mb-6">Nature, devotion, and community care.</h3>
                        <p className="text-sm leading-relaxed text-warm-cream/70">
                            The Peetham blends the healing energy of Courtallam with daily seva, annadanam, and devotional practice. Visitors experience both physical restoration and spiritual renewal.
                        </p>
                        <div className="mt-10 grid gap-4">
                            <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-2">Daily Seva</p>
                                <p className="font-semibold text-warm-cream">Annadanam, rituals, and temple care</p>
                            </div>
                            <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-2">Retreat</p>
                                <p className="font-semibold text-warm-cream">Quiet meditation and Vedic learning</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                >
                    <div className="flex items-center gap-3 text-sacred-red mb-6">
                        <MapPin size={20} />
                        <p className="text-xs tracking-[0.35em] uppercase">Gallery</p>
                    </div>
                    <h2 className="text-4xl font-serif font-bold mb-6">Moments from the Peetham.</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {GALLERY_IMAGES.map((item) => (
                            <div key={item.caption} className="overflow-hidden rounded-[28px] bg-neutral-950 border border-warm-cream/10 shadow-2xl">
                                <img
                                    src={item.src}
                                    alt={item.caption}
                                    className="h-48 w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="p-4 text-sm text-warm-cream/80">{item.caption}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="bg-neutral-900 overflow-hidden py-14 border-b border-warm-cream/5 mt-10">
                <ScrollVelocity
                    texts={['Sri Siddheswari Peetham • Courtallam • Silence is Peace • Mouna Swamy Mutt • Sanatana Dharma • ']}
                    velocity={30}
                    className="font-serif text-3xl italic text-warm-cream/20 mx-24 tracking-widest"
                    numCopies={4}
                />
            </div>
        </section>
    );
};

export default AboutPage;
