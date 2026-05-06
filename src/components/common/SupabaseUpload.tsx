import React, { useRef, useState } from 'react';
import { Upload, File, Image, FileText, Video, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadAutoDetect, uploadToSupabase, getBucketForFile, StorageBucket, UploadResult } from '../../services/supabase';

interface SupabaseUploadProps {
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  bucket?: StorageBucket;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

const BUCKET_ICONS: Record<StorageBucket, React.ReactNode> = {
  images: <Image className="w-5 h-5" />,
  pdfs:   <FileText className="w-5 h-5" />,
  videos: <Video className="w-5 h-5" />,
  texts:  <File className="w-5 h-5" />,
};

const DEFAULT_ACCEPT = 'image/*,application/pdf,video/*,text/plain,text/csv,text/html,application/json';

export default function SupabaseUpload({
  onUploadComplete,
  onUploadError,
  bucket,
  folder = '',
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 50,
  label = 'Upload File',
  className = '',
}: SupabaseUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const reset = () => {
    setResult(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (file: File) => {
    setError(null);
    setResult(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      const msg = `File is too large. Maximum size is ${maxSizeMB} MB.`;
      setError(msg);
      onUploadError?.(msg);
      return;
    }

    const targetBucket = bucket ?? getBucketForFile(file);
    if (!targetBucket) {
      const msg = `Unsupported file type: ${file.type}`;
      setError(msg);
      onUploadError?.(msg);
      return;
    }

    setUploading(true);
    setProgress(20);

    try {
      setProgress(50);
      const uploaded = bucket
        ? await uploadToSupabase(file, bucket, folder)
        : await uploadAutoDetect(file, folder);
      setProgress(100);
      setResult(uploaded);
      onUploadComplete?.(uploaded);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
      onUploadError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={`w-full ${className}`}>
      {!result && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`
            relative flex flex-col items-center justify-center gap-3
            border-2 border-dashed rounded-xl p-8 cursor-pointer
            transition-all duration-200 select-none
            ${dragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }
            ${uploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={onInputChange}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Uploading…</p>
              <div className="w-40 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Images, PDFs, Videos, Text files · Max {maxSizeMB} MB
                </p>
              </div>

              {bucket && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  {BUCKET_ICONS[bucket]}
                  {bucket}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {result && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Uploaded successfully</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{result.fileName}</p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
            >
              View file ↗
            </a>
          </div>
          <button
            onClick={reset}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
            title="Upload another file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 mt-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Upload failed</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={reset}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
