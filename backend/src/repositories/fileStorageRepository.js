const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const storageDirectory = path.resolve(
  process.env.STORAGE_DIR || path.join(__dirname, '../../storage'),
);

function createDiskStorage() {
  return multer.diskStorage({
    destination(req, file, callback) {
      fs.mkdir(storageDirectory, { recursive: true }, (error) => {
        callback(error, storageDirectory);
      });
    },
    filename(req, file, callback) {
      callback(null, randomUUID());
    },
  });
}

function getPath(storageName) {
  if (path.basename(storageName) !== storageName) {
    return null;
  }

  return path.join(storageDirectory, storageName);
}

function exists(storageName) {
  const filePath = getPath(storageName);
  return Boolean(filePath && fs.existsSync(filePath));
}

module.exports = { createDiskStorage, exists, getPath };