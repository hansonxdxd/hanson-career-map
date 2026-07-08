// Shared helpers for the project-database-centric content model

export const SECTIONS = [
  { id: 'hero', label: 'HERO' },
  { id: 'thesis', label: 'THESIS' },
  { id: 'evolution', label: 'EVOLUTION' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'capabilities', label: 'CAPABILITIES' },
  { id: 'next', label: 'NEXT' },
  { id: 'contact', label: 'CONTACT' },
];

export const NAV_LINKS = [
  { id: 'thesis', label: 'THESIS' },
  { id: 'evolution', label: 'EVOLUTION' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'capabilities', label: 'CAPABILITIES' },
  { id: 'contact', label: 'CONTACT' },
];

export function getProjectDatabase(content) {
  return (content?.projectDatabase || []).filter(Boolean);
}

export function getProjectById(content, id) {
  return getProjectDatabase(content).find((p) => p.id === id || p.slug === id);
}

// Auto tags derived from a stage's related projects, minus removed, plus manual
export function getStageTags(content, stage) {
  const related = stage.relatedProjectIds || [];
  const removed = stage.removedAutoTags || [];
  const manual = stage.manualTags || [];
  const auto = [];
  related.forEach((pid) => {
    const p = getProjectById(content, pid);
    if (p) (p.tags || []).forEach((t) => { if (!auto.includes(t)) auto.push(t); });
  });
  const filteredAuto = auto.filter((t) => !removed.includes(t));
  const combined = [...filteredAuto];
  manual.forEach((t) => { if (!combined.includes(t)) combined.push(t); });
  return combined;
}

export function getStageProjects(content, stage) {
  return (stage.relatedProjectIds || [])
    .map((pid) => getProjectById(content, pid))
    .filter(Boolean);
}

// Resolve a selected-project slot: project data merged with overrides
export function resolveSlot(content, slot) {
  const p = getProjectById(content, slot.projectId);
  if (!p) return null;
  const o = slot.overrides || {};
  return {
    id: p.id,
    slug: p.slug,
    title: o.title || p.title,
    period: o.period || p.period,
    summary: o.summary || p.summary,
    image: o.image !== undefined && o.image !== null && o.image !== '' ? o.image : p.image,
    imageAlt: o.imageAlt || p.imageAlt,
    imagePosition: o.imagePosition || p.imagePosition,
    skills: (o.skills && o.skills.length ? o.skills : p.tags) || [],
  };
}

// All unique tags across the project database (tag pool)
export function getTagPool(content) {
  const pool = [];
  getProjectDatabase(content).forEach((p) => {
    (p.tags || []).forEach((t) => { if (!pool.includes(t)) pool.push(t); });
  });
  return pool;
}

export function archiveBase(slug) {
  return slug ? `/p/${slug}/archive` : '/archive';
}

export function homeBase(slug) {
  return slug ? `/p/${slug}` : '/';
}
