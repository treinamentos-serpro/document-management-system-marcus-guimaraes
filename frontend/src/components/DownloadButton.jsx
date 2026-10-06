import { useState } from 'react';
import { downloadDocument } from '../services/documents.js';

export default function DownloadButton({ document, userId, onError }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    onError('');
    try {
      await downloadDocument(userId, document);
    } catch (error) {
      onError(error.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      className="download-button"
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      aria-busy={downloading}
      aria-label={`${downloading ? 'Baixando' : 'Baixar'} ${document.originalName}`}
      title={downloading ? 'Baixando documento...' : 'Baixar documento'}
    >
      <span aria-hidden="true">↓</span>
    </button>
  );
}