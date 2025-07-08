const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { runCode } = require('../controllers/runController');

// authenticated optional; allow guest run
router.post('/', runCode);

module.exports = router;
