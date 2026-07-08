import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// Text input field
export const TextField = ({ label, value, onChange, placeholder, testId }) => (
  <div className="space-y-2">
    <Label className="text-slate-300">{label}</Label>
    <Input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid={testId}
      className="bg-slate-900/50 border-blue-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400"
    />
  </div>
);

// Textarea field
export const TextAreaField = ({ label, value, onChange, placeholder, rows = 3, testId }) => (
  <div className="space-y-2">
    <Label className="text-slate-300">{label}</Label>
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      data-testid={testId}
      className="bg-slate-900/50 border-blue-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400 resize-y"
    />
  </div>
);

// Link field with icon hint
export const LinkField = ({ label, value, onChange, testId }) => (
  <div className="space-y-2">
    <Label className="text-cyan-400 flex items-center gap-2">
      🔗 {label}
    </Label>
    <Input
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      placeholder="https://... (留空則不顯示按鈕)"
      data-testid={testId}
      className="bg-slate-900/50 border-cyan-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400"
    />
  </div>
);

// Tags editor (comma separated)
export const TagsField = ({ label, value, onChange, testId }) => (
  <div className="space-y-2">
    <Label className="text-slate-300">{label}</Label>
    <Input
      value={Array.isArray(value) ? value.join(', ') : ''}
      onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
      placeholder="標籤1, 標籤2, 標籤3"
      data-testid={testId}
      className="bg-slate-900/50 border-blue-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400"
    />
    <p className="text-xs text-slate-500">以逗號分隔多個標籤</p>
  </div>
);

// Card container for editor sections
export const EditorCard = ({ title, children, badge }) => (
  <div className="p-6 rounded-2xl bg-slate-800/40 border border-blue-500/20 space-y-4">
    {title && (
      <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {badge && <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">{badge}</span>}
      </div>
    )}
    {children}
  </div>
);

// Visibility toggle switch
export const VisibilityToggle = ({ label = '在此設定檔顯示此區塊', value, onChange, testId }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-blue-500/20">
    <span className="text-sm text-slate-300">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={value !== false}
      onClick={() => onChange(value === false)}
      data-testid={testId}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        value !== false ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
          value !== false ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);
