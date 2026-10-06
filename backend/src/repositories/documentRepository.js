const documents = new Map();

function create(document) {
  documents.set(document.id, document);
  return document;
}

function findAllByOwner(owner) {
  return [...documents.values()].filter((document) => document.owner === owner);
}

function findById(id) {
  return documents.get(id) || null;
}

module.exports = { create, findAllByOwner, findById };