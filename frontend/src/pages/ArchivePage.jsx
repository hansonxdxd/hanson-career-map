import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, ExternalLink, FileText, Globe, Play, FileBox, Layers } from 'lucide-react';
import { getProfileBySlug, getContent } from '../lib/api';
import { getProjectById, getProjectDatabase, homeBase } from '../lib/content';
import { ImageFrame } from '../components/admin/ImageFramePicker';

const LINK_ICONS = { case: Layers, file: FileBox, website: Globe, demo: Play, video: Play, document: FileText };

const Block = ({ label, text, enabled }) => {
  if (enabled === false || !text) return null;
  return (
    <div className="mb-4">
      <h4 className="text-cyan-400 font-semibold mb-1.5 text-xs uppercase tracking-wider">{label}</h4>
      <p className="text-slate-300 leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
};

const ProjectCard = ({ project, index, highlighted, dimmed, forwardRef }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (highlighted) setOpen(true); }, [highlighted]);

  return (
    <motion.div
      ref={forwardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      data-testid={`archive-card-${project.slug}`}
      className={`transition-all duration-500 ${dimmed ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
    >
      <div className={`rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-xl border transition-all duration-500 ${
        highlighted ? 'border-cyan-400/70 shadow-[0_0_30px_rgba(34,211,238,0.25)]' : 'border-blue-500/25'
      }`}>
        <div className="flex flex-col md:flex-row">
          {project.image && (
            <div className="md:w-2/5 flex-shrink-0">
              <ImageFrame src={project.image} alt={project.imageAlt || project.title} position={project.imagePosition} className="w-full h-56 md:h-full min-h-[220px]" />
            </div>
          )}
          <div className="flex-1 p-7 md:p-9">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h3 className="text-2xl md:text-3xl font-bold text-white">{project.title}</h3>
              {project.period && <span className="text-cyan-400 text-sm font-medium">{project.period}</span>}
            </div>
            {project.shortTitle && <p className="text-blue-300/70 text-sm mb-1">{project.shortTitle}</p>}
            {project.type && <span className="inline-block mb-3 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs">{project.type}</span>}
            {project.summary && <p className="text-slate-200 text-lg leading-relaxed mb-4">{project.summary}</p>}

            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium">{t}</span>
                ))}
              </div>
            )}

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-blue-500/20">
                    <Block label="遇到什麼狀況" text={project.situation} enabled={project.situationEnabled} />
                    <Block label="具體達成什麼" text={project.achievement} enabled={project.achievementEnabled} />
                    <Block label="學到什麼" text={project.learned} enabled={project.learnedEnabled} />
                    <Block label="相關成果" text={project.results} enabled={project.resultsEnabled} />
                    <Block label="備註" text={project.notes} enabled={project.notesEnabled} />

                    {project.links?.filter((l) => l.url).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.links.filter((l) => l.url).map((l, i) => {
                          const Ic = LINK_ICONS[l.type] || ExternalLink;
                          return (
                            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-cyan-400/30 text-cyan-200 text-sm hover:from-blue-600/50 hover:to-cyan-600/50 transition-all">
                              <Ic className="w-3.5 h-3.5" /> {l.label || '連結'}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setOpen((o) => !o)}
              data-testid={`archive-toggle-${project.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              {open ? '收合' : '展開完整內容'}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ArchivePage = () => {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const firstHighlightRef = useRef(null);

  const stageParam = params.get('stage');
  const projectParam = params.get('project');

  useEffect(() => {
    let mounted = true;
    const loader = slug ? getProfileBySlug(slug).then((d) => d.content) : getContent();
    loader.then((d) => { if (mounted) setContent(d); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [slug]);

  const projects = useMemo(() => {
    if (!content) return [];
    return getProjectDatabase(content).filter((p) => p.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [content]);

  const highlightIds = useMemo(() => {
    if (!content) return null;
    if (projectParam) {
      const p = getProjectById(content, projectParam);
      return p ? [p.id] : [];
    }
    if (stageParam) {
      const stage = (content.careerEvolution?.stages || []).find((s) => s.slug === stageParam);
      return stage ? (stage.relatedProjectIds || []) : [];
    }
    return null;
  }, [content, stageParam, projectParam]);

  useEffect(() => {
    if (highlightIds && highlightIds.length && firstHighlightRef.current) {
      setTimeout(() => firstHighlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
    }
  }, [highlightIds, projects]);

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  let firstAssigned = false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950/40 to-slate-950" data-testid="archive-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-blue-500/15">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(homeBase(slug))} data-testid="archive-back-home" className="inline-flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> <span className="text-sm">回首頁</span>
          </button>
          <span className="text-white font-bold tracking-wide text-sm">CAREER ARCHIVE</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">專案資料庫</h1>
          <p className="text-cyan-400 text-lg">Career Archive — {projects.length} projects</p>
          {(stageParam || projectParam) && (
            <button onClick={() => navigate(slug ? `/p/${slug}/archive` : '/archive')} data-testid="archive-clear-filter" className="mt-4 text-sm text-slate-400 hover:text-cyan-300 underline">
              顯示全部專案
            </button>
          )}
        </motion.div>

        <div className="space-y-8">
          {projects.map((project, index) => {
            const highlighted = highlightIds ? highlightIds.includes(project.id) : false;
            const dimmed = highlightIds && highlightIds.length > 0 ? !highlighted : false;
            let refProp = null;
            if (highlighted && !firstAssigned) { refProp = firstHighlightRef; firstAssigned = true; }
            return (
              <ProjectCard key={project.id} project={project} index={index} highlighted={highlighted} dimmed={dimmed} forwardRef={refProp} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArchivePage;
