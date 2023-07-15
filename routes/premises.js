var express = require('express');
var router = express.Router();
var { validationResult, body } = require('express-validator');
var config = require('../config');
var dbConfig = require('../knexfile');
var db = require('knex').knex(dbConfig.development);
var { nanoid, random, customRandom } = require('nanoid');
var bcrypt = require('bcrypt');
var moment = require('moment');

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
  var existPremise = await db('premises')
  .select('*')
  .where({ phone_number: req.body.tbxPhone});

  // if (existPremise.length > 0) {
  //   return res.render('premises/add', { errors: { businessExist: true} });
  // }

  var _uuid = nanoid();
  var hashedPassword = await bcrypt.hashSync(req.body.tbxPassword, 10);

  await db('premises').insert({
    uuid: _uuid,
    business_name: req.body.tbxBusiness,
    phone_number: req.body.tbxPhone,
    password: hashedPassword
  }).then((result) => {
    console.log();
  }).catch((error) => {
    console.log(error);
  })

  var expiredDateTime = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

  await db('phone_verification').insert({
    phone_number: req.body.tbxPhone,
    uuid: _uuid,
    code: Math.floor(100000 + Math.random() * 900000),
    expired_time: expiredDateTime,
    status: 'Pending'
  })

});

router.get('/verification/:phone/:uuid', function (req, res) {
  return res.render('premises/verification', { info: req.body })

});

module.exports = router;
