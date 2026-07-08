import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Save, LogOut, ExternalLink, Loader2, LayoutDashboard,
  Plus, Trash2, Star, Copy, Download, Upload, RotateCcw, Link2, Check, X, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  listProfiles, adminGetProfile, createProfile, updateProfileContent,
  updateProfileMeta, deleteProfile, resetProfile, formatApiErrorDetail,
} from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  HeroEditor, CoreThesisEditor, CareerEvolutionEditor, ProjectsEditor,
  CapabilitiesEditor, NowNextEditor, ContactEditor,
} from '../components/admin/SectionEditors';

const TABS = [
  { key: 'hero', label: '主視覺' },
  { key: 'coreThesis', label: '核心主張' },
  { key: 'careerEvolution', label: '職涯地圖' },
  { key: 'projects', label: '精選專案' },
  { key: 'capabilities', label: '能力系統' },
  { key: 'nowNext', label: '現在與下一步' },
  { key: 'contact', label: '聯絡區' },
];

const AdminDashboard = () => {
  const { user, checking, logout } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [activeSlug, setActiveSlug] = useState(null);
  const [activeMeta, setActiveMeta] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [dirty, setDirty] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameSlug, setRenameSlug] = useState('');
  const [renameName, setRenameName] = useState('');
  const importRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Load profiles list + default profile content
  useEffect(() => {
    if (checking || !user) return;
    (async () => {
      try {
        const list = await listProfiles();
        setProfiles(list);
        const def = list.find((p) => p.is_default) || list[0];
        if (def) {
          await loadProfile(def.slug, list);
        }
      } catch (err) {
        toast.error('無法載入設定檔');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, user]);

  const loadProfile = async (slug, list = profiles) => {
    try {
      const prof = await adminGetProfile(slug);
      setContent(prof.content);
      setActiveSlug(prof.slug);
      setActiveMeta({ slug: prof.slug, name: prof.name, is_default: prof.is_default });
      setDirty(false);
    } catch (err) {
      toast.error('無法載入此設定檔內容');
    }
  };

  if (!checking && !user) return <Navigate to="/admin/login" replace />;

  const updateSection = (key, val) => {
    setContent((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const refreshProfiles = async () => {
    const list = await listProfiles();
    setProfiles(list);
    return list;
  };

  const handleSave = async () => {
    if (!activeSlug) return;
    setSaving(true);
    try {
      await updateProfileContent(activeSlug, content);
      toast.success('內容已成功儲存！');
      setDirty(false);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchProfile = async (slug) => {
    if (slug === activeSlug) return;
    if (dirty && !window.confirm('有未儲存的變更，切換設定檔將遺失。確定切換嗎？')) return;
    await loadProfile(slug);
  };

  const handleCreateProfile = async () => {
    const name = window.prompt('新設定檔名稱 (例如：English Version)');
    if (!name) return;
    try {
      const created = await createProfile({ name, source_slug: activeSlug });
      toast.success(`已建立設定檔「${name}」`);
      await refreshProfiles();
      await loadProfile(created.slug);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '建立失敗');
    }
  };

  const handleDeleteProfile = async () => {
    if (!activeSlug) return;
    if (!window.confirm(`確定刪除設定檔「${activeMeta?.name}」？此動作無法復原。`)) return;
    try {
      await deleteProfile(activeSlug);
      toast.success('設定檔已刪除');
      const list = await refreshProfiles();
      const def = list.find((p) => p.is_default) || list[0];
      if (def) await loadProfile(def.slug, list);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '刪除失敗');
    }
  };

  const handleSetDefault = async () => {
    if (!activeSlug || activeMeta?.is_default) return;
    try {
      await updateProfileMeta(activeSlug, { is_default: true });
      toast.success('已設為預設 (首頁) 設定檔');
      await refreshProfiles();
      setActiveMeta((m) => ({ ...m, is_default: true }));
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '設定失敗');
    }
  };

  const startRename = () => {
    setRenameName(activeMeta?.name || '');
    setRenameSlug(activeMeta?.slug || '');
    setRenaming(true);
  };

  const handleRename = async () => {
    try {
      const res = await updateProfileMeta(activeSlug, { name: renameName, slug: renameSlug });
      toast.success('設定檔已更新');
      setRenaming(false);
      const list = await refreshProfiles();
      await loadProfile(res.slug || activeSlug, list);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '更新失敗');
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSlug || 'content'}-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已下載 JSON 備份');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.hero || !parsed.careerEvolution) {
          throw new Error('JSON 格式不正確');
        }
        setContent(parsed);
        setDirty(true);
        toast.success('JSON 已載入，請記得按儲存以套用');
      } catch (err) {
        toast.error('無法解析 JSON 檔案：' + err.message);
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const handleReset = async () => {
    if (!activeSlug) return;
    if (!window.confirm('確定將此設定檔重置為預設示範內容？目前內容將被覆蓋。')) return;
    try {
      const res = await resetProfile(activeSlug);
      setContent(res.content);
      setDirty(false);
      toast.success('已重置為示範內容');
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '重置失敗');
    }
  };

  const publicPath = activeMeta?.is_default ? '/' : `/p/${activeSlug}`;
  const publicUrl = `${backendUrl}${publicPath}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('已複製對外網址');
  };

  if (checking || loading || !content) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const renderEditor = () => {
    const props = { data: content[activeTab], update: (val) => updateSection(activeTab, val) };
    switch (activeTab) {
      case 'hero': return <HeroEditor {...props} />;
      case 'coreThesis': return <CoreThesisEditor {...props} />;
      case 'careerEvolution': return <CareerEvolutionEditor {...props} />;
      case 'projects': return <ProjectsEditor {...props} />;
      case 'capabilities': return <CapabilitiesEditor {...props} />;
      case 'nowNext': return <NowNextEditor {...props} />;
      case 'contact': return <ContactEditor {...props} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950" data-testid="admin-dashboard">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg truncate">內容管理後台</h1>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => window.open(publicPath, '_blank')}
              data-testid="view-site-button"
              className="border-blue-500/30 text-cyan-300 hover:bg-blue-500/10 hidden sm:flex"
            >
              <ExternalLink className="w-4 h-4 mr-1" /> 預覽
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              data-testid="save-button"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              儲存{dirty ? ' *' : ''}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/admin/login'); }} data-testid="logout-button" className="text-slate-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile & Tools Bar */}
      <div className="bg-slate-900/50 border-b border-blue-500/10">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
          {/* 設定檔選擇 */}
          <div className="flex flex-wrap items-center gap-2" data-testid="profile-selector">
            <span className="text-xs text-slate-400 mr-1">設定檔版本：</span>
            {profiles.map((p) => (
              <button
                key={p.slug}
                onClick={() => handleSwitchProfile(p.slug)}
                data-testid={`profile-tab-${p.slug}`}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 ${
                  p.slug === activeSlug
                    ? 'bg-gradient-to-r from-blue-600/40 to-cyan-600/40 text-white border border-cyan-400/40'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {p.is_default && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                {p.name}
              </button>
            ))}
            <button
              onClick={handleCreateProfile}
              data-testid="create-profile-button"
              className="px-3 py-1.5 rounded-lg text-sm bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> 新增版本
            </button>
          </div>

          {/* 目前設定檔操作 */}
          {renaming ? (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-blue-500/20">
              <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} placeholder="設定檔名稱" data-testid="rename-name-input"
                className="w-48 bg-slate-900/50 border-blue-500/30 text-white text-sm h-9" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">網址代稱:</span>
                <Input value={renameSlug} onChange={(e) => setRenameSlug(e.target.value)} placeholder="slug" data-testid="rename-slug-input"
                  className="w-40 bg-slate-900/50 border-blue-500/30 text-white text-sm h-9" />
              </div>
              <Button size="sm" onClick={handleRename} data-testid="rename-save" className="bg-cyan-600 hover:bg-cyan-500 h-9">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRenaming(false)} data-testid="rename-cancel" className="text-slate-400 h-9">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {/* 對外網址 */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-blue-500/20">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-slate-300 font-mono truncate max-w-[220px]" data-testid="profile-public-url">{publicUrl}</span>
                <button onClick={copyUrl} data-testid="copy-url-button" className="text-slate-400 hover:text-cyan-300"><Copy className="w-3.5 h-3.5" /></button>
              </div>
              <Button size="sm" variant="outline" onClick={startRename} data-testid="rename-profile-button" className="border-blue-500/30 text-slate-300 hover:bg-blue-500/10 h-8">
                <Pencil className="w-3.5 h-3.5 mr-1" /> 重新命名
              </Button>
              {!activeMeta?.is_default && (
                <Button size="sm" variant="outline" onClick={handleSetDefault} data-testid="set-default-button" className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 h-8">
                  <Star className="w-3.5 h-3.5 mr-1" /> 設為首頁
                </Button>
              )}
              {profiles.length > 1 && (
                <Button size="sm" variant="outline" onClick={handleDeleteProfile} data-testid="delete-profile-button" className="border-red-500/30 text-red-300 hover:bg-red-500/10 h-8">
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> 刪除
                </Button>
              )}
              <div className="w-px h-6 bg-blue-500/20 mx-1" />
              {/* Import / Export / Reset */}
              <input ref={importRef} type="file" accept="application/json" onChange={handleImport} className="hidden" data-testid="import-json-input" />
              <Button size="sm" variant="outline" onClick={() => importRef.current?.click()} data-testid="import-button" className="border-blue-500/30 text-slate-300 hover:bg-blue-500/10 h-8">
                <Upload className="w-3.5 h-3.5 mr-1" /> Import JSON
              </Button>
              <Button size="sm" variant="outline" onClick={handleExport} data-testid="export-button" className="border-blue-500/30 text-slate-300 hover:bg-blue-500/10 h-8">
                <Download className="w-3.5 h-3.5 mr-1" /> Export / 備份
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} data-testid="reset-button" className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 h-8">
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> 重置示範
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 lg:sticky lg:top-24" data-testid="admin-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                data-testid={`tab-${tab.key}`}
                className={`px-4 py-3 rounded-xl text-left whitespace-nowrap transition-all duration-300 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor Content */}
        <main className="flex-1 min-w-0" data-testid="editor-content">
          {renderEditor()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
