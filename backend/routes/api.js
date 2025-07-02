const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/me', auth, (req, res) => {
  res.json({ msg: `Hello user ${req.user.id}` });
});

module.exports = router;
