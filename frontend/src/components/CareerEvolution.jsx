import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { getStageTags, getStageProjects, archiveBase } from '../lib/content';

const StageCard = ({ stage, content, slug }) => {
  const navigate = useNavigate();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.4 });
  const tags = getStageTags(content, stage);
  const projects = getStageProjects(content, stage);
  const goArchive = () => navigate(`${archiveBase(slug)}?stage=${stage.slug}`);

  return (
    <div ref={ref} className="relative">
      <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 z-20">
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-4 border-slate-900 shadow-lg shadow-cyan-500/50"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0.3 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.85, y: 50 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.35, scale: 0.88, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-4xl p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-blue-500/30 hover:border-cyan-400/50 transition-all duration-500 shadow-2xl">
          <div className="relative z-10">
            <div className="text-cyan-400 text-sm font-semibold mb-2 tracking-wider">{stage.period}</div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{stage.title}</h3>
            <p className="text-blue-300 text-lg mb-4 font-light">{stage.titleEn}</p>
            <p className="text-lg md:text-xl text-slate-200 mb-6 leading-relaxed">{stage.summary}</p>

            {/* 關聯專案短標題 chips */}
            {projects.length > 0 && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Related Projects</p>
                <div className="flex flex-wrap gap-2">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`${archiveBase(slug)}?project=${p.slug}`)}
                      data-testid={`stage-${stage.slug}-project-${p.slug}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-sm font-medium hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 flex items-center gap-1.5"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      {p.shortTitle || p.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 能力標籤 chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {projects.length > 0 && (
              <button
                onClick={goArchive}
                data-testid={`stage-${stage.slug}-view-archive`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 group"
              >
                <span>查看相關專案</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CareerEvolution = ({ data, content, slug }) => {
  const [titleRef, titleInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const stages = (data.stages || []).filter((s) => s.visible !== false);

  return (
    <section id="evolution" className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={titleRef}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">{data.title}</h2>
          <p className="text-xl text-cyan-400">{data.subtitle}</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-500" />
          <div className="space-y-32">
            {stages.map((stage) => (
              <StageCard key={stage.id} stage={stage} content={content} slug={slug} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerEvolution;
