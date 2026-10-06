import { useId, useRef, useState } from 'react';
import { formatBytes } from './documentFormatting.js';

export default function UploadComponent({ onUpload, uploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const formRef = useRef(null);
  const fileInputId = useId();
  const headingId = useId();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || uploading) return;

    if (await onUpload(selectedFile)) {
      setSelectedFile(null);
      formRef.current?.reset();
    }
  }

  return (
    <section className="upload-section" aria-labelledby={headingId}>
      <div className="section-title">
        <span className="section-index">01</span>
        <h2 id={headingId}>Adicionar documento</h2>
      </div>
      <form className="upload-form" ref={formRef} onSubmit={handleSubmit} aria-busy={uploading}>
        <label className="file-picker" htmlFor={fileInputId}>
          <span className="upload-mark" aria-hidden="true">+</span>
          <span className="file-picker-copy">
            <strong>{selectedFile ? selectedFile.name : 'Escolha um arquivo'}</strong>
            <span>{selectedFile ? formatBytes(selectedFile.size) : 'Documento para envio'}</span>
          </span>
          <span className="browse-label">Procurar</span>
          <input
            id={fileInputId}
            type="file"
            disabled={uploading}
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
        </label>
        <button className="upload-button" type="submit" disabled={uploading || !selectedFile}>
          {uploading ? 'Enviando...' : 'Enviar arquivo'}
          <span aria-hidden="true">↗</span>
        </button>
      </form>
    </section>
  );
}