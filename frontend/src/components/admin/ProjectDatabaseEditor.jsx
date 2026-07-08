import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, Eye, EyeOff, Link2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TextField, TextAreaField, EditorCard } from './EditorFields';
import { ImageFramePicker } from './ImageFramePicker';

const LINK_TYPES = ['case', 'file', 'website', 'demo', 'video', 'document'];

// A content block with its own enable/disable toggle
const ToggleBlock = ({ label, hint, enabled, onToggle, text, onText, rows = 3, testId }) => (
  <div className={`rounded-xl border p-4 space-y-2 ${enabled ? 'border-blue-500/25 bg-slate-900/30' : 'border-slate-700/40 bg-slate-900/10'}`}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <button type="button" onClick={() => onToggle(!enabled)} data-testid={`${testId}-toggle`}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
    {enabled && (
      <>
        <TextAreaField label="" value={text} onChange={onText} rows={rows} testId={testId} />
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </>
    )}
  </div>
);

const LinksEditor = ({ links, onChange, testId }) => {
  const setLink = (i, patch) => {
    const next = [...links];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const add = () => onChange([...(links || []), { id: Date.now(), label: '', url: '', type: 'website' }]);
  const remove = (i) => onChange(links.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      {(links || []).map((l, i) => (
        <div key={l.id || i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-3 rounded-lg bg-slate-900/40 border border-blue-500/15">
          <Input value={l.label || ''} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="標籤 label" data-testid={`${testId}-${i}-label`}
            className="md:col-span-3 bg-slate-900/50 border-blue-500/30 text-white text-sm h-9" />
          <Input value={l.url || ''} onChange={(e) => setLink(i, { url: e.target.value })} placeholder="https://..." data-testid={`${testId}-${i}-url`}
            className="md:col-span-5 bg-slate-900/50 border-blue-500/30 text-white text-sm h-9" />
          <select value={l.type || 'website'} onChange={(e) => setLink(i, { type: e.target.value })} data-testid={`${testId}-${i}-type`}
            className="md:col-span-3 bg-slate-900/50 border border-blue-500/30 text-white text-sm h-9 rounded-md px-2">
            {LINK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="button" onClick={() => remove(i)} data-testid={`${testId}-${i}-remove`} className="md:col-span-1 flex justify-center text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <Button onClick={add} data-testid={`${testId}-add`} size="sm" className="bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30">
        <Link2 className="w-3.5 h-3.5 mr-1" /> 新增成果連結
      </Button>
    </div>
  );
};

const ProjectDatabaseEditor = ({ data, update }) => {
  const projects = data || [];

  const setProject = (i, patch) => {
    const next = [...projects];
    next[i] = { ...next[i], ...patch };
    update(next);
  };
  const move = (i, dir) => {
    const next = [...projects];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    update(next.map((p, idx) => ({ ...p, order: idx + 1 })));
  };
  const addProject = () => {
    const id = `project-${Date.now()}`;
    update([...projects, {
      id, slug: id, enabled: true, order: projects.length + 1,
      image: null, imageAlt: '', imagePosition: { x: 50, y: 50 },
      title: '新專案', shortTitle: '', period: '', type: '', summary: '', tags: [],
      situation: '', situationEnabled: false, achievement: '', achievementEnabled: false,
      learned: '', learnedEnabled: false, results: '', resultsEnabled: false,
      notes: '', notesEnabled: false, links: [],
    }]);
  };
  const duplicate = (i) => {
    const src = projects[i];
    const id = `project-${Date.now()}`;
    const copy = { ...JSON.parse(JSON.stringify(src)), id, slug: id, title: src.title + ' (副本)', order: projects.length + 1 };
    update([...projects, copy]);
  };
  const remove = (i) => {
    if (!window.confirm(`確定刪除專案「${projects[i].title}」？此動作無法復原。`)) return;
    update(projects.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-slate-300">
        專案資料庫是所有內容的核心來源。這裡的專案會顯示在 <span className="text-cyan-300">/archive</span> 頁面,並可被「職涯地圖」「精選專案」「能力系統」引用。
      </div>

      {projects.map((p, i) => (
        <div key={p.id} className={`p-6 rounded-2xl border space-y-4 ${p.enabled === false ? 'bg-slate-800/20 border-slate-600/30' : 'bg-slate-800/40 border-blue-500/20'}`}>
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{p.title || '未命名專案'}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 flex-shrink-0">{p.slug}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} data-testid={`db-project-${i}-up`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 transition-colors"><ArrowUp className="w-4 h-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === projects.length - 1} data-testid={`db-project-${i}-down`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 transition-colors"><ArrowDown className="w-4 h-4" /></button>
              <button type="button" onClick={() => duplicate(i)} data-testid={`db-project-${i}-duplicate`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 transition-colors" title="複製"><Copy className="w-4 h-4" /></button>
              <button type="button" onClick={() => setProject(i, { enabled: p.enabled === false })} data-testid={`db-project-${i}-visible`} className={`p-2 rounded-lg transition-colors hover:bg-slate-700/50 ${p.enabled === false ? 'text-slate-500' : 'text-cyan-400'}`}>{p.enabled === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              <button type="button" onClick={() => remove(i)} data-testid={`db-project-${i}-remove`} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          <div>
            <p className="text-slate-300 text-sm mb-2">專案圖片 (上傳後可拖曳裁切；未上傳則前台不顯示圖框)</p>
            <ImageFramePicker value={p.image} alt={p.imageAlt} position={p.imagePosition}
              onChange={({ image, imageAlt, imagePosition }) => setProject(i, { image, imageAlt, imagePosition })}
              testId={`db-project-${i}-image`} aspect="aspect-video" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="專案標題" value={p.title} onChange={(v) => setProject(i, { title: v })} testId={`db-project-${i}-title`} hint="中文 8–18 字；英文 3–8 words" />
            <TextField label="短標題" value={p.shortTitle} onChange={(v) => setProject(i, { shortTitle: v })} testId={`db-project-${i}-shorttitle`} hint="中文 4–10 字；英文 2–5 words (顯示於階段 chips)" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="專案時間段" value={p.period} onChange={(v) => setProject(i, { period: v })} testId={`db-project-${i}-period`} hint="例如 2025.12–至今,建議 8–16 字" />
            <TextField label="專案類型" value={p.type} onChange={(v) => setProject(i, { type: v })} testId={`db-project-${i}-type`} hint="例如 Enterprise AI / Content Design" />
          </div>
          <TextAreaField label="專案概要" value={p.summary} onChange={(v) => setProject(i, { summary: v })} rows={2} testId={`db-project-${i}-summary`} hint="中文 30–50 字；英文 15–25 words" />
          <div className="space-y-2">
            <p className="text-slate-300 text-sm">能力標籤</p>
            <Input value={(p.tags || []).join(', ')} onChange={(e) => setProject(i, { tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder="標籤1, 標籤2" data-testid={`db-project-${i}-tags`} className="bg-slate-900/50 border-blue-500/30 text-white text-sm" />
            <p className="text-xs text-slate-500">每個中文 2–8 字；英文 1–3 words,建議 3–6 個。這些標籤會匯入職涯地圖與能力標籤池。</p>
          </div>

          <p className="text-slate-400 text-xs uppercase tracking-wider pt-2">完整內容 (可個別開關,關閉則前台隱藏)</p>
          <ToggleBlock label="遇到什麼狀況" hint="中文 60–120 字；英文 30–60 words" enabled={p.situationEnabled} onToggle={(v) => setProject(i, { situationEnabled: v })} text={p.situation} onText={(v) => setProject(i, { situation: v })} testId={`db-project-${i}-situation`} />
          <ToggleBlock label="具體達成什麼" hint="中文 80–180 字；英文 40–90 words" enabled={p.achievementEnabled} onToggle={(v) => setProject(i, { achievementEnabled: v })} text={p.achievement} onText={(v) => setProject(i, { achievement: v })} testId={`db-project-${i}-achievement`} />
          <ToggleBlock label="學到什麼" hint="中文 60–120 字；英文 30–60 words" enabled={p.learnedEnabled} onToggle={(v) => setProject(i, { learnedEnabled: v })} text={p.learned} onText={(v) => setProject(i, { learned: v })} testId={`db-project-${i}-learned`} />
          <ToggleBlock label="相關成果" hint="補充量化或質化成果 (選填)" enabled={p.resultsEnabled} onToggle={(v) => setProject(i, { resultsEnabled: v })} text={p.results} onText={(v) => setProject(i, { results: v })} testId={`db-project-${i}-results`} />
          <ToggleBlock label="備註" hint="選填" enabled={p.notesEnabled} onToggle={(v) => setProject(i, { notesEnabled: v })} text={p.notes} onText={(v) => setProject(i, { notes: v })} rows={2} testId={`db-project-${i}-notes`} />

          <EditorCard title="相關成果連結">
            <LinksEditor links={p.links} onChange={(v) => setProject(i, { links: v })} testId={`db-project-${i}-links`} />
          </EditorCard>
        </div>
      ))}

      <Button onClick={addProject} data-testid="db-add-project" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30">
        <Plus className="w-4 h-4 mr-1" /> 新增專案
      </Button>
    </div>
  );
};

export default ProjectDatabaseEditor;
