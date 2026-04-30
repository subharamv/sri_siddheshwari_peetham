import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CreateMLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import { X, Send, RotateCcw, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const STORAGE_KEY = 'ssp_chat_history';
const DEFAULT_MODEL = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
const MODEL_CONTEXT = 4096;
const SYSTEM_PROMPT_TOKENS = 350; // conservative overhead for system prompt
const MAX_RESPONSE_TOKENS = 512;
// budget left for conversation history
const MAX_HISTORY_TOKENS = MODEL_CONTEXT - SYSTEM_PROMPT_TOKENS - MAX_RESPONSE_TOKENS - 64;

// Conservative: LLaMA tokenizes ~3 chars/token for mixed English/Sanskrit content
const estimateTokens = (text: string) => Math.ceil(text.length / 3);

function buildTrimmedHistory(history: { role: string; content: string }[]) {
  const trimmed: typeof history = [];
  let used = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const cost = estimateTokens(history[i].content) + 10;
    if (used + cost > MAX_HISTORY_TOKENS) break;
    trimmed.unshift(history[i]);
    used += cost;
  }
  return trimmed;
}

const SYSTEM_PROMPT = `You are a compassionate spiritual guide of Sri Siddheswari Peetham, a sacred institution rooted in the teachings of Mouna Swamy (the Silent Sage) in Courtallam, Tamil Nadu, India.

Your role is to:
- Share wisdom from Vedanta, Advaita philosophy, and Sanatana Dharma
- Speak about the significance of Mouna (silence) as a path to self-realization
- Offer guidance on meditation, seva (selfless service), and dharmic living
- Provide information about the Peetham's activities, festivals, and the lineage of Guru Parampara
- Speak with warmth, humility, and spiritual depth


Location: 

Sri Siddheswari Peetham,
Courtallam - 627 802,
Tenkasi District, TN.


Visit Courtallam
Sri Siddheswari Peetham is located in Courtallam, Tamil Nadu, famed for its waterfalls and serene hills. Plan your trip using the essentials below.


How to Reach
Frequent buses from Tenkasi/Tirunelveli. Taxis available from nearby railheads. Roads remain motorable during monsoon. Check local advisories.
See Map: https://maps.app.goo.gl/YNcAvUPf2qmtd9pL9
`;

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

/* Markdown renderer with v10-compatible component API */
const MarkdownMessage = ({ content }: { content: string }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => (
        <p style={{ marginBottom: '0.4rem', lineHeight: '1.6' }} className="last:mb-0">{children}</p>
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
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>{children}</ul>
      ),
      ol: ({ children }) => (
        <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>{children}</ol>
      ),
      li: ({ children }) => (
        <li style={{ marginBottom: '0.2rem' }}>{children}</li>
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
    {content}
  </ReactMarkdown>
);

export default function SpiritualChatbot() {
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
    const rawHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    const history = buildTrimmedHistory(rawHistory);
    const apiMessages = [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...history];
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
    localStorage.removeItem(STORAGE_KEY);
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
                  <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
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
        <div className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4 chatbot-scrollbar">
          {messages.length === 0 && loadState === 'ready' && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="mb-4 opacity-20">
                <LotusIcon size={48} className="text-spiritual-gold mx-auto" />
              </div>
              <p className="text-warm-cream/20 font-serif text-lg italic mb-2">Seek and thou shalt find</p>
              <p className="text-warm-cream/15 font-ui text-[9px] tracking-[0.25em] uppercase">
                Ask about our teachings, festivals, or the path of silence
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
                  <MarkdownMessage content={msg.content} />
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
