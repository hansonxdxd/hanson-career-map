import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { TextField, TextAreaField, LinkField, TagsField, EditorCard } from './EditorFields';
import ImageUploader from './ImageUploader';

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
  const setItem = (i, key, val) => {
    const items = [...data.items];
    items[i] = { ...items[i], [key]: val };
    update({ ...data, items });
  };
  return (
    <div className="space-y-4">
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="thesis-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="thesis-subtitle" />
        <LinkField label="區塊按鈕連結 (探索完整方法論)" value={data.learnMoreUrl} onChange={(v) => set('learnMoreUrl', v)} testId="thesis-learnmore-url" />
      </EditorCard>
      {data.items?.map((item, i) => (
        <EditorCard key={item.id} title={`核心能力 ${i + 1}`} badge={item.title}>
          <TextField label="標題" value={item.title} onChange={(v) => setItem(i, 'title', v)} testId={`thesis-item-${i}-title`} />
          <TextAreaField label="描述" value={item.description} onChange={(v) => setItem(i, 'description', v)} rows={2} testId={`thesis-item-${i}-desc`} />
          <LinkField label="卡片連結 (了解更多)" value={item.detailUrl} onChange={(v) => setItem(i, 'detailUrl', v)} testId={`thesis-item-${i}-url`} />
        </EditorCard>
      ))}
    </div>
  );
};

// ---------------- Career Evolution Editor ----------------
export const CareerEvolutionEditor = ({ data, update }) => {
  const set = (key, val) => update({ ...data, [key]: val });
  const setStage = (i, key, val) => {
    const stages = [...data.stages];
    stages[i] = { ...stages[i], [key]: val };
    update({ ...data, stages });
  };
  const addStage = () => {
    const newId = Math.max(0, ...data.stages.map((s) => s.id || 0)) + 1;
    update({
      ...data,
      stages: [...data.stages, {
        id: newId, period: '', title: '新階段', titleEn: '', summary: '',
        situation: '', actions: '', outcome: '', coreAbility: '', tags: [], detailUrl: null,
      }],
    });
  };
  const removeStage = (i) => {
    update({ ...data, stages: data.stages.filter((_, idx) => idx !== i) });
  };
  return (
    <div className="space-y-4">
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="evolution-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="evolution-subtitle" />
      </EditorCard>
      {data.stages?.map((stage, i) => (
        <EditorCard key={stage.id} title={`階段 ${i + 1}`} badge={stage.period}>
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="時間" value={stage.period} onChange={(v) => setStage(i, 'period', v)} testId={`evolution-stage-${i}-period`} />
            <TextField label="階段名稱" value={stage.title} onChange={(v) => setStage(i, 'title', v)} testId={`evolution-stage-${i}-title`} />
          </div>
          <TextField label="英文名稱" value={stage.titleEn} onChange={(v) => setStage(i, 'titleEn', v)} testId={`evolution-stage-${i}-titleen`} />
          <TextAreaField label="摘要" value={stage.summary} onChange={(v) => setStage(i, 'summary', v)} rows={2} testId={`evolution-stage-${i}-summary`} />
          <TextAreaField label="Situation (遇到的問題)" value={stage.situation} onChange={(v) => setStage(i, 'situation', v)} rows={2} testId={`evolution-stage-${i}-situation`} />
          <TextAreaField label="Actions (我的做法)" value={stage.actions} onChange={(v) => setStage(i, 'actions', v)} rows={2} testId={`evolution-stage-${i}-actions`} />
          <TextAreaField label="Outcome (具體成果)" value={stage.outcome} onChange={(v) => setStage(i, 'outcome', v)} rows={2} testId={`evolution-stage-${i}-outcome`} />
          <TextAreaField label="Core Ability (底層能力)" value={stage.coreAbility} onChange={(v) => setStage(i, 'coreAbility', v)} rows={2} testId={`evolution-stage-${i}-ability`} />
          <TagsField label="能力標籤" value={stage.tags} onChange={(v) => setStage(i, 'tags', v)} testId={`evolution-stage-${i}-tags`} />
          <LinkField label="階段連結 (了解更多)" value={stage.detailUrl} onChange={(v) => setStage(i, 'detailUrl', v)} testId={`evolution-stage-${i}-url`} />
          <Button variant="destructive" size="sm" onClick={() => removeStage(i)} data-testid={`evolution-stage-${i}-remove`} className="mt-2">
            <Trash2 className="w-4 h-4 mr-1" /> 刪除此階段
          </Button>
        </EditorCard>
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
  const setItem = (i, key, val) => {
    const items = [...data.items];
    items[i] = { ...items[i], [key]: val };
    update({ ...data, items });
  };
  const addItem = () => {
    const newId = Math.max(0, ...data.items.map((s) => s.id || 0)) + 1;
    update({ ...data, items: [...data.items, { id: newId, title: '新專案', description: '', skills: [], image: null, link: null }] });
  };
  const removeItem = (i) => update({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="projects-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="projects-subtitle" />
        <LinkField label="區塊按鈕連結 (查看所有專案)" value={data.viewAllUrl} onChange={(v) => set('viewAllUrl', v)} testId="projects-viewall-url" />
      </EditorCard>
      {data.items?.map((item, i) => (
        <EditorCard key={item.id} title={`專案 ${i + 1}`} badge={item.title}>
          <TextField label="專案名稱" value={item.title} onChange={(v) => setItem(i, 'title', v)} testId={`projects-item-${i}-title`} />
          <TextAreaField label="描述" value={item.description} onChange={(v) => setItem(i, 'description', v)} rows={2} testId={`projects-item-${i}-desc`} />
          <TagsField label="技能標籤" value={item.skills} onChange={(v) => setItem(i, 'skills', v)} testId={`projects-item-${i}-skills`} />
          <div>
            <p className="text-slate-300 text-sm mb-2">專案圖片</p>
            <ImageUploader value={item.image} onChange={(v) => setItem(i, 'image', v)} testId={`projects-item-${i}-image`} />
          </div>
          <LinkField label="專案連結 (查看專案)" value={item.link} onChange={(v) => setItem(i, 'link', v)} testId={`projects-item-${i}-link`} />
          <Button variant="destructive" size="sm" onClick={() => removeItem(i)} data-testid={`projects-item-${i}-remove`} className="mt-2">
            <Trash2 className="w-4 h-4 mr-1" /> 刪除此專案
          </Button>
        </EditorCard>
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
  const addCat = () => {
    const newId = Math.max(0, ...data.categories.map((s) => s.id || 0)) + 1;
    update({ ...data, categories: [...data.categories, { id: newId, name: '新分類', skills: [] }] });
  };
  const removeCat = (i) => update({ ...data, categories: data.categories.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <EditorCard title="區塊標題">
        <TextField label="標題" value={data.title} onChange={(v) => set('title', v)} testId="capabilities-title" />
        <TextField label="副標題" value={data.subtitle} onChange={(v) => set('subtitle', v)} testId="capabilities-subtitle" />
        <LinkField label="區塊按鈕連結 (查看完整技能樹)" value={data.viewDetailUrl} onChange={(v) => set('viewDetailUrl', v)} testId="capabilities-viewdetail-url" />
      </EditorCard>
      {data.categories?.map((cat, i) => (
        <EditorCard key={cat.id} title={`分類 ${i + 1}`} badge={cat.name}>
          <TextField label="分類名稱" value={cat.name} onChange={(v) => setCat(i, 'name', v)} testId={`capabilities-cat-${i}-name`} />
          <TagsField label="技能" value={cat.skills} onChange={(v) => setCat(i, 'skills', v)} testId={`capabilities-cat-${i}-skills`} />
          <Button variant="destructive" size="sm" onClick={() => removeCat(i)} data-testid={`capabilities-cat-${i}-remove`} className="mt-2">
            <Trash2 className="w-4 h-4 mr-1" /> 刪除此分類
          </Button>
        </EditorCard>
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
  const setOpen = (i, val) => {
    const openTo = [...data.openTo];
    openTo[i] = val;
    update({ ...data, openTo });
  };
  const addOpen = () => update({ ...data, openTo: [...data.openTo, ''] });
  const removeOpen = (i) => update({ ...data, openTo: data.openTo.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <EditorCard title="聯絡資訊">
        <TextField label="Email" value={data.email} onChange={(v) => set('email', v)} testId="contact-email" />
        <TextField label="地點" value={data.location} onChange={(v) => set('location', v)} testId="contact-location" />
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
