const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');
const fileStorageRepository = require('../repositories/fileStorageRepository');

function createDocument(owner, file) {
  return documentRepository.create({
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    mimeType: file.mimetype,
    storageName: file.filename,
  });
}

function listDocuments(owner) {
  return documentRepository.findAllByOwner(owner);
}

function findDocumentForDownload(id, owner) {
  const document = documentRepository.findById(id);
  if (!document || document.owner !== owner || !fileStorageRepository.exists(document.storageName)) {
    return null;
  }

  return {
    document,
    filePath: fileStorageRepository.getPath(document.storageName),
  };
}

module.exports = { createDocument, findDocumentForDownload, listDocuments };