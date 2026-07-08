import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { ICON_KEYS, getIcon } from '../../lib/icons';
import { uploadImage, formatApiErrorDetail } from '../../lib/api';
import { toast } from 'sonner';

const IconPicker = ({ iconType, icon, onChange, testId }) => {
  const [uploading, setUploading] = useState(false);
  const CurrentIcon = getIcon(icon);
  const isCustom = iconType === 'custom' && icon;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      onChange({ iconType: 'custom', icon: res.url });
      toast.success('自訂 Icon 已上傳');
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '上傳失敗');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {isCustom ? (
            <img src={icon} alt="icon" className="w-7 h-7 object-contain" />
          ) : (
            <CurrentIcon className="w-7 h-7 text-cyan-400" />
          )}
        </div>
        <label className="text-xs px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-cyan-300 border border-blue-500/20 transition-colors cursor-pointer">
          <Upload className="w-3.5 h-3.5 inline mr-1" />
          {uploading ? '上傳中...' : '上傳自訂 Icon'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" data-testid={`${testId}-upload`} />
        </label>
      </div>
      {/* 內建圖示庫 */}
      <div className="grid grid-cols-8 gap-2 p-3 rounded-xl bg-slate-900/40 border border-blue-500/20 max-h-40 overflow-y-auto" data-testid={`${testId}-grid`}>
        {ICON_KEYS.map((key) => {
          const Ic = getIcon(key);
          const selected = iconType !== 'custom' && icon === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ iconType: 'builtin', icon: key })}
              data-testid={`${testId}-${key}`}
              className={`relative aspect-square rounded-lg flex items-center justify-center transition-all duration-200 ${
                selected
                  ? 'bg-cyan-500/30 border border-cyan-400/60'
                  : 'bg-slate-800/40 hover:bg-slate-700/60 border border-transparent'
              }`}
            >
              <Ic className="w-4 h-4 text-cyan-300" />
              {selected && (
                <Check className="w-3 h-3 text-cyan-400 absolute top-0.5 right-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconPicker;
