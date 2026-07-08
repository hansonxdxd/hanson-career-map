import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const NowNextSection = ({ data }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section ref={ref} id="next" className="py-32 bg-slate-900 relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12">
            {data.title}
          </h2>
          
          <div className="space-y-6 mb-12">
            {data.content.map((text, index) => (
              <motion.p
                key={index}
                className="text-xl md:text-2xl text-slate-200 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {text}
              </motion.p>
            ))}
          </div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-2xl md:text-3xl text-cyan-400 font-light italic">
              {data.closingEn}
            </p>
            <p className="text-xl md:text-2xl text-blue-300">
              {data.closingZh}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default NowNextSection;
