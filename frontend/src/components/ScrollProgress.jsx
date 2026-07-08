import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      {/* 頂部進度條 */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 origin-left z-[100]"
        style={{ scaleX }}
        data-testid="scroll-progress-bar"
      />
      {/* 右側垂直進度指示 */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[90] hidden md:flex flex-col items-center gap-2">
        <div className="relative h-40 w-1 rounded-full bg-slate-700/40 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full origin-top"
            style={{ scaleY: scaleX, height: '100%' }}
          />
        </div>
      </div>
    </>
  );
};

export default ScrollProgress;
