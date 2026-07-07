import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const StageCard = ({ stage, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.5
  });

  return (
    <div ref={ref} className="relative">
      {/* 時間軸節點 */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 z-20">
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-4 border-slate-900 shadow-lg shadow-cyan-500/50"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0.3 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* 卡片內容 */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.3, scale: 0.85, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-4xl p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-blue-500/30 hover:border-cyan-400/50 transition-all duration-500 shadow-2xl">
          {/* 發光邊框效果 */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 via-transparent to-cyan-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative z-10">
            {/* 時間標記 */}
            <div className="text-cyan-400 text-sm font-semibold mb-2 tracking-wider">
              {stage.period}
            </div>
            
            {/* 標題 */}
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {stage.title}
            </h3>
            <p className="text-blue-300 text-lg mb-4 font-light">
              {stage.titleEn}
            </p>
            
            {/* 摘要 */}
            <p className="text-xl text-slate-200 mb-6 leading-relaxed">
              {stage.summary}
            </p>
            
            {/* 詳細內容 */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm uppercase tracking-wider">Situation</h4>
                <p className="text-slate-300 leading-relaxed">{stage.situation}</p>
              </div>
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm uppercase tracking-wider">Actions</h4>
                <p className="text-slate-300 leading-relaxed">{stage.actions}</p>
              </div>
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm uppercase tracking-wider">Outcome</h4>
                <p className="text-slate-300 leading-relaxed">{stage.outcome}</p>
              </div>
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm uppercase tracking-wider">Core Ability</h4>
                <p className="text-white font-medium leading-relaxed">{stage.coreAbility}</p>
              </div>
            </div>
            
            {/* 標籤 */}
            <div className="flex flex-wrap gap-2">
              {stage.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CareerEvolution = ({ data }) => {
  const [titleRef, titleInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section id="evolution" className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* 標題 */}
        <motion.div
          ref={titleRef}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {data.title}
          </h2>
          <p className="text-xl text-cyan-400">{data.subtitle}</p>
        </motion.div>

        {/* 垂直時間軸 */}
        <div className="relative">
          {/* 中央時間線 */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-500" />
          
          {/* 階段卡片 */}
          <div className="space-y-32">
            {data.stages.map((stage, index) => (
              <StageCard key={stage.id} stage={stage} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerEvolution;
