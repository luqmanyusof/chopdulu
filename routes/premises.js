var express = require('express');
var router = express.Router();

router.get('/add', function(req, res, next) {
  res.render('premises/add');
});

router.get('/login', function(req, res, next) {
  res.render('premises/login');
});

router.post('/add', function(req, res, next) {
  res.json(req.body);
});

module.exports = router;
