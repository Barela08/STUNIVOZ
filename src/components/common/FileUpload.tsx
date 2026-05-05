import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Image, Video, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadFile, UploadResult } from '../../services/uploadService';
import { useNavigate } from 'react-router-dom';

interface FileUploadProps {
  folder?: string;
  accept?: string;
  label?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  className?: string;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export const FileUpload: React.FC<FileUploadProps> = ({
  folder = 'stunivoz/uploads',
  accept = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,video/mp4,video/webm,video/quicktime,video/x-msvideo',
  label = 'Upload File',
  onSuccess,
  onError,
  className = '',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!user) { navigate('/login'); return; }

    setFileName(file.name);
    setFileType(file.type);
    setResult(null);
    setErrorMsg('');
    setState('uploading');
    setProgress(0);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    try {
      const uploadResult = await uploadFile(file, folder, (pct) => setProgress(pct));
      setResult(uploadResult);
      setState('success');
      onSuccess?.(uploadResult);
    } catch (err: any) {
      const msg = err?.message || 'Upload failed. Please try again.';
      setErrorMsg(msg);
      setState('error');
      onError?.(msg);
    }
  }, [user, folder, navigate, onSuccess, onError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const reset = () => {
    setState('idle');
    setProgress(0);
    setResult(null);
    setErrorMsg('');
    setPreview(null);
    setFileName('');
    setFileType('');
  };

  const isPdf = result?.resource_type === 'raw' || result?.format === 'pdf' || fileType === 'application/pdf';
  const isVideo = result?.resource_type === 'video' || fileType.startsWith('video/');
  const isImage = !isPdf && !isVideo;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      {state === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => { if (!user) { navigate('/login'); return; } inputRef.current?.click(); }}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
            ${dragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user ? 'Drag & drop or click to browse' : 'Please log in to upload files'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Images · PDF · Video (MP4, MOV, WebM) · Max 100 MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploading */}
      {state === 'uploading' && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Uploading to Cloudinary…</p>
            </div>
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success */}
      {state === 'success' && result && (
        <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-800 dark:text-green-300">Upload successful!</p>
              <p className="text-sm text-green-600 dark:text-green-400 truncate mt-0.5">{fileName}</p>
            </div>
            <button onClick={reset} className="text-green-400 hover:text-green-600 dark:hover:text-green-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          {isImage && preview && (
            <div className="rounded-xl overflow-hidden border border-green-200 dark:border-green-700">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-gray-900" />
            </div>
          )}
          {isPdf && (
            <div className="rounded-xl overflow-hidden border border-green-200 dark:border-green-700">
              <iframe src={result.secure_url} title="PDF Preview" className="w-full h-64" />
            </div>
          )}
          {isVideo && (
            <div className="rounded-xl overflow-hidden border border-green-200 dark:border-green-700">
              <video src={result.secure_url} controls className="w-full max-h-64 bg-black" />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={result.secure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {isPdf && <FileText className="w-4 h-4" />}
              {isVideo && <Video className="w-4 h-4" />}
              {isImage && <Image className="w-4 h-4" />}
              View File
            </a>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-300">Upload failed</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorMsg}</p>
            </div>
            <button onClick={reset} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={reset}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
