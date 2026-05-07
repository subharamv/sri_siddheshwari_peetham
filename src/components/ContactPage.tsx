import { motion } from 'motion/react';
import { ChevronLeft, Mail, MapPin, MessageCircle, Phone, Send, Share2, Facebook, Instagram, Youtube } from 'lucide-react';
import React, { useState } from 'react';
import ScrollVelocity from './ScrollVelocity';

interface ContactPageProps {
    onBack?: () => void;
}

const ContactPage = ({ onBack }: ContactPageProps) => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <section className="relative z-10 bg-neutral-950 text-warm-cream">
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
                            Reach Out to Us
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                        >
                            Contact Us
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-6 text-base md:text-lg text-warm-cream/70 max-w-2xl leading-relaxed"
                        >
                            Whether you have questions about visiting, need guidance on rituals, or wish to connect with our community, we are here to help.
                        </motion.p>
                    </div>
                </div>

                {/* Main Sections */}
                <div className="grid gap-10 xl:grid-cols-[1.4fr_1fr] mb-14">
                    {/* Left - Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <Send size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">Send Message</p>
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-6">Get in Touch</h2>

                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12 px-6 bg-white/5 border border-spiritual-gold/30 rounded-2xl"
                            >
                                <div className="text-4xl mb-4">🙏</div>
                                <h4 className="font-serif text-2xl text-spiritual-gold mb-3">Message Received</h4>
                                <p className="text-warm-cream/50 text-sm">Our team will get back to you shortly. May the divine blessings be upon you.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block font-ui text-[10px] tracking-[0.25em] uppercase text-warm-cream/50 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        required
                                        className="w-full bg-neutral-950 border border-warm-cream/10 rounded-3xl px-6 py-4 text-warm-cream text-sm placeholder-warm-cream/30 focus:outline-none focus:border-sacred-red/60 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block font-ui text-[10px] tracking-[0.25em] uppercase text-warm-cream/50 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full bg-neutral-950 border border-warm-cream/10 rounded-3xl px-6 py-4 text-warm-cream text-sm placeholder-warm-cream/30 focus:outline-none focus:border-sacred-red/60 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block font-ui text-[10px] tracking-[0.25em] uppercase text-warm-cream/50 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                        rows={6}
                                        required
                                        className="w-full bg-neutral-950 border border-warm-cream/10 rounded-3xl px-6 py-4 text-warm-cream text-sm placeholder-warm-cream/30 focus:outline-none focus:border-sacred-red/60 transition-colors resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-between gap-3 rounded-3xl border border-sacred-red/30 bg-sacred-red/10 px-6 py-4 text-sm text-warm-cream hover:bg-sacred-red/20 transition-colors"
                                >
                                    <span className="font-ui text-[10px] tracking-[0.25em] uppercase">Send Message</span>
                                    <Send size={18} />
                                </button>
                                <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                    <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-4">
                                        Connect With Us
                                    </p>

                                    <div className="flex gap-4">
                                        <a href="https://www.facebook.com/people/Courtallam-Sri-Siddheshwari-Peetam-Mounaswamy-mutt/61576632191990/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream/40 hover:text-sacred-red hover:border-sacred-red transition-all">
                                            <Facebook size={18} />
                                        </a>
                                        <a href="https://www.instagram.com/sri_siddheshwari_peetam" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream/40 hover:text-sacred-red hover:border-sacred-red transition-all">
                                            <Instagram size={18} />
                                        </a>
                                        <a href="https://www.youtube.com/@SriSiddeswaripeetham" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream/40 hover:text-sacred-red hover:border-sacred-red transition-all">
                                            <Youtube size={18} />
                                        </a>
                                        <a href="https://chat.whatsapp.com/CjrsFyJSZMHGIUG2ICwfLt?mode=ac_t" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-warm-cream/10 rounded-full flex items-center justify-center text-warm-cream/40 hover:text-sacred-red hover:border-sacred-red transition-all">
                                            <MessageCircle size={18} />
                                        </a>
                                    </div>
                                </div>
                            </form>

                        )}
                    </motion.div>

                    {/* Right - Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-10 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <MapPin size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">Sri Siddheswari Peetham Campus</p>
                        </div>
                        <div className="mb-8 overflow-hidden rounded-2xl border border-warm-cream/10 bg-neutral-950 shadow-2xl">
                            <img
                                src="https://srisiddheshwaripeetham.com/_next/image?url=%2Fcourtallam-temple-gopuram-and-peetham-campus.png&w=1920&q=75"
                                alt="Sri Siddheswari Peetham Campus"
                                loading="lazy"
                                className="w-full h-auto object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>

                        <h3 className="text-3xl font-serif font-bold mb-6">Temple Office</h3>

                        <div className="space-y-6">
                            <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-2">Address</p>
                                <p className="text-warm-cream/70 text-sm leading-relaxed">
                                    Sri Siddheswari Peetham, Courtallam,<br />
                                    Tenkasi District,<br />
                                    Tamil Nadu 627802, India.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-6">
                                <p className="text-xs uppercase tracking-[0.35em] text-sacred-red/70 mb-4">Contact</p>
                                <div className="space-y-4">
                                    <a href="mailto:feedback@srisiddheshwaripeetham.com" className="flex items-center gap-3 text-warm-cream/70 hover:text-sacred-red transition-colors group">
                                        <Mail size={18} className="text-sacred-red" />
                                        <span className="text-sm">feedback@srisiddheshwaripeetham.com</span>
                                    </a>
                                    <a href="tel:+919443184738" className="flex items-center gap-3 text-warm-cream/70 hover:text-sacred-red transition-colors group">
                                        <Phone size={18} className="text-sacred-red" />
                                        <span className="text-sm">+91 9443184738</span>
                                    </a>
                                </div>
                            </div>



                            <a
                                href="https://maps.app.goo.gl/1bxYbmGL6ZYdbYJE9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-between gap-3 rounded-3xl border border-sacred-red/30 bg-sacred-red/10 px-6 py-4 text-sm text-warm-cream hover:bg-sacred-red/20 transition-colors w-full"
                            >
                                <span>Open in Maps</span>
                                <Share2 size={18} />
                            </a>
                        </div>
                    </motion.div>
                </div>
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

export default ContactPage;
