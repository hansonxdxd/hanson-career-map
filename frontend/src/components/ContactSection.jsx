import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, MapPin, Briefcase } from 'lucide-react';

const ContactSection = ({ data }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section id="contact" ref={ref} className="py-32 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* 聯絡資訊卡片 */}
          <div className="p-10 md:p-12 rounded-3xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-blue-500/30 shadow-2xl">
            <div className="space-y-8">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Email</p>
                  <a
                    href={`mailto:${data.email}`}
                    className="text-xl md:text-2xl text-white hover:text-cyan-400 transition-colors duration-300"
                  >
                    {data.email}
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Location</p>
                  <p className="text-xl md:text-2xl text-white">{data.location}</p>
                </div>
              </div>

              {/* Open To */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm mb-3">Open to</p>
                  <div className="space-y-2">
                    {data.openTo.map((item, index) => (
                      <div
                        key={index}
                        className="text-slate-200 text-lg flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-slate-400 text-sm">
              © 2025 Hanson 曹瀚升. Built with passion for systems thinking.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
