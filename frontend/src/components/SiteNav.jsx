import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { NAV_LINKS, SECTIONS } from '../lib/content';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// Top navigation bar
export const TopNav = ({ name }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      data-testid="top-nav"
      className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-500 ${
        scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-blue-500/15' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => scrollTo('hero')} data-testid="nav-logo" className="text-white font-bold tracking-tight text-sm md:text-base hover:text-cyan-300 transition-colors">
          {name || 'Hanson'}
        </button>
        <nav className="flex items-center gap-1 md:gap-2">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              data-testid={`nav-${l.id}`}
              className="px-2 md:px-3 py-2 text-[11px] md:text-xs tracking-widest text-slate-400 hover:text-cyan-300 transition-colors font-medium"
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};

// Right-side vertical dots navigator with active glow + labels
export const SectionDots = () => {
  const [active, setActive] = useState('hero');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    const observers = [];
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const ob = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => { if (e.isIntersecting) setActive(s.id); });
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
      );
      ob.observe(el);
      observers.push(ob);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      {/* 頂部細進度條 */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 origin-left z-[70]"
        style={{ scaleX }}
        data-testid="scroll-progress-bar"
      />
      {/* 右側 section 圓點導覽 */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-[70] hidden md:flex flex-col gap-4" data-testid="section-dots">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              data-testid={`dot-${s.id}`}
              className="group flex items-center gap-3 justify-end"
            >
              <span
                className={`text-[10px] tracking-widest font-medium transition-all duration-300 ${
                  isActive ? 'text-cyan-300 opacity-100' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                }`}
              >
                {s.label}
              </span>
              <span
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-3 h-3 bg-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.7)]'
                    : 'w-2 h-2 bg-slate-600 group-hover:bg-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
};
