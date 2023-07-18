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
  var _uuid;

  console.log(errors);
  if (!errors.isEmpty()) {
    return res.render('premises/add', { errors: errors.mapped() });
  }

  req.body.tbxPhone = req.body.tbxPhone.replace(/\D/g, '');
  var hashedPassword = await bcrypt.hashSync(req.body.tbxPassword, 10);

  var existPremise = await db('premises')
  .select('*')
  .where({ phone_number: req.body.tbxPhone });

  if (existPremise.length > 0) {
    _uuid = existPremise[0].uuid;

    if(existPremise[0].is_active == true) {
      return res.render('premises/exists', { phone: existPremise[0].phone_number, business: existPremise[0].business_name });
    } else {
      _uuid = nanoid();

      await db('premises').update({
        business_name: req.body.tbxBusiness,
        phone_number: req.body.tbxPhone,
        password: hashedPassword
      })

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
    }
  }

  var expiredDateTime = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

  await db('phone_verification').insert({
    phone_number: req.body.tbxPhone,
    uuid: _uuid,
    code: Math.floor(100000 + Math.random() * 900000),
    expired_time: expiredDateTime,
    status: 'Pending'
  })

  res.redirect('verification/' + req.body.tbxPhone + '/' + _uuid);
});

router.get('/verification/:phone/:uuid', function (req, res) {
  console.log(req.params);
  return res.render('premises/verification', { phone: req.params['phone'], uuid: req.params['uuid'], error: '' })
});

router.post('/verification', async function (req, res) {
  var _uuid = req.body.tbxUuid;
  var _code = req.body.tbxCode;
  var _phone = req.body.tbxPhone;

  console.log(req.body);

  await db('phone_verification')
  .where({ uuid: _uuid, code: _code })
  .orderBy('id', 'desc')
  .limit(1)
  .then((result) => {
    if (result.length == 0) {
      return res.render('premises/verification', { phone: _phone, uuid: _uuid, error: 'Invalid verification code. Try again.' })
    } else {
      return res.send('success');
    }
  })
})

module.exports = router;
