'use strict';
const router = require('express').Router();
router.use(
  [
    require('./middleware/synchronization'),
  ]
);

module.exports = router;