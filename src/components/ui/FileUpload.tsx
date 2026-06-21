import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UPLOAD_LIMITS } from '@/lib/constants';
import { Button } from './Button';
import { Spinner } from './Spinner';

interface FileUploadProps {
  label: string;
  accept?: string;
  /** Performs the upload; should resolve when done. */
  onUpload: (file: File, onProgress: (p: number) => void) => Promise<unknown>;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

/**
 * Client-side file picker with type/size validation + progress (HLD §10).
 * Surfaces server errors inline.
 */
export function FileUpload({ label, accept, onUpload, onSuccess, onError }: FileUploadProps) {
  const { t } = useTranslation(['candidate', 'validation']);
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string>();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(undefined);

    if (file.size > UPLOAD_LIMITS.maxSizeBytes) {
      const msg = t('fileTooLarge', { ns: 'validation', size: 5 });
      setError(msg);
      onError?.(msg);
      return;
    }

    setProgress(0);
    try {
      await onUpload(file, setProgress);
      onSuccess?.();
    } catch (err) {
      const msg = (err as { message?: string }).message ?? t('fileType', { ns: 'validation' });
      setError(msg);
      onError?.(msg);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const uploading = progress !== null;

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? UPLOAD_LIMITS.acceptDocs}
        className="sr-only"
        onChange={handleChange}
        aria-label={label}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Spinner className="h-4 w-4" />
            {t('documents.uploading', { percent: progress })}
          </>
        ) : (
          label
        )}
      </Button>
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
