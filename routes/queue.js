var express = require('express');
var router = express.Router();

router.get('/add/', (req, res) => {
    res.render('queue', { title: 'ChopDulu Queue'})
})

module.exports = router;