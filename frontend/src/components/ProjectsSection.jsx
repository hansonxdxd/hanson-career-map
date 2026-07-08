import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { ImageFrame } from './admin/ImageFramePicker';

const ProjectCard = ({ project, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="group relative h-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
    >
      <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-blue-500/20 group-hover:border-cyan-400/50 transition-all duration-500 overflow-hidden flex flex-col">
        {/* 背景發光效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-500" />
        
        <div className="relative z-10 flex-1 flex flex-col">
          {/* 專案圖片 - 只有在有圖片時才顯示 */}
          {project.image && (
            <ImageFrame
              src={project.image}
              alt={project.imageAlt || project.title}
              position={project.imagePosition}
              className="w-full h-48 mb-4 rounded-xl border border-blue-500/20"
            />
          )}
          
          {/* 標題 */}
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
            {project.title}
          </h3>
          
          {/* 描述 */}
          <p className="text-slate-300 mb-4 leading-relaxed flex-1">
            {project.description}
          </p>
          
          {/* 技能標籤 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
          
          {/* 連結（如果有） */}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 group/link"
            >
              <span className="text-sm font-medium">查看專案</span>
              <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
            </a>
          )}
        </div>
        
        {/* Hover 展開效果 */}
        <motion.div
          className="absolute inset-0 border-2 border-cyan-400/0 rounded-2xl pointer-events-none"
          animate={{
            borderColor: isExpanded ? 'rgba(34, 211, 238, 0.4)' : 'rgba(34, 211, 238, 0)'
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

const ProjectsSection = ({ data }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="projects" ref={ref} className="py-24 bg-slate-900 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
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

        {/* 專案網格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {data.items.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* 查看所有專案連結 */}
        {data.viewAllUrl && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <a
              href={data.viewAllUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 group"
            >
              <span>查看所有專案</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
