import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, MapPin, Briefcase, Phone, MessageCircle, Download } from 'lucide-react';

const ContactSection = ({ data }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const resume = data.resume || {};

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
              {/* Email & Phone 兩欄 */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm mb-1">Email</p>
                    <a
                      href={`mailto:${data.email}`}
                      data-testid="contact-email-link"
                      className="text-lg md:text-xl text-white hover:text-cyan-400 transition-colors duration-300 break-all"
                    >
                      {data.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                {data.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-400 text-sm mb-1">Phone</p>
                      <a
                        href={`tel:${data.phone.replace(/\s/g, '')}`}
                        data-testid="contact-phone-link"
                        className="text-lg md:text-xl text-white hover:text-cyan-400 transition-colors duration-300"
                      >
                        {data.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* LINE & Location 兩欄 */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* LINE */}
                {data.lineUrl && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-400 text-sm mb-1">LINE</p>
                      <a
                        href={data.lineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="contact-line-link"
                        className="text-lg md:text-xl text-white hover:text-green-400 transition-colors duration-300 break-all"
                      >
                        加入 LINE
                      </a>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Location</p>
                    <p className="text-lg md:text-xl text-white">{data.location}</p>
                  </div>
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

              {/* 履歷下載按鈕 */}
              {resume.url && (
                <div className="pt-4 border-t border-blue-500/20">
                  <a
                    href={resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="resume-download-button"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-400/40 hover:border-cyan-400/70 text-cyan-300 hover:text-white font-medium transition-all duration-300 group"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
                    <span>{resume.text || '下載傳統履歷 Resume'}</span>
                  </a>
                </div>
              )}
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
