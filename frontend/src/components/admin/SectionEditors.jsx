import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { TextField, TextAreaField, LinkField, TagsField, EditorCard, VisibilityToggle } from './EditorFields';
import { ImageFramePicker } from './ImageFramePicker';
import IconPicker from './IconPicker';

// ---------------- Hero Editor ----------------
export const HeroEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setCta = (i, val) => {
    const ctas = [...data.ctas];
    ctas[i] = { ...ctas[i], text: val };
    update({ ...data, ctas });
  };
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="hero-visible-toggle" />
      <EditorCard title="主視覺圖片 / 照片">
        <ImageFramePicker
          value={data.image}
          alt={data.imageAlt}
          position={data.imagePosition}
          onChange={({ image, imageAlt, imagePosition }) => update({ ...data, image, imageAlt, imagePosition })}
          testId="hero-image"
          aspect="aspect-square"
        />
      </EditorCard>
      <EditorCard title="主視覺內容">
        <TextField label="姓名" value={data.name} onChange={(v) => set('name', v)} testId="hero-name" />
        <TextField label="職稱 (英文)" value={data.title} onChange={(v) => set('title', v)} testId="hero-title" />
        <TextField label="職稱 (中文)" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="hero-subtitle" />
        <TextField label="標語" value={data.tagline} onChange={(v) => set('tagline', v)} testId="hero-tagline" />
        <TextAreaField label="描述" value={data.description} onChange={(v) => set('description', v)} rows={3} testId="hero-description" />
      </EditorCard>
      <EditorCard title="CTA 按鈕文字">
        {data.ctas?.map((cta, i) => (
          <TextField key={i} label={`按鈕 ${i + 1} (連結: ${cta.href})`} value={cta.text} onChange={(v) => setCta(i, v)} testId={`hero-cta-${i}`} />
        ))}
      </EditorCard>
    </div>
  );
};

// ---------------- Core Thesis Editor ----------------
export const CoreThesisEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setItem = (i, patch) => {
    const items = [...data.items];
    items[i] = { ...items[i], ...patch };
    update({ ...data, items });
  };
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
            <IconPicker
              iconType={item.iconType}
              icon={item.icon}
              onChange={({ iconType, icon }) => setItem(i, { iconType, icon })}
              testId={`thesis-item-${i}-icon`}
            />
          </div>
          <LinkField label="卡片連結 (了解更多)" value={item.detailUrl} onChange={(v) => setItem(i, { detailUrl: v })} testId={`thesis-item-${i}-url`} />
        </EditorCard>
      ))}
    </div>
  );
};

// ---------------- Career Evolution Editor ----------------
export const CareerEvolutionEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setStage = (i, patch) => {
    const stages = [...data.stages];
    stages[i] = { ...stages[i], ...patch };
    update({ ...data, stages });
  };
  const moveStage = (i, dir) => {
    const stages = [...data.stages];
    const j = i + dir;
    if (j < 0 || j >= stages.length) return;
    [stages[i], stages[j]] = [stages[j], stages[i]];
    update({ ...data, stages });
  };
  const addStage = () => {
    const newId = Math.max(0, ...data.stages.map((s) => s.id || 0)) + 1;
    update({
      ...data,
      stages: [...data.stages, {
        id: newId, visible: true, period: '', title: '新階段', titleEn: '', summary: '',
        situation: '', actions: '', outcome: '', coreAbility: '', tags: [], detailUrl: null,
      }],
    });
  };
  const removeStage = (i) => update({ ...data, stages: data.stages.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="evolution-visible-toggle" />
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="evolution-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="evolution-subtitle" />
      </EditorCard>
      {data.stages?.map((stage, i) => (
        <div key={stage.id} className={`p-6 rounded-2xl border space-y-4 ${stage.visible === false ? 'bg-slate-800/20 border-slate-600/30' : 'bg-slate-800/40 border-blue-500/20'}`}>
          {/* 階段控制列 */}
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">階段 {i + 1}</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">{stage.period || '未設定'}</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveStage(i, -1)} disabled={i === 0} data-testid={`evolution-stage-${i}-up`}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="上移">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => moveStage(i, 1)} disabled={i === data.stages.length - 1} data-testid={`evolution-stage-${i}-down`}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="下移">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setStage(i, { visible: stage.visible === false })} data-testid={`evolution-stage-${i}-visible`}
                className={`p-2 rounded-lg transition-colors ${stage.visible === false ? 'text-slate-500 hover:text-slate-300' : 'text-cyan-400 hover:text-cyan-300'} hover:bg-slate-700/50`}
                title={stage.visible === false ? '目前隱藏' : '目前顯示'}>
                {stage.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="時間" value={stage.period} onChange={(v) => setStage(i, { period: v })} testId={`evolution-stage-${i}-period`} />
            <TextField label="階段名稱" value={stage.title} onChange={(v) => setStage(i, { title: v })} testId={`evolution-stage-${i}-title`} />
          </div>
          <TextField label="英文名稱" value={stage.titleEn} onChange={(v) => setStage(i, { titleEn: v })} testId={`evolution-stage-${i}-titleen`} />
          <TextAreaField label="摘要" value={stage.summary} onChange={(v) => setStage(i, { summary: v })} rows={2} testId={`evolution-stage-${i}-summary`} />
          <TextAreaField label="Situation (遇到的問題)" value={stage.situation} onChange={(v) => setStage(i, { situation: v })} rows={2} testId={`evolution-stage-${i}-situation`} />
          <TextAreaField label="Actions (我的做法)" value={stage.actions} onChange={(v) => setStage(i, { actions: v })} rows={2} testId={`evolution-stage-${i}-actions`} />
          <TextAreaField label="Outcome (具體成果)" value={stage.outcome} onChange={(v) => setStage(i, { outcome: v })} rows={2} testId={`evolution-stage-${i}-outcome`} />
          <TextAreaField label="Core Ability (底層能力)" value={stage.coreAbility} onChange={(v) => setStage(i, { coreAbility: v })} rows={2} testId={`evolution-stage-${i}-ability`} />
          <TagsField label="能力標籤" value={stage.tags} onChange={(v) => setStage(i, { tags: v })} testId={`evolution-stage-${i}-tags`} />
          <LinkField label="階段連結 (了解更多)" value={stage.detailUrl} onChange={(v) => setStage(i, { detailUrl: v })} testId={`evolution-stage-${i}-url`} />
          <Button variant="destructive" size="sm" onClick={() => removeStage(i)} data-testid={`evolution-stage-${i}-remove`} className="mt-2">
            <Trash2 className="w-4 h-4 mr-1" /> 刪除此階段
          </Button>
        </div>
      ))}
      <Button onClick={addStage} data-testid="evolution-add-stage" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30">
        <Plus className="w-4 h-4 mr-1" /> 新增階段
      </Button>
    </div>
  );
};

// ---------------- Projects Editor ----------------
export const ProjectsEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setItem = (i, patch) => {
    const items = [...data.items];
    items[i] = { ...items[i], ...patch };
    update({ ...data, items });
  };
  const moveItem = (i, dir) => {
    const items = [...data.items];
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    update({ ...data, items });
  };
  const addItem = () => {
    const newId = Math.max(0, ...data.items.map((s) => s.id || 0)) + 1;
    update({ ...data, items: [...data.items, { id: newId, title: '新專案', description: '', skills: [], image: null, imageAlt: '', imagePosition: { x: 50, y: 50 }, link: null }] });
  };
  const removeItem = (i) => update({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="projects-visible-toggle" />
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="projects-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="projects-subtitle" />
        <LinkField label="區塊按鈕連結 (查看所有專案)" value={data.viewAllUrl} onChange={(v) => set('viewAllUrl', v)} testId="projects-viewall-url" />
      </EditorCard>
      {data.items?.map((item, i) => (
        <div key={item.id} className="p-6 rounded-2xl bg-slate-800/40 border border-blue-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">專案 {i + 1}</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">{item.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} data-testid={`projects-item-${i}-up`}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="上移">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => moveItem(i, 1)} disabled={i === data.items.length - 1} data-testid={`projects-item-${i}-down`}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="下移">
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <TextField label="專案名稱" value={item.title} onChange={(v) => setItem(i, { title: v })} testId={`projects-item-${i}-title`} />
          <TextAreaField label="描述" value={item.description} onChange={(v) => setItem(i, { description: v })} rows={2} testId={`projects-item-${i}-desc`} />
          <TagsField label="技能標籤" value={item.skills} onChange={(v) => setItem(i, { skills: v })} testId={`projects-item-${i}-skills`} />
          <div>
            <p className="text-slate-300 text-sm mb-2">專案圖片 (上傳後可拖曳調整裁切位置，未上傳則前台不顯示圖框)</p>
            <ImageFramePicker
              value={item.image}
              alt={item.imageAlt}
              position={item.imagePosition}
              onChange={({ image, imageAlt, imagePosition }) => setItem(i, { image, imageAlt, imagePosition })}
              testId={`projects-item-${i}-image`}
              aspect="aspect-video"
            />
          </div>
          <LinkField label="專案連結 (查看專案)" value={item.link} onChange={(v) => setItem(i, { link: v })} testId={`projects-item-${i}-link`} />
          <Button variant="destructive" size="sm" onClick={() => removeItem(i)} data-testid={`projects-item-${i}-remove`} className="mt-2">
            <Trash2 className="w-4 h-4 mr-1" /> 刪除此專案
          </Button>
        </div>
      ))}
      <Button onClick={addItem} data-testid="projects-add-item" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30">
        <Plus className="w-4 h-4 mr-1" /> 新增專案
      </Button>
    </div>
  );
};

// ---------------- Capabilities Editor ----------------
export const CapabilitiesEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setCat = (i, key, val) => {
    const categories = [...data.categories];
    categories[i] = { ...categories[i], [key]: val };
    update({ ...data, categories });
  };
  const moveCat = (i, dir) => {
    const categories = [...data.categories];
    const j = i + dir;
    if (j < 0 || j >= categories.length) return;
    [categories[i], categories[j]] = [categories[j], categories[i]];
    update({ ...data, categories });
  };
  const addCat = () => {
    const newId = Math.max(0, ...data.categories.map((s) => s.id || 0)) + 1;
    update({ ...data, categories: [...data.categories, { id: newId, name: '新分類', skills: [] }] });
  };
  const removeCat = (i) => update({ ...data, categories: data.categories.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="capabilities-visible-toggle" />
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="capabilities-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="capabilities-subtitle" />
        <LinkField label="區塊按鈕連結 (查看完整技能樹)" value={data.viewDetailUrl} onChange={(v) => set('viewDetailUrl', v)} testId="capabilities-viewdetail-url" />
      </EditorCard>
      {data.categories?.map((cat, i) => (
        <div key={cat.id} className="p-6 rounded-2xl bg-slate-800/40 border border-blue-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">分類 {i + 1}</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveCat(i, -1)} disabled={i === 0} data-testid={`capabilities-cat-${i}-up`}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => moveCat(i, 1)} disabled={i === data.categories.length - 1} data-testid={`capabilities-cat-${i}-down`}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <TextField label="分類名稱" value={cat.name} onChange={(v) => setCat(i, 'name', v)} testId={`capabilities-cat-${i}-name`} />
          <TagsField label="技能" value={cat.skills} onChange={(v) => setCat(i, 'skills', v)} testId={`capabilities-cat-${i}-skills`} />
          <Button variant="destructive" size="sm" onClick={() => removeCat(i)} data-testid={`capabilities-cat-${i}-remove`} className="mt-2">
            <Trash2 className="w-4 h-4 mr-1" /> 刪除此分類
          </Button>
        </div>
      ))}
      <Button onClick={addCat} data-testid="capabilities-add-cat" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30">
        <Plus className="w-4 h-4 mr-1" /> 新增分類
      </Button>
    </div>
  );
};

// ---------------- Now/Next Editor ----------------
export const NowNextEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setLine = (i, val) => {
    const content = [...data.content];
    content[i] = val;
    update({ ...data, content });
  };
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
            <div className="flex-1">
              <TextAreaField label={`段落 ${i + 1}`} value={line} onChange={(v) => setLine(i, v)} rows={2} testId={`nownext-line-${i}`} />
            </div>
            <Button variant="destructive" size="icon" onClick={() => removeLine(i)} data-testid={`nownext-line-${i}-remove`} className="mt-8">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addLine} data-testid="nownext-add-line" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30">
          <Plus className="w-4 h-4 mr-1" /> 新增段落
        </Button>
      </EditorCard>
    </div>
  );
};

// ---------------- Contact Editor ----------------
export const ContactEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setResume = (key, val) => update({ ...data, resume: { ...(data.resume || {}), [key]: val } });
  const setOpen = (i, val) => {
    const openTo = [...data.openTo];
    openTo[i] = val;
    update({ ...data, openTo });
  };
  const addOpen = () => update({ ...data, openTo: [...data.openTo, ''] });
  const removeOpen = (i) => update({ ...data, openTo: data.openTo.filter((_, idx) => idx !== i) });
  const resume = data.resume || {};
  return (
    <div className="space-y-4">
      <VisibilityToggle value={data.visible} onChange={(v) => set('visible', v)} testId="contact-visible-toggle" />
      <EditorCard title="聯絡資訊">
        <div className="grid md:grid-cols-2 gap-4">
          <TextField label="Email" value={data.email} onChange={(v) => set('email', v)} testId="contact-email" />
          <TextField label="電話號碼" value={data.phone} onChange={(v) => set('phone', v)} testId="contact-phone" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <TextField label="LINE 連結" value={data.lineUrl} onChange={(v) => set('lineUrl', v)} testId="contact-line" />
          <TextField label="地點" value={data.location} onChange={(v) => set('location', v)} testId="contact-location" />
        </div>
      </EditorCard>
      <EditorCard title="履歷下載按鈕">
        <TextField label="按鈕文字" value={resume.text} onChange={(v) => setResume('text', v)} testId="contact-resume-text" />
        <LinkField label="履歷連結 (PDF 或雲端連結，留空則不顯示按鈕)" value={resume.url} onChange={(v) => setResume('url', v)} testId="contact-resume-url" />
      </EditorCard>
      <EditorCard title="Open to (合作方向)">
        {data.openTo?.map((item, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <TextField label={`方向 ${i + 1}`} value={item} onChange={(v) => setOpen(i, v)} testId={`contact-open-${i}`} />
            </div>
            <Button variant="destructive" size="icon" onClick={() => removeOpen(i)} data-testid={`contact-open-${i}-remove`}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addOpen} data-testid="contact-add-open" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30">
          <Plus className="w-4 h-4 mr-1" /> 新增方向
        </Button>
      </EditorCard>
    </div>
  );
};
