const documentService = require('../services/documentService');

function getOwner(req, res) {
  const owner = req.get('X-User-Id')?.trim();
  if (!owner || owner.length > 128) {
    res.status(400).json({
      error: { code: 'INVALID_USER', message: 'Informe um identificador de usuário válido.' },
    });
    return null;
  }

  return owner;
}

function validateOwner(req, res, next) {
  if (getOwner(req, res)) next();
}

function toPublicDocument(document) {
  const { id, originalName, size, uploadedAt, owner, mimeType } = document;
  return { id, originalName, size, uploadedAt, owner, mimeType };
}

function upload(req, res) {
  const owner = getOwner(req, res);
  if (!owner) return;

  if (!req.file) {
    res.status(400).json({
      error: { code: 'FILE_REQUIRED', message: 'Envie um arquivo no campo "file".' },
    });
    return;
  }

  const document = documentService.createDocument(owner, req.file);
  res.status(201).json({ document: toPublicDocument(document) });
}

function list(req, res) {
  const owner = getOwner(req, res);
  if (!owner) return;

  const documents = documentService.listDocuments(owner).map(toPublicDocument);
  res.status(200).json({ documents });
}

function download(req, res, next) {
  const owner = getOwner(req, res);
  if (!owner) return;

  const result = documentService.findDocumentForDownload(req.params.id, owner);
  if (!result) {
    res.status(404).json({
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
    });
    return;
  }

  res.download(result.filePath, result.document.originalName, (error) => {
    if (error && !res.headersSent) next(error);
  });
}

module.exports = { download, list, upload, validateOwner };