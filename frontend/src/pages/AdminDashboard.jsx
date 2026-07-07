import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Save, LogOut, ExternalLink, Loader2, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getContent, updateContent, formatApiErrorDetail } from '../lib/api';
import { Button } from '../components/ui/button';
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
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getContent()
      .then((data) => setContent(data))
      .catch(() => toast.error('無法載入內容'))
      .finally(() => setLoading(false));
  }, []);

  if (!checking && !user) return <Navigate to="/admin/login" replace />;

  const updateSection = (key, val) => {
    setContent((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent(content);
      toast.success('內容已成功儲存！');
      setDirty(false);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">內容管理後台</h1>
              <p className="text-slate-500 text-xs">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('/', '_blank')}
              data-testid="view-site-button"
              className="border-blue-500/30 text-cyan-300 hover:bg-blue-500/10 hidden sm:flex"
            >
              <ExternalLink className="w-4 h-4 mr-1" /> 預覽網站
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
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="logout-button" className="text-slate-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0" data-testid="admin-tabs">
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
