import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Move, Loader2 } from 'lucide-react';
import { uploadImage, formatApiErrorDetail } from '../../lib/api';
import { toast } from 'sonner';

/**
 * Public display: fixed frame, image cropped via object-position (focal point).
 */
export const ImageFrame = ({ src, alt, position, className = '' }) => {
  const pos = position || { x: 50, y: 50 };
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt || ''}
        className="w-full h-full object-cover"
        style={{ objectPosition: `${pos.x}% ${pos.y}%` }}
      />
    </div>
  );
};

/**
 * Admin editor: upload + Canva-style drag to reposition focal point + alt text.
 */
export const ImageFramePicker = ({ value, alt, position, onChange, testId, aspect = 'aspect-video' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const frameRef = useRef(null);
  const pos = position || { x: 50, y: 50 };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      onChange({ image: res.url, imageAlt: alt || '', imagePosition: { x: 50, y: 50 } });
      toast.success('圖片上傳成功，可拖曳調整裁切位置');
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '上傳失敗');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const updatePosFromEvent = useCallback((clientX, clientY) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    onChange({ image: value, imageAlt: alt, imagePosition: { x: Math.round(x), y: Math.round(y) } });
  }, [value, alt, onChange]);

  const onPointerDown = (e) => {
    if (!value) return;
    setDragging(true);
    updatePosFromEvent(e.clientX, e.clientY);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    updatePosFromEvent(e.clientX, e.clientY);
  };
  const onPointerUp = () => setDragging(false);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        data-testid={`${testId}-input`}
      />
      {value ? (
        <>
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            data-testid={`${testId}-frame`}
            className={`relative ${aspect} w-full rounded-xl overflow-hidden border border-blue-500/30 cursor-move select-none touch-none`}
          >
            <img
              src={value}
              alt={alt || ''}
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: `${pos.x}% ${pos.y}%` }}
            />
            {/* 拖曳提示 */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${dragging ? 'opacity-0' : 'opacity-100'}`}>
              <div className="bg-slate-900/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-white text-xs pointer-events-none">
                <Move className="w-3.5 h-3.5" /> 拖曳調整裁切中心
              </div>
            </div>
            {/* 焦點標記 */}
            <div
              className="absolute w-6 h-6 rounded-full border-2 border-cyan-400 bg-cyan-400/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              data-testid={`${testId}-replace`}
              className="flex-1 text-xs py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-cyan-300 border border-blue-500/20 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 inline mr-1" /> 更換圖片
            </button>
            <button
              type="button"
              onClick={() => onChange({ image: null, imageAlt: '', imagePosition: { x: 50, y: 50 } })}
              data-testid={`${testId}-remove`}
              className="px-4 text-xs py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/20 transition-colors"
            >
              <X className="w-3.5 h-3.5 inline mr-1" /> 移除
            </button>
          </div>
          <input
            value={alt || ''}
            onChange={(e) => onChange({ image: value, imageAlt: e.target.value, imagePosition: pos })}
            placeholder="圖片替代文字 (alt text，供 SEO 與無障礙)"
            data-testid={`${testId}-alt`}
            className="w-full text-sm px-3 py-2 rounded-lg bg-slate-900/50 border border-blue-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          data-testid={`${testId}-button`}
          className={`w-full ${aspect} rounded-xl border-2 border-dashed border-blue-500/30 hover:border-cyan-400/50 bg-slate-900/30 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-cyan-400 transition-all duration-300`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">上傳中...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8" />
              <span className="text-sm">點擊上傳圖片</span>
              <span className="text-xs text-slate-500">JPEG, PNG, WebP (最大 5MB)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageFramePicker;
