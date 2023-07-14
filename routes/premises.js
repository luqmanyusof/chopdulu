var express = require('express');
var router = express.Router();
var { validationResult, body } = require('express-validator');
var config = require('../config');
var dbConfig = require('../knexfile');
const db = require('knex').knex(dbConfig.development);

if (config.env == 'prod') {
  knex = require('knex').knex(dbConfig.prod);
}

router.get('/add', function(req, res, next) {
  res.render('premises/add', { errors: []});
});

router.get('/login', function(req, res, next) {
  res.render('premises/login');
});

router.post('/add', 
  body('tbxBusiness').notEmpty().trim().withMessage('Business name is required.'),
  body('tbxPhone').notEmpty().trim().isMobilePhone('ms-MY').withMessage('Please insert valid phone number'),
  body('tbxPassword').notEmpty().isStrongPassword({minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage('Please use strong password'),
  body('tbxConfirmPassword').notEmpty().custom((value, {req}) => { return req.body.tbxPassword === req.body.tbxConfirmPassword }),
async function(req, res, next) {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.render('premises/add', { errors: errors.mapped() });
  }

  req.body.tbxPhone = req.body.tbxPhone.replace(/\D/g, '');
  var existUuid = await db('premises').select('uuid').where({ phone_number: req.body.tbxPhone});
  if (existUuid.length > 0) {
    return res.render('premises/add', { errors: { businessExist: true} });
  }

  return res.json(req.body);
});

module.exports = router;
