import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';
import { ImageFrame } from './admin/ImageFramePicker';
import { resolveSlot, archiveBase } from '../lib/content';

const ProjectCard = ({ project, index, slug }) => {
  const navigate = useNavigate();
  const hasImage = !!project.image;
  return (
    <motion.div
      className="group relative h-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-blue-500/20 group-hover:border-cyan-400/50 transition-all duration-500 overflow-hidden flex flex-col group-hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-500" />
        <div className="relative z-10 flex-1 flex flex-col">
          {hasImage && (
            <ImageFrame src={project.image} alt={project.imageAlt || project.title} position={project.imagePosition} className="w-full h-48 mb-4 rounded-xl border border-blue-500/20" />
          )}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">{project.title}</h3>
          </div>
          {project.period && <div className="text-cyan-400/80 text-sm mb-3">{project.period}</div>}
          <p className="text-slate-300 mb-4 leading-relaxed flex-1">{project.summary}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(project.skills || []).slice(0, 4).map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium">{skill}</span>
            ))}
          </div>
          <button
            onClick={() => navigate(`${archiveBase(slug)}?project=${project.slug}`)}
            data-testid={`selected-project-${project.slug}`}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 group/link self-start"
          >
            <span className="text-sm font-medium">查看詳情</span>
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectsSection = ({ data, content, slug }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const slots = (data.items || []).filter((s) => s.visible !== false);
  const resolved = slots.map((s) => resolveSlot(content, s)).filter(Boolean);

  return (
    <section id="projects" ref={ref} className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">{data.title}</h2>
          <p className="text-xl text-cyan-400">{data.subtitle}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {resolved.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} slug={slug} />
          ))}
        </div>
        <motion.div className="text-center mt-12" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.4 }}>
          <button
            onClick={() => window.location.assign(archiveBase(slug))}
            data-testid="view-archive-button"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-400/40 hover:border-cyan-400/70 text-cyan-300 hover:text-white font-medium transition-all duration-300 group"
          >
            <span>瀏覽完整專案資料庫 Career Archive</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
