const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');
const fileStorageRepository = require('../repositories/fileStorageRepository');

const router = express.Router();
const configuredLimit = Number(process.env.MAX_FILE_SIZE_BYTES);
const maxFileSize = Number.isFinite(configuredLimit) && configuredLimit > 0
  ? configuredLimit
  : 10 * 1024 * 1024;

const upload = multer({
  storage: fileStorageRepository.createDiskStorage(),
  limits: { fileSize: maxFileSize, files: 1 },
});

router.post('/upload', documentController.validateOwner, upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;