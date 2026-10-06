import { useEffect, useState } from 'react';
import { listDocuments, uploadDocument } from './services/documents.js';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import './App.css';

export default function App() {
  const [userId, setUserId] = useState('demo-user');
  const [activeUserId, setActiveUserId] = useState('demo-user');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDocuments([]);
    setError('');

    listDocuments(activeUserId)
      .then((result) => {
        if (!cancelled) setDocuments(result);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeUserId, refreshVersion]);

  function refreshDocuments() {
    setRefreshVersion((version) => version + 1);
  }

  function handleUserSubmit(event) {
    event.preventDefault();
    if (uploading) return;
    const nextUserId = userId.trim();
    if (!nextUserId) {
      setError('Informe um identificador de usuário.');
      return;
    }
    setActiveUserId(nextUserId);
    setNotice('');
  }

  async function handleUpload(file) {
    setUploading(true);
    setError('');
    setNotice('');
    try {
      await uploadDocument(activeUserId, file);
      setNotice('Documento enviado.');
      refreshDocuments();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="wordmark" href="#inicio" aria-label="Arquivo, início">
          <span className="wordmark-icon" aria-hidden="true">A</span>
          <span>arquivo<span className="wordmark-period">.</span></span>
        </a>
        <form className="identity-form" onSubmit={handleUserSubmit}>
          <label htmlFor="user-id">Usuário</label>
          <input
            id="user-id"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            maxLength={128}
            disabled={uploading}
          />
          <button className="text-button" type="submit" disabled={uploading}>Abrir espaço</button>
        </form>
      </header>

      <section className="page-heading" id="inicio">
        <div>
          <p className="eyebrow">ESPAÇO DE DOCUMENTOS</p>
          <h1>Seus arquivos,<br /><em>em ordem.</em></h1>
        </div>
        <p className="heading-note">Um lugar simples para guardar e encontrar<br className="desktop-break" /> o que você precisa.</p>
      </section>

      <UploadComponent key={activeUserId} onUpload={handleUpload} uploading={uploading} />
      {error && <p className="feedback error" role="alert">{error}</p>}
      {notice && <p className="feedback success" role="status">{notice}</p>}
      <DocumentList
        documents={documents}
        userId={activeUserId}
        loading={loading}
        onRefresh={refreshDocuments}
        onError={setError}
      />

      <footer className="site-footer">
        <span>ARQUIVO / DOCUMENTOS</span>
        <span>Armazenamento local</span>
      </footer>
    </main>
  );
}

