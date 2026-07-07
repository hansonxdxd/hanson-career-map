import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { LayoutGrid, Settings, Shuffle, ExternalLink, ArrowRight } from 'lucide-react';

const iconMap = {
  'layout-grid': LayoutGrid,
  'settings': Settings,
  'shuffle': Shuffle
};

const CoreThesis = ({ data }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section ref={ref} className="py-24 bg-slate-900 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {data.title}
          </h2>
          <p className="text-xl text-cyan-400">{data.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {data.items.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <motion.div
                key={item.id}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-blue-500/20 hover:border-cyan-400/50 transition-all duration-500 h-full group-hover:transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-cyan-500/20 flex flex-col">
                  {/* 發光效果 */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-500" />
                  
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                      <Icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed mb-6 flex-1">
                      {item.description}
                    </p>
                    
                    {/* 連結按鈕 */}
                    {item.detailUrl && (
                      <a
                        href={item.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 group/link"
                      >
                        <span className="text-sm font-medium">了解更多</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section 級別的查看更多連結 */}
        {data.learnMoreUrl && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <a
              href={data.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 group"
            >
              <span>探索完整方法論</span>
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CoreThesis;
