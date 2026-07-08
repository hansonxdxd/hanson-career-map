import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ImageFrame } from './admin/ImageFramePicker';

const shapeClass = (shape) => {
  if (shape === 'circle') return 'rounded-full aspect-square';
  if (shape === 'rounded') return 'rounded-3xl aspect-square';
  return 'rounded-2xl aspect-[4/5]'; // card
};

const HeroSection = ({ data }) => {
  const layout = data.layout || 'center';
  const showImage = data.showImage !== false && data.image;
  const isSide = (layout === 'left' || layout === 'right') && showImage;

  const ImageBlock = (
    <motion.div
      className="flex-shrink-0"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9 }}
    >
      <div className="relative">
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-500/40 to-cyan-400/40 blur-2xl opacity-60" />
        <div className="relative p-1.5 rounded-3xl bg-gradient-to-br from-blue-400/30 to-cyan-400/30 backdrop-blur-sm border border-cyan-400/30">
          <ImageFrame
            src={data.image}
            alt={data.imageAlt || data.name}
            position={data.imagePosition}
            className={`${shapeClass(data.shape)} ${isSide ? 'w-64 md:w-80' : 'w-52 md:w-64 mx-auto'} border border-white/10`}
          />
        </div>
      </div>
    </motion.div>
  );

  const TextBlock = (
    <div className={isSide ? 'text-left' : 'text-center'}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">{data.name}</h1>
        <div className="text-lg md:text-2xl text-blue-300 mb-1">{data.title}</div>
        <div className="text-base md:text-lg text-cyan-400 mb-6">{data.subtitle}</div>
      </motion.div>
      <motion.p
        className="text-xl md:text-2xl text-white font-light mb-6 leading-relaxed"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
      >
        {data.tagline}
      </motion.p>
      <motion.p
        className={`text-sm md:text-base text-slate-300 leading-relaxed ${isSide ? '' : 'max-w-3xl mx-auto'}`}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
      >
        {data.description}
      </motion.p>
    </div>
  );

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6">
        {isSide ? (
          <div className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-6xl mx-auto ${layout === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
            <div className="flex-1">{TextBlock}</div>
            {ImageBlock}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
            {showImage && ImageBlock}
            {TextBlock}
          </div>
        )}
      </div>

      {/* 細緻 scroll indicator */}
      <motion.button
        onClick={() => document.getElementById('thesis')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors"
        data-testid="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1 }, y: { duration: 1.8, repeat: Infinity } }}
      >
        {data.scrollHint && <span className="text-[11px] tracking-[0.2em] uppercase">{data.scrollHint}</span>}
        <ChevronDown className="w-5 h-5" />
      </motion.button>
    </section>
  );
};

export default HeroSection;
