import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '../ui/button';
import { TextField, TextAreaField, LinkField, TagsField, EditorCard, VisibilityToggle } from './EditorFields';
import { ImageFramePicker } from './ImageFramePicker';
import IconPicker from './IconPicker';
import { getProjectDatabase, getStageTags, getTagPool, resolveSlot } from '../../lib/content';

const Segmented = ({ label, value, options, onChange, testId }) => (
  <div className="space-y-2">
    <p className="text-slate-300 text-sm">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} data-testid={`${testId}-${o.value}`}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${value === o.value ? 'bg-gradient-to-r from-blue-600/40 to-cyan-600/40 text-white border border-cyan-400/50' : 'bg-slate-800/50 text-slate-400 border border-transparent hover:text-white'}`}>
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

// ---------------- Hero ----------------
export const HeroEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setCta = (i, val) => { const ctas = [...data.ctas]; ctas[i] = { ...ctas[i], text: val }; update({ ...data, ctas }); };
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="hero-visible-toggle" />
      <EditorCard title="主視覺圖片 / 照片">
        <VisibilityToggle label="顯示主視覺圖片" value={data.showImage} onChange={(v) => set('showImage', v)} testId="hero-showimage-toggle" />
        <Segmented label="圖片版面位置" value={data.layout || 'center'} onChange={(v) => set('layout', v)} testId="hero-layout"
          options={[{ value: 'left', label: '圖左文右' }, { value: 'right', label: '文左圖右' }, { value: 'center', label: '置中' }]} />
        <Segmented label="圖片形狀" value={data.shape || 'card'} onChange={(v) => set('shape', v)} testId="hero-shape"
          options={[{ value: 'card', label: '大卡片' }, { value: 'rounded', label: '圓角方形' }, { value: 'circle', label: '圓形' }]} />
        <ImageFramePicker value={data.image} alt={data.imageAlt} position={data.imagePosition}
          onChange={({ image, imageAlt, imagePosition }) => update({ ...data, image, imageAlt, imagePosition })}
          testId="hero-image" aspect={data.shape === 'card' ? 'aspect-[4/5]' : 'aspect-square'} />
      </EditorCard>
      <EditorCard title="主視覺內容">
        <TextField label="姓名" value={data.name} onChange={(v) => set('name', v)} testId="hero-name" hint="顯示於 Hero 與頂部導覽" />
        <TextField label="職稱 (英文)" value={data.title} onChange={(v) => set('title', v)} testId="hero-title" />
        <TextField label="職稱 (中文)" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="hero-subtitle" />
        <TextField label="標語" value={data.tagline} onChange={(v) => set('tagline', v)} testId="hero-tagline" />
        <TextAreaField label="描述" value={data.description} onChange={(v) => set('description', v)} rows={3} testId="hero-description" />
        <TextField label="Scroll 提示文字" value={data.scrollHint} onChange={(v) => set('scrollHint', v)} testId="hero-scrollhint" hint="Hero 底部細緻向下箭頭旁的文字,例如 Scroll to explore" />
      </EditorCard>
      <EditorCard title="CTA 按鈕文字 (前台已弱化,主要導覽改用頂部選單與右側圓點)">
        {data.ctas?.map((cta, i) => (
          <TextField key={i} label={`按鈕 ${i + 1} (連結: ${cta.href})`} value={cta.text} onChange={(v) => setCta(i, v)} testId={`hero-cta-${i}`} />
        ))}
      </EditorCard>
    </div>
  );
};

// ---------------- Core Thesis ----------------
export const CoreThesisEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setItem = (i, patch) => { const items = [...data.items]; items[i] = { ...items[i], ...patch }; update({ ...data, items }); };
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="thesis-visible-toggle" />
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="thesis-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="thesis-subtitle" />
        <LinkField label="區塊按鈕連結 (探索完整方法論)" value={data.learnMoreUrl} onChange={(v) => set('learnMoreUrl', v)} testId="thesis-learnmore-url" />
      </EditorCard>
      {data.items?.map((item, i) => (
        <EditorCard key={item.id} title={`核心能力 ${i + 1}`} badge={item.title}>
          <TextField label="標題" value={item.title} onChange={(v) => setItem(i, { title: v })} testId={`thesis-item-${i}-title`} />
          <TextAreaField label="描述" value={item.description} onChange={(v) => setItem(i, { description: v })} rows={2} testId={`thesis-item-${i}-desc`} />
          <div>
            <p className="text-slate-300 text-sm mb-2">Icon (可選內建圖示或上傳自訂)</p>
            <IconPicker iconType={item.iconType} icon={item.icon} onChange={({ iconType, icon }) => setItem(i, { iconType, icon })} testId={`thesis-item-${i}-icon`} />
          </div>
          <LinkField label="卡片連結 (了解更多)" value={item.detailUrl} onChange={(v) => setItem(i, { detailUrl: v })} testId={`thesis-item-${i}-url`} />
        </EditorCard>
      ))}
    </div>
  );
};

// ---------------- Career Evolution (relation model) ----------------
export const CareerEvolutionEditor = ({ data, update, content }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const projectDb = getProjectDatabase(content);
  const setStage = (i, patch) => { const stages = [...data.stages]; stages[i] = { ...stages[i], ...patch }; update({ ...data, stages }); };
  const move = (i, dir) => { const stages = [...data.stages]; const j = i + dir; if (j < 0 || j >= stages.length) return; [stages[i], stages[j]] = [stages[j], stages[i]]; update({ ...data, stages }); };
  const addStage = () => {
    const newId = Math.max(0, ...data.stages.map((s) => s.id || 0)) + 1;
    update({ ...data, stages: [...data.stages, { id: newId, slug: `stage-${newId}`, visible: true, period: '', title: '新階段', titleEn: '', summary: '', relatedProjectIds: [], manualTags: [], removedAutoTags: [] }] });
  };
  const removeStage = (i) => update({ ...data, stages: data.stages.filter((_, idx) => idx !== i) });
  const toggleProject = (i, pid) => {
    const stage = data.stages[i];
    const rel = stage.relatedProjectIds || [];
    setStage(i, { relatedProjectIds: rel.includes(pid) ? rel.filter((x) => x !== pid) : [...rel, pid] });
  };

  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="evolution-visible-toggle" />
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="evolution-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="evolution-subtitle" />
      </EditorCard>
      {data.stages?.map((stage, i) => {
        const autoTags = [];
        (stage.relatedProjectIds || []).forEach((pid) => {
          const p = projectDb.find((x) => x.id === pid);
          if (p) (p.tags || []).forEach((t) => { if (!autoTags.includes(t)) autoTags.push(t); });
        });
        const removed = stage.removedAutoTags || [];
        return (
          <div key={stage.id} className={`p-6 rounded-2xl border space-y-4 ${stage.visible === false ? 'bg-slate-800/20 border-slate-600/30' : 'bg-slate-800/40 border-blue-500/20'}`}>
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">階段 {i + 1}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">{stage.period || '未設定'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} data-testid={`evolution-stage-${i}-up`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 transition-colors"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === data.stages.length - 1} data-testid={`evolution-stage-${i}-down`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 transition-colors"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setStage(i, { visible: stage.visible === false })} data-testid={`evolution-stage-${i}-visible`} className={`p-2 rounded-lg transition-colors hover:bg-slate-700/50 ${stage.visible === false ? 'text-slate-500' : 'text-cyan-400'}`}>{stage.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <TextField label="時間 / 年份範圍" value={stage.period} onChange={(v) => setStage(i, { period: v })} testId={`evolution-stage-${i}-period`} />
              <TextField label="階段名稱" value={stage.title} onChange={(v) => setStage(i, { title: v })} testId={`evolution-stage-${i}-title`} />
            </div>
            <TextField label="英文副標" value={stage.titleEn} onChange={(v) => setStage(i, { titleEn: v })} testId={`evolution-stage-${i}-titleen`} />
            <TextAreaField label="階段摘要" value={stage.summary} onChange={(v) => setStage(i, { summary: v })} rows={2} testId={`evolution-stage-${i}-summary`} />

            {/* 選取關聯專案 */}
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">選取關聯專案 (從專案資料庫)</p>
              <div className="grid md:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/40 border border-blue-500/20">
                {projectDb.length === 0 && <p className="text-xs text-slate-500">尚無專案,請先到「專案資料庫」新增。</p>}
                {projectDb.map((p) => {
                  const checked = (stage.relatedProjectIds || []).includes(p.id);
                  return (
                    <label key={p.id} data-testid={`evolution-stage-${i}-project-${p.id}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${checked ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-800/40 text-slate-400 hover:text-white'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleProject(i, p.id)} className="accent-cyan-400" />
                      {p.title}
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">被選取專案的短標題與能力標籤會自動顯示在此階段。</p>
            </div>

            {/* 自動帶入標籤 */}
            {autoTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-slate-300 text-sm">自動帶入的能力標籤 (可點 X 移除)</p>
                <div className="flex flex-wrap gap-2">
                  {autoTags.map((t) => {
                    const isRemoved = removed.includes(t);
                    return (
                      <button key={t} type="button" onClick={() => setStage(i, { removedAutoTags: isRemoved ? removed.filter((x) => x !== t) : [...removed, t] })}
                        data-testid={`evolution-stage-${i}-autotag-${t}`}
                        className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 transition-all ${isRemoved ? 'bg-slate-800/40 border-slate-600/40 text-slate-500 line-through' : 'bg-blue-500/20 border-blue-400/30 text-blue-300'}`}>
                        {t} {!isRemoved && <X className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <TagsField label="手動能力標籤 (額外新增)" value={stage.manualTags} onChange={(v) => setStage(i, { manualTags: v })} testId={`evolution-stage-${i}-manualtags`} />
            <p className="text-xs text-slate-500">前台實際顯示標籤:{getStageTags(content, stage).join('、') || '(無)'}</p>

            <Button variant="destructive" size="sm" onClick={() => removeStage(i)} data-testid={`evolution-stage-${i}-remove`} className="mt-2"><Trash2 className="w-4 h-4 mr-1" /> 刪除此階段</Button>
          </div>
        );
      })}
      <Button onClick={addStage} data-testid="evolution-add-stage" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30"><Plus className="w-4 h-4 mr-1" /> 新增階段</Button>
    </div>
  );
};

// ---------------- Selected Projects (slots) ----------------
export const ProjectsEditor = ({ data, update, content }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const projectDb = getProjectDatabase(content);
  const setItem = (i, patch) => { const items = [...data.items]; items[i] = { ...items[i], ...patch }; update({ ...data, items }); };
  const setOverride = (i, key, val) => { const items = [...data.items]; items[i] = { ...items[i], overrides: { ...(items[i].overrides || {}), [key]: val } }; update({ ...data, items }); };
  const move = (i, dir) => { const items = [...data.items]; const j = i + dir; if (j < 0 || j >= items.length) return; [items[i], items[j]] = [items[j], items[i]]; update({ ...data, items }); };
  const addSlot = () => {
    const newId = Math.max(0, ...data.items.map((s) => s.id || 0)) + 1;
    update({ ...data, items: [...data.items, { id: newId, projectId: projectDb[0]?.id || '', overrides: {}, visible: true }] });
  };
  const removeSlot = (i) => update({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="projects-visible-toggle" />
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-slate-300">精選專案改為「從專案資料庫選取」,自動帶入圖片、標題、時間、概要與標籤。留空的覆寫欄位會顯示資料庫原本內容。</div>
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="projects-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="projects-subtitle" />
      </EditorCard>
      {data.items?.map((slot, i) => {
        const resolved = resolveSlot(content, slot);
        return (
          <div key={slot.id} className={`p-6 rounded-2xl border space-y-4 ${slot.visible === false ? 'bg-slate-800/20 border-slate-600/30' : 'bg-slate-800/40 border-blue-500/20'}`}>
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <h3 className="text-lg font-semibold text-white">精選 {i + 1}</h3>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} data-testid={`projects-slot-${i}-up`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 transition-colors"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === data.items.length - 1} data-testid={`projects-slot-${i}-down`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 transition-colors"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setItem(i, { visible: slot.visible === false })} data-testid={`projects-slot-${i}-visible`} className={`p-2 rounded-lg transition-colors hover:bg-slate-700/50 ${slot.visible === false ? 'text-slate-500' : 'text-cyan-400'}`}>{slot.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">選取專案</p>
              <select value={slot.projectId} onChange={(e) => setItem(i, { projectId: e.target.value })} data-testid={`projects-slot-${i}-select`}
                className="w-full bg-slate-900/50 border border-blue-500/30 text-white rounded-md px-3 py-2 text-sm">
                <option value="">— 請選擇 —</option>
                {projectDb.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            {resolved && (
              <div className="text-xs text-slate-500 p-3 rounded-lg bg-slate-900/40 border border-blue-500/15">
                目前顯示:{resolved.title}｜{resolved.period || '無時間'}｜標籤 {resolved.skills.slice(0, 4).join('、')}
              </div>
            )}
            <details className="rounded-lg bg-slate-900/30 border border-blue-500/15">
              <summary className="px-4 py-2 text-sm text-cyan-300 cursor-pointer">選填:覆寫顯示文字</summary>
              <div className="p-4 space-y-3">
                <TextField label="覆寫標題" value={slot.overrides?.title} onChange={(v) => setOverride(i, 'title', v)} testId={`projects-slot-${i}-ov-title`} hint="留空則使用資料庫標題" />
                <TextField label="覆寫時間段" value={slot.overrides?.period} onChange={(v) => setOverride(i, 'period', v)} testId={`projects-slot-${i}-ov-period`} hint="留空則使用資料庫時間" />
                <TextAreaField label="覆寫概要" value={slot.overrides?.summary} onChange={(v) => setOverride(i, 'summary', v)} rows={2} testId={`projects-slot-${i}-ov-summary`} hint="留空則使用資料庫概要" />
              </div>
            </details>
            <Button variant="destructive" size="sm" onClick={() => removeSlot(i)} data-testid={`projects-slot-${i}-remove`}><Trash2 className="w-4 h-4 mr-1" /> 移除此精選</Button>
          </div>
        );
      })}
      <Button onClick={addSlot} data-testid="projects-add-slot" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30"><Plus className="w-4 h-4 mr-1" /> 新增精選專案</Button>
    </div>
  );
};

// ---------------- Capabilities (with tag pool) ----------------
export const CapabilitiesEditor = ({ data, update, content }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const pool = getTagPool(content);
  const usedAll = new Set();
  (data.categories || []).forEach((c) => (c.skills || []).forEach((s) => usedAll.add(s)));
  const setCat = (i, key, val) => { const categories = [...data.categories]; categories[i] = { ...categories[i], [key]: val }; update({ ...data, categories }); };
  const move = (i, dir) => { const categories = [...data.categories]; const j = i + dir; if (j < 0 || j >= categories.length) return; [categories[i], categories[j]] = [categories[j], categories[i]]; update({ ...data, categories }); };
  const addCat = () => { const newId = Math.max(0, ...data.categories.map((s) => s.id || 0)) + 1; update({ ...data, categories: [...data.categories, { id: newId, name: '新分類', description: '', visible: true, skills: [] }] }); };
  const removeCat = (i) => update({ ...data, categories: data.categories.filter((_, idx) => idx !== i) });
  const addSkill = (i, tag) => { const cat = data.categories[i]; if (!(cat.skills || []).includes(tag)) setCat(i, 'skills', [...(cat.skills || []), tag]); };
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="capabilities-visible-toggle" />
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="capabilities-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="capabilities-subtitle" />
        <LinkField label="區塊按鈕連結 (查看完整技能樹)" value={data.viewDetailUrl} onChange={(v) => set('viewDetailUrl', v)} testId="capabilities-viewdetail-url" />
      </EditorCard>
      {data.categories?.map((cat, i) => (
        <div key={cat.id} className={`p-6 rounded-2xl border space-y-4 ${cat.visible === false ? 'bg-slate-800/20 border-slate-600/30' : 'bg-slate-800/40 border-blue-500/20'}`}>
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2"><h3 className="text-lg font-semibold text-white">分類 {i + 1}</h3><span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">{cat.name}</span></div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} data-testid={`capabilities-cat-${i}-up`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 transition-colors"><ArrowUp className="w-4 h-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === data.categories.length - 1} data-testid={`capabilities-cat-${i}-down`} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 transition-colors"><ArrowDown className="w-4 h-4" /></button>
              <button type="button" onClick={() => setCat(i, 'visible', cat.visible === false)} data-testid={`capabilities-cat-${i}-visible`} className={`p-2 rounded-lg transition-colors hover:bg-slate-700/50 ${cat.visible === false ? 'text-slate-500' : 'text-cyan-400'}`}>{cat.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <TextField label="分類名稱" value={cat.name} onChange={(v) => setCat(i, 'name', v)} testId={`capabilities-cat-${i}-name`} />
          <TextField label="分類描述 (選填)" value={cat.description} onChange={(v) => setCat(i, 'description', v)} testId={`capabilities-cat-${i}-desc`} />
          <TagsField label="技能標籤" value={cat.skills} onChange={(v) => setCat(i, 'skills', v)} testId={`capabilities-cat-${i}-skills`} />
          {pool.length > 0 && (
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">從專案標籤池加入 (灰色=已在其他分類使用過)</p>
              <div className="flex flex-wrap gap-2">
                {pool.filter((t) => !(cat.skills || []).includes(t)).map((t) => (
                  <button key={t} type="button" onClick={() => addSkill(i, t)} data-testid={`capabilities-cat-${i}-pool-${t}`}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${usedAll.has(t) ? 'bg-slate-800/40 border-slate-600/40 text-slate-500' : 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30'}`}>
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button variant="destructive" size="sm" onClick={() => removeCat(i)} data-testid={`capabilities-cat-${i}-remove`}><Trash2 className="w-4 h-4 mr-1" /> 刪除此分類</Button>
        </div>
      ))}
      <Button onClick={addCat} data-testid="capabilities-add-cat" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30"><Plus className="w-4 h-4 mr-1" /> 新增分類</Button>
    </div>
  );
};

// ---------------- Now/Next ----------------
export const NowNextEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setLine = (i, val) => { const content = [...data.content]; content[i] = val; update({ ...data, content }); };
  const addLine = () => update({ ...data, content: [...data.content, ''] });
  const removeLine = (i) => update({ ...data, content: data.content.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="nownext-visible-toggle" />
      <EditorCard title="標題與結尾">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="nownext-title" />
        <TextField label="結尾句 (英文)" value={data.closingEn} onChange={(v) => set('closingEn', v)} testId="nownext-closing-en" />
        <TextField label="結尾句 (中文)" value={data.closingZh} onChange={(v) => set('closingZh', v)} testId="nownext-closing-zh" />
      </EditorCard>
      <EditorCard title="內文段落">
        {data.content?.map((line, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1"><TextAreaField label={`段落 ${i + 1}`} value={line} onChange={(v) => setLine(i, v)} rows={2} testId={`nownext-line-${i}`} /></div>
            <Button variant="destructive" size="icon" onClick={() => removeLine(i)} data-testid={`nownext-line-${i}-remove`} className="mt-8"><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
        <Button onClick={addLine} data-testid="nownext-add-line" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30"><Plus className="w-4 h-4 mr-1" /> 新增段落</Button>
      </EditorCard>
    </div>
  );
};

// ---------------- Contact ----------------
export const ContactEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setResume = (key, val) => update({ ...data, resume: { ...(data.resume || {}), [key]: val } });
  const setOpen = (i, val) => { const openTo = [...data.openTo]; openTo[i] = val; update({ ...data, openTo }); };
  const addOpen = () => update({ ...data, openTo: [...data.openTo, ''] });
  const removeOpen = (i) => update({ ...data, openTo: data.openTo.filter((_, idx) => idx !== i) });
  const resume = data.resume || {};
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="contact-visible-toggle" />
      <EditorCard title="聯絡資訊">
        <div className="grid md:grid-cols-2 gap-4">
          <TextField label="Email" value={data.email} onChange={(v) => set('email', v)} testId="contact-email" />
          <TextField label="電話號碼" value={data.phone} onChange={(v) => set('phone', v)} testId="contact-phone" hint="留空則不顯示電話" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <TextField label="LINE 連結" value={data.lineUrl} onChange={(v) => set('lineUrl', v)} testId="contact-line" hint="留空則不顯示 LINE" />
          <TextField label="地點" value={data.location} onChange={(v) => set('location', v)} testId="contact-location" />
        </div>
      </EditorCard>
      <EditorCard title="履歷下載按鈕">
        <TextField label="按鈕文字" value={resume.text} onChange={(v) => setResume('text', v)} testId="contact-resume-text" />
        <LinkField label="履歷連結 (PDF 或雲端連結,留空則不顯示按鈕)" value={resume.url} onChange={(v) => setResume('url', v)} testId="contact-resume-url" />
      </EditorCard>
      <EditorCard title="Open to (合作方向)">
        {data.openTo?.map((item, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1"><TextField label={`方向 ${i + 1}`} value={item} onChange={(v) => setOpen(i, v)} testId={`contact-open-${i}`} /></div>
            <Button variant="destructive" size="icon" onClick={() => removeOpen(i)} data-testid={`contact-open-${i}-remove`}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
        <Button onClick={addOpen} data-testid="contact-add-open" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30"><Plus className="w-4 h-4 mr-1" /> 新增方向</Button>
      </EditorCard>
    </div>
  );
};
