import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, Leaf, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import React from 'react';
import ScrollVelocity from './ScrollVelocity';

interface VisitPageProps {
    onBack?: () => void;
}

const VisitPage = ({ onBack }: VisitPageProps) => {
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

                {/* Header */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-14">
                    <div className="max-w-3xl">

                        <motion.span
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="font-ui text-[10px] tracking-[0.35em] uppercase text-sacred-red/80 mb-3 mt-5 block"
                        >
                            Courtallam Temple Gopuram | Sri Siddheswari Peetham
                        </motion.span>

                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                        >
                            Visit Courtallam
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-6 text-base md:text-lg text-warm-cream/70 max-w-2xl leading-relaxed"
                        >
                            Sri Siddheswari Peetham is located in Courtallam, Tamil Nadu, famed for its waterfalls and serene hills. Plan your trip using the essentials below.
                        </motion.p>
                    </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid gap-6 lg:grid-cols-3 mb-14">
                    {[
                        {
                            title: 'Best Season',
                            description: 'Southwest monsoon (June–September) is the ideal time to experience Courtallam’s waterfalls.',
                            icon: <Leaf size={20} className="text-sacred-red" />,
                        },
                        {
                            title: 'Travel Access',
                            description: 'Nearest airports: Madurai & Trivandrum. Rail: Sengottai, Tenkasi, Tirunelveli.',
                            icon: <MapPin size={20} className="text-sacred-red" />,
                        },
                        {
                            title: 'Road Connectivity',
                            description: 'Well connected by highways with frequent buses and easy road access.',
                            icon: <ShieldCheck size={20} className="text-sacred-red" />,
                        },
                    ].map((feature) => (
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

                {/* Main Sections */}
                <div className="grid gap-10 xl:grid-cols-[1.4fr_1fr] mb-14">

                    {/* Left */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <Sparkles size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">How to Reach</p>
                        </div>

                        <h2 className="text-4xl font-serif font-bold mb-6">
                            How to Reach Sri Siddheswari Peetham
                        </h2>

                        <div className="space-y-6 text-warm-cream/70 leading-relaxed text-base">
                            <p>
                                Frequent buses are available from Tenkasi and Tirunelveli. Taxis can be hired from nearby railway stations for convenient travel.
                            </p>
                            <p>
                                Roads remain motorable during the monsoon season, but visitors are advised to check local travel advisories before planning their journey.
                            </p>
                        </div>

                        <div className="mt-10 rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6 relative overflow-hidden group">

                            {/* Content */}
                            <div className="relative z-10">
                                <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-4">
                                    See Map
                                </p>

                                <p className="text-sm text-warm-cream/70 mb-6">
                                    Use navigation tools to get real-time directions to the Peetham.
                                </p>

                                {/* Map with grayscale effect */}
                                <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-warm-cream/10 
                        filter grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <iframe
                                        src="https://www.google.com/maps?q=Sri%20Siddheswari%20Peetham%20Courtallam&output=embed"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>

                                <a
                                    href="https://maps.app.goo.gl/1bxYbmGL6ZYdbYJE9"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-between gap-3 mt-5 rounded-3xl border border-sacred-red/30 bg-sacred-red/10 px-6 py-4 text-sm text-warm-cream hover:bg-sacred-red/20 transition-colors w-full"
                                >
                                    <span>Get Directions</span>
                                    <ArrowRight size={18} />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <MapPin size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">Temple Info</p>
                        </div>
                        <div className="mb-8 overflow-hidden rounded-2xl border border-warm-cream/10 bg-neutral-950 shadow-2xl">
                            <img
                                src="https://srisiddheshwaripeetham.com/_next/image?url=%2Fcourtallam-temple-gopuram-and-peetham-campus.png&w=1920&q=75"
                                alt="Sri Siddheswari Campus Map"
                                className="w-full h-auto object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <h3 className="text-3xl font-serif font-bold mb-6">
                            Temple Timings & Guidelines
                        </h3>

                        <p className="text-sm leading-relaxed text-warm-cream/70">
                            Morning and evening poojas are conducted on most days, with special homams on selected tithis. Visitors are encouraged to check the latest updates in the events calendar.
                        </p>

                        <div className="mt-10 space-y-6">

                            <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-2">
                                    Etiquette
                                </p>
                                <p className="text-warm-cream/70 text-sm leading-relaxed">
                                    Traditional attire is preferred. Maintain silence inside the sanctum. Photography may be restricted near deities. Follow volunteer guidance.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-2">
                                    Nearby
                                </p>
                                <p className="text-warm-cream/70 text-sm leading-relaxed">
                                    Explore Courtallam waterfalls, Kutralanathar Temple, and nearby hill trails—ideal for a peaceful weekend pilgrimage retreat.
                                </p>
                            </div>


                        </div>
                    </motion.div>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 mb-14 ml-10 mr-10 mobile:ml-4 mobile:mr-4">
                {[
                    {
                        title: 'Best Season',
                        description: 'Southwest monsoon (June–September) is the ideal time to experience Courtallam’s waterfalls.',
                        icon: <Leaf size={20} className="text-sacred-red" />,
                        image: 'https://srisiddheshwaripeetham.com/_next/image?url=%2Fnearby-courtallam-waterfalls-and-sites.png&w=828&q=75',
                    },
                    {
                        title: 'Travel Access',
                        description: 'Nearest airports: Madurai & Trivandrum. Rail: Sengottai, Tenkasi, Tirunelveli.',
                        icon: <MapPin size={20} className="text-sacred-red" />,
                        image: 'https://srisiddheshwaripeetham.com/_next/image?url=%2Fimages%2Fhow-to-reach.jpg&w=828&q=75',
                    },
                    {
                        title: 'Etiquette',
                        description: 'Traditional attire preferred. Maintain silence inside sanctum. Photography may be restricted near deities. Follow volunteer guidance.',
                        icon: <ShieldCheck size={20} className="text-sacred-red" />,
                        image: 'https://srisiddheshwaripeetham.com/_next/image?url=%2Ftemple-etiquette-and-dress-code.png&w=828&q=75',
                    },
                ].map((feature) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65 }}
                        className="rounded-[32px] border border-warm-cream/10 bg-neutral-900 overflow-hidden shadow-2xl group"
                    >
                        {/* Image */}
                        <div className="h-44 w-full overflow-hidden">
                            <img
                                src={feature.image}
                                alt={feature.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sacred-red/10 text-sacred-red mb-6">
                                {feature.icon}
                            </div>

                            <h2 className="text-2xl font-serif text-warm-cream mb-3">
                                {feature.title}
                            </h2>

                            <p className="text-sm leading-relaxed text-warm-cream/65">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Scroll Text */}
            <div className="bg-neutral-900 overflow-hidden py-14 border-b border-warm-cream/5 mt-10">
                <ScrollVelocity
                    texts={['Sri Siddheswari Peetham • Courtallam • Silence is Peace • Mouna Swamy Mutt • Sanatana Dharma • ']}
                    velocity={30}
                    className="font-serif text-3xl italic text-warm-cream/20 mx-24 tracking-widest"
                    numCopies={4}
                />
            </div>
        </section>
    );
};

export default VisitPage;