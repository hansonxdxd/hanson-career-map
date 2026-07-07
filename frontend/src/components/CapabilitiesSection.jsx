import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const CapabilityCategory = ({ category, index }) => {
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-blue-500/20 hover:border-cyan-400/40 transition-all duration-500 h-full">
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
          {category.name}
        </h3>
        <div className="flex flex-wrap gap-2">
          {category.skills.map((skill, i) => (
            <motion.span
              key={i}
              className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-slate-200 text-sm hover:bg-cyan-500/30 hover:border-cyan-400/50 hover:text-white transition-all duration-300 cursor-default"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const CapabilitiesSection = ({ data }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-cyan-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* 標題 */}
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

        {/* 能力分類 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {data.categories.map((category, index) => (
            <CapabilityCategory key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
