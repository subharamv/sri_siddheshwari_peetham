import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight, AlignJustify } from 'lucide-react';
import './CardNav.css';

interface CardNavLink {
  label: string;
  href?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

interface CardNavItem {
  label: string;
  bgColor: string;
  grad?: string;
  textColor: string;
  links?: CardNavLink[];
}

interface CardNavProps {
  logo?: string;
  logoAlt?: string;
  logoTitle?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ctaLabel?: string;
  ctaHref?: string;
  donateLabel?: string;
  donateHref?: string;
  onDonate?: () => void;
  onStyleToggle?: () => void;
}

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  logoTitle,
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#FDFBF7',
  menuColor = '#A02D23',
  buttonBgColor = '#A02D23',
  buttonTextColor = '#FDFBF7',
  ctaLabel = 'Contact',
  ctaHref = '#contact',
  donateLabel,
  donateHref = '#donate',
  onDonate,
  onStyleToggle,
}: CardNavProps) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 300;

    // Fixed height for horizontal desktop layout (4 cards)
    if (window.matchMedia('(min-width: 768px)').matches) return 280;

    // Mobile: measure stacked content
    const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
    if (contentEl) {
      const wasVisibility = contentEl.style.visibility;
      const wasPointerEvents = contentEl.style.pointerEvents;
      const wasPosition = contentEl.style.position;
      const wasHeight = contentEl.style.height;

      contentEl.style.visibility = 'visible';
      contentEl.style.pointerEvents = 'auto';
      contentEl.style.position = 'static';
      contentEl.style.height = 'auto';
      contentEl.offsetHeight;

      const contentHeight = contentEl.scrollHeight;

      contentEl.style.visibility = wasVisibility;
      contentEl.style.pointerEvents = wasPointerEvents;
      contentEl.style.position = wasPosition;
      contentEl.style.height = wasHeight;

      return 60 + contentHeight + 16;
    }
    return 300;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    // Query cards live from the DOM so every card — regardless of count — is captured
    const cards = navEl.querySelectorAll<HTMLElement>('.nav-card');

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cards, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.45, ease });
    tl.to(cards, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return tl;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => { tl?.kill(); tlRef.current = null; };
  }, [ease, items]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) { newTl.progress(1); tlRef.current = newTl; }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) tlRef.current = newTl;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? 'open' : ''}`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="card-nav-top">
          {/* Left: hamburger + optional style-toggle (desktop only) */}
          <div className="card-nav-start">
            <button
              className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
              onClick={toggleMenu}
              aria-label={isExpanded ? 'Close menu' : 'Open menu'}
              aria-expanded={isExpanded}
              style={{ color: menuColor }}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>

            {onStyleToggle && (
              <button
                className="card-nav-style-toggle"
                onClick={onStyleToggle}
                title="Switch to classic navigation"
                aria-label="Switch to classic navigation"
                style={{ color: menuColor, borderColor: `${menuColor}44` }}
              >
                <AlignJustify size={13} />
                <span className="card-nav-toggle-label">Old</span>
              </button>
            )}
          </div>

          {/* Center: brand — absolute on desktop, static (left) on mobile */}
          <div className="card-nav-brand">
            {logo && <img src={logo} alt={logoAlt} className="card-nav-logo" />}
            {logoTitle && <span className="card-nav-logo-title">{logoTitle}</span>}
          </div>

          {/* Right: CTA + optional Donate (hidden on mobile) */}
          <div className="card-nav-end">
            {donateLabel && (
              onDonate ? (
                <button
                  type="button"
                  className="card-nav-donate-button"
                  style={{ borderColor: buttonBgColor }}
                  onClick={onDonate}
                >
                  {donateLabel}
                </button>
              ) : (
                <a
                  href={donateHref}
                  className="card-nav-donate-button"
                  style={{ borderColor: buttonBgColor }}
                >
                  {donateLabel}
                </a>
              )
            )}
            <a
              href={ctaHref}
              className="card-nav-cta-button"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            >
              {ctaLabel}
            </a>
          </div>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {items.slice(0, 4).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              style={{ background: item.grad || item.bgColor, color: item.textColor }}
            >
              {/* Dot pattern overlay — mirrors deity card */}
              <div className="nav-card-dot-overlay" />
              {/* OM watermark */}
              <span className="nav-card-om" style={{ color: item.textColor }}>ॐ</span>
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <a
                    key={`${lnk.label}-${i}`}
                    className="nav-card-link"
                    href={lnk.onClick ? undefined : (lnk.href || '#')}
                    aria-label={lnk.ariaLabel}
                    style={{ color: item.textColor }}
                    onClick={(e) => {
                      if (lnk.onClick) {
                        e.preventDefault();
                        lnk.onClick();
                      }
                      if (isExpanded) toggleMenu();
                    }}
                  >
                    <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" size={15} />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Mobile-only action row */}
          <div className="nav-mobile-actions">
            <a
              href={ctaHref}
              className="nav-mobile-btn nav-mobile-btn--filled"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              onClick={isExpanded ? toggleMenu : undefined}
            >
              {ctaLabel}
            </a>
            {donateLabel && (
              onDonate ? (
                <button
                  type="button"
                  className="nav-mobile-btn nav-mobile-btn--outline"
                  style={{ borderColor: buttonBgColor, color: buttonBgColor }}
                  onClick={() => { toggleMenu(); onDonate(); }}
                >
                  {donateLabel}
                </button>
              ) : (
                <a
                  href={donateHref}
                  className="nav-mobile-btn nav-mobile-btn--outline"
                  style={{ borderColor: buttonBgColor, color: buttonBgColor }}
                  onClick={isExpanded ? toggleMenu : undefined}
                >
                  {donateLabel}
                </a>
              )
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
