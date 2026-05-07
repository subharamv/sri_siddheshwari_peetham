import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

interface Props {
  isDark: boolean;
  onToggle: () => void;
  size?: number;
  duration?: number;
}

export function AnimatedThemeToggler({ isDark, onToggle, size = 36, duration = 480 }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    const cx = (rect?.left ?? 0) + (rect?.width ?? 0) / 2;
    const cy = (rect?.top ?? 0) + (rect?.height ?? 0) / 2;
    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy),
    );

    if (!document.startViewTransition) {
      onToggle();
      return;
    }

    const transition = document.startViewTransition(() => {
      onToggle();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${cx}px ${cy}px)`,
            `circle(${maxR}px at ${cx}px ${cy}px)`,
          ],
        },
        {
          duration,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={handleToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex items-center justify-center rounded-full transition-colors"
      style={{
        width: size,
        height: size,
        background: isDark ? 'rgba(255,251,247,0.07)' : 'rgba(160,45,35,0.1)',
        border: `1px solid ${isDark ? 'rgba(255,251,247,0.12)' : 'rgba(160,45,35,0.2)'}`,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={size * 0.44} color="#D4AF37" strokeWidth={1.8} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={size * 0.44} color="#A02D23" strokeWidth={1.8} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
