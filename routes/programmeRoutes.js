const express = require('express');
const router = express.Router();
const programmeController = require('../controllers/programmeController');

router.get('/announce', programmeController.announceProgrammes);

module.exports = router;
