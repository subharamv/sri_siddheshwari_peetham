import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ChevronLeft, Gift, Heart, ShieldCheck, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import ScrollVelocity from './ScrollVelocity';
import { supabase } from '../lib/supabase';

interface DonationPageProps {
    onBack?: () => void;
}



const FEATURE_CARDS = [
    {
        title: 'Annadanam',
        description: 'Feed devotees and visitors with sacred prasadam. Annadanam is a timeless offering of nourishment and blessing.',
        amount: '₹501 - ₹5,001',
        image: 'https://srisiddheshwaripeetham.com/annadanam-seva-peetham.jpg',
    },
    {
        title: 'Go Seva',
        description: 'Support cow protection and seva. Cows are revered in our tradition and their welfare brings divine blessings.',
        amount: '₹1,001 - ₹10,001',
        image: 'https://srisiddheshwaripeetham.com/go-seva-cow-protection.png',
    },
    {
        title: 'Temple Maintenance',
        description: 'Preserve the sacred spaces, maintain the shrines, and ensure temple infrastructure serves devotees for generations.',
        amount: '₹2,001 - ₹25,001',
        image: 'https://srisiddheshwaripeetham.com/images/temple-maintenance.jpg',
    },
];

const PROGRAM_CARDS = [
    {
        title: 'Daily Deepam Sponsorship',
        description: 'Sponsor the sacred oil lamps that illuminate the temple throughout the day.',
        amount: '₹365/month',
        icon: <Sparkles size={20} className="text-sacred-red" />,
    },
    {
        title: 'Flower Decoration Fund',
        description: 'Support the beautiful flower decorations for daily pujas and special festivals.',
        amount: '₹501/month',
        icon: <Gift size={20} className="text-sacred-red" />,
    },
    {
        title: 'Vedic Education Support',
        description: 'Help preserve and teach ancient Vedic knowledge to future generations.',
        amount: '₹1,001/month',
        icon: <BookOpen size={20} className="text-sacred-red" />,
    },
    {
        title: 'Bhajan & Satsang Fund',
        description: 'Support regular spiritual gatherings, bhajans, and devotional programs.',
        amount: '₹751/month',
        icon: <Heart size={20} className="text-sacred-red" />,
    },
];

const DonationPage = ({ onBack }: DonationPageProps) => {
    const [form, setForm] = useState({ donationType: 'Annadanam', amount: '', name: '', email: '', phone: '', message: '', wantReceipt: false });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.amount) { setSubmitError('Please fill in Name, Phone, and Amount.'); return; }
        const amt = parseInt(form.amount.replace(/\D/g, ''), 10);
        if (!amt || amt < 1) { setSubmitError('Please enter a valid amount.'); return; }
        setSubmitting(true);
        setSubmitError('');
        try {
            const { error } = await supabase.from('donations').insert({
                donor_name: form.name,
                donor_phone: form.phone.replace(/\D/g, ''),
                donor_email: form.email,
                donation_type: form.donationType,
                amount: amt,
                message: form.message,
                want_receipt: form.wantReceipt,
                payment_status: 'pending',
                transaction_id: null,
            });
            if (error) throw error;
            setSubmitted(true);
        } catch (err: any) {
            setSubmitError(err?.message ?? 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
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
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-14">
                    <div className="max-w-3xl">
                        <motion.span
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="font-ui text-[10px] tracking-[0.35em] uppercase text-sacred-red/80 mb-3 block"
                        >
                            Sacred Donations
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                        >
                            Support the faith, seva, and sacred services of Sri Siddheswari Peetham.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-6 text-base md:text-lg text-warm-cream/70 max-w-2xl leading-relaxed"
                        >
                            Your generous contributions support sacred activities, daily sevas, education, and temple care. Every donation helps keep our traditions strong and our community inspired.
                        </motion.p>
                    </div>
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-2 rounded-full border border-warm-cream/20 bg-neutral-900 px-5 py-3 text-sm uppercase tracking-[0.35em] text-warm-cream transition hover:bg-[#A02d23]"
                        >
                            <ArrowRight size={16} /> Back to Home
                        </button>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3 mb-14">
                    {FEATURE_CARDS.map((card) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="rounded-[32px] border border-warm-cream/10 bg-neutral-900 shadow-2xl overflow-hidden"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent" />
                            </div>
                            <div className="p-8">
                                <p className="text-xs tracking-[0.35em] uppercase text-sacred-red/70">{card.title}</p>
                                <p className="mt-3 text-3xl font-serif font-semibold text-warm-cream">{card.amount}</p>
                                <p className="mt-6 text-sm leading-relaxed text-warm-cream/70">{card.description}</p>
                                <button
                                    type="button"
                                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-sacred-red px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-neutral-900 transition hover:bg-warm-cream hover:text-neutral-900"
                                >
                                    Donate Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid gap-10 xl:grid-cols-[1.3fr_0.9fr]">
                    <div className="space-y-10">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-8 shadow-2xl"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs tracking-[0.35em] uppercase text-sacred-red/80">Special Donation Programs</p>
                                    <h2 className="mt-3 text-4xl font-serif font-bold tracking-tight">Programs for regular support</h2>
                                </div>
                                <div className="rounded-full border border-warm-cream/10 bg-neutral-950 px-4 py-3 text-sm text-warm-cream/70">
                                    Select one program to sponsor every month.
                                </div>
                            </div>
                            <div className="grid gap-4 mt-8 sm:grid-cols-2">
                                {PROGRAM_CARDS.map((program) => (
                                    <div key={program.title} className="rounded-3xl border border-warm-cream/10 bg-neutral-900 p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sacred-red/10 text-sacred-red">
                                                {program.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-warm-cream">{program.title}</h3>
                                                <p className="text-sm text-warm-cream/50">{program.amount}</p>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm leading-relaxed text-warm-cream/70">{program.description}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-8 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 text-sacred-red">
                                <ShieldCheck size={20} />
                                <p className="text-xs tracking-[0.35em] uppercase">Tax Benefits & Transparency</p>
                            </div>
                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-5">
                                    <p className="font-semibold text-warm-cream">80G Tax Benefits</p>
                                    <p className="mt-3 text-sm text-warm-cream/70">All donations are eligible for tax deduction under Section 80G of the Income Tax Act.</p>
                                </div>
                                <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-5">
                                    <p className="font-semibold text-warm-cream">Transparent Usage</p>
                                    <p className="mt-3 text-sm text-warm-cream/70">Regular updates on how your donations are used for temple activities and seva programs.</p>
                                </div>
                                <div className="rounded-3xl border border-warm-cream/10 bg-neutral-950 p-5">
                                    <p className="font-semibold text-warm-cream">Secure Payments</p>
                                    <p className="mt-3 text-sm text-warm-cream/70">All transactions are processed through secure, encrypted payment gateways for your safety.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="rounded-[36px] border border-warm-cream/10 bg-neutral-900 p-8 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 text-sacred-red mb-6">
                            <Heart size={20} />
                            <p className="text-xs tracking-[0.35em] uppercase">Make a Donation</p>
                        </div>
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/25">
                                    <CheckCircle2 size={30} className="text-emerald-400" />
                                </div>
                                <h3 className="font-serif text-warm-cream text-xl">Donation Recorded!</h3>
                                <p className="text-warm-cream/50 text-sm">Thank you, {form.name}. Our team will reach out to confirm payment details.</p>
                                <button onClick={() => { setSubmitted(false); setForm({ donationType: 'Annadanam', amount: '', name: '', email: '', phone: '', message: '', wantReceipt: false }); }}
                                    className="mt-2 rounded-full border border-warm-cream/20 px-6 py-2.5 text-xs uppercase tracking-widest text-warm-cream/60 hover:text-warm-cream transition-colors">
                                    Make Another Donation
                                </button>
                            </div>
                        ) : (
                        <form className="space-y-5" onSubmit={handleDonate}>
                            <label className="block text-sm font-semibold text-warm-cream/80">
                                Donation Type
                                <select value={form.donationType} onChange={e => setForm(f => ({ ...f, donationType: e.target.value }))}
                                    className="mt-2 w-full rounded-3xl border border-warm-cream/10 bg-neutral-950 px-4 py-3 text-sm text-warm-cream outline-none transition focus:border-sacred-red">
                                    <option>Annadanam</option>
                                    <option>Go Seva</option>
                                    <option>Temple Maintenance</option>
                                    <option>Daily Deepam Sponsorship</option>
                                    <option>Flower Decoration Fund</option>
                                </select>
                            </label>
                            <label className="block text-sm font-semibold text-warm-cream/80">
                                Amount (₹) *
                                <input placeholder="Enter amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                    className="mt-2 w-full rounded-3xl border border-warm-cream/10 bg-neutral-950 px-4 py-3 text-sm text-warm-cream outline-none transition focus:border-sacred-red" />
                            </label>
                            <label className="block text-sm font-semibold text-warm-cream/80">
                                Full Name *
                                <input placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="mt-2 w-full rounded-3xl border border-warm-cream/10 bg-neutral-950 px-4 py-3 text-sm text-warm-cream outline-none transition focus:border-sacred-red" />
                            </label>
                            <label className="block text-sm font-semibold text-warm-cream/80">
                                Email
                                <input type="email" placeholder="your.email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="mt-2 w-full rounded-3xl border border-warm-cream/10 bg-neutral-950 px-4 py-3 text-sm text-warm-cream outline-none transition focus:border-sacred-red" />
                            </label>
                            <label className="block text-sm font-semibold text-warm-cream/80">
                                Phone Number *
                                <input placeholder="+91 XXXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="mt-2 w-full rounded-3xl border border-warm-cream/10 bg-neutral-950 px-4 py-3 text-sm text-warm-cream outline-none transition focus:border-sacred-red" />
                            </label>
                            <label className="block text-sm font-semibold text-warm-cream/80">
                                Special Message (Optional)
                                <textarea placeholder="Any special prayers or dedications..." rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    className="mt-2 w-full rounded-[28px] border border-warm-cream/10 bg-neutral-950 px-4 py-3 text-sm text-warm-cream outline-none transition focus:border-sacred-red" />
                            </label>
                            <label className="flex items-center gap-3 text-sm text-warm-cream/80 cursor-pointer">
                                <input type="checkbox" checked={form.wantReceipt} onChange={e => setForm(f => ({ ...f, wantReceipt: e.target.checked }))}
                                    className="h-4 w-4 rounded border-warm-cream/20 bg-neutral-950 text-sacred-red focus:ring-sacred-red" />
                                I would like to receive a donation receipt for tax purposes
                            </label>
                            {submitError && (
                                <p className="text-red-400/80 text-xs text-center">{submitError}</p>
                            )}
                            <button type="submit" disabled={submitting}
                                className="mt-2 w-full rounded-full bg-sacred-red px-5 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-neutral-900 transition hover:bg-warm-cream hover:text-neutral-900 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : 'Proceed to Payment'}
                            </button>
                        </form>
                        )}
                    </motion.div>
                </div>
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

export default DonationPage;
