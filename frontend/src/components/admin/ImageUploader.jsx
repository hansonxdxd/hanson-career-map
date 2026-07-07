import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, formatApiErrorDetail } from '../../lib/api';
import { toast } from 'sonner';

const ImageUploader = ({ value, onChange, testId }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      onChange(res.url);
      toast.success('圖片上傳成功');
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || '上傳失敗');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

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
        <div className="relative group">
          <img src={value} alt="preview" className="w-full h-40 object-cover rounded-xl border border-blue-500/30" />
          <button
            type="button"
            onClick={() => onChange(null)}
            data-testid={`${testId}-remove`}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          data-testid={`${testId}-button`}
          className="w-full h-40 rounded-xl border-2 border-dashed border-blue-500/30 hover:border-cyan-400/50 bg-slate-900/30 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-cyan-400 transition-all duration-300"
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

export default ImageUploader;
