import { useId } from 'react';
import DownloadButton from './DownloadButton.jsx';
import { formatBytes } from './documentFormatting.js';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });

export default function DocumentList({ documents, userId, loading, onRefresh, onError }) {
  const headingId = useId();
  const totalBytes = documents.reduce((total, document) => total + document.size, 0);

  return (
    <section className="documents-section" aria-labelledby={headingId} aria-busy={loading}>
      <div className="documents-heading-row">
        <div className="section-title">
          <span className="section-index">02</span>
          <h2 id={headingId}>Biblioteca</h2>
          <span className="document-count">{documents.length.toString().padStart(2, '0')}</span>
        </div>
        <button className="refresh-button" type="button" onClick={onRefresh} disabled={loading} aria-label="Atualizar lista" title="Atualizar lista">
          ↻
        </button>
      </div>
      <div className="table-head" aria-hidden="true">
        <span>Nome</span>
        <span>Data de envio</span>
        <span>Tamanho</span>
        <span></span>
      </div>
      {loading ? (
        <p className="empty-state" role="status">Carregando documentos...</p>
      ) : documents.length === 0 ? (
        <p className="empty-state">Sua biblioteca está vazia.</p>
      ) : (
        <ul className="document-list">
          {documents.map((document) => (
            <li className="document-row" key={document.id}>
              <span className="document-name">
                <span className="file-icon" aria-hidden="true">↳</span>
                <span title={document.originalName}>{document.originalName}</span>
              </span>
              <time dateTime={document.uploadedAt}>{dateFormatter.format(new Date(document.uploadedAt))}</time>
              <span>{formatBytes(document.size)}</span>
              <DownloadButton document={document} userId={userId} onError={onError} />
            </li>
          ))}
        </ul>
      )}
      <footer className="library-footer">
        <span>{documents.length} {documents.length === 1 ? 'documento' : 'documentos'}</span>
        <span>{formatBytes(totalBytes)} no total</span>
      </footer>
    </section>
  );
}