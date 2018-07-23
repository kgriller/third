const express = require('express');
const router = express.Router()
const Joi = require('joi')
const passport = require('passport')
const fs = require('fs')
const multer = require('multer');
const upload = multer({dest: 'profile/tmp/'});
 
const User = require('../models/user')

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return res.redirect('/')
  }
}
 
  router.route('/dashboard')
  .get(requiresLogin, (req, res) => {
    var file = __basedir + '/' + 'profile' + '/' + 'images' + '/' + req.session.username + '.jpg'
    var prof = __basedir + '/public/images/profpic.jpg'
    if (fs.existsSync(file)) {
        if (fs.existsSync(prof)) {
            fs.unlinkSync(prof)
        }
        var rStream = fs.createReadStream(file);
		var wStream = fs.createWriteStream(prof);
		rStream.pipe(wStream);
    } else {
        var rStream = fs.createReadStream(__basedir + '/default.jpg');
		var wStream = fs.createWriteStream(prof);
		rStream.pipe(wStream);
    }
    console.log(prof)
    return res.render('dashboard', { username : req.session.username})
  })

  router.route('/logout')
    .get(requiresLogin, (req, res) => {
      try {
        req.session.destroy(function(err) {
          return res.redirect('/');
        })
      } catch(err) {
        return res.redirect('/')
      }
    });


  router.route('/upload')
    .get(requiresLogin, (req, res) => {
      return res.render('upload')
    })
    .post(requiresLogin, upload.single('file'), (req, res) => {
      var file = __basedir + '/' + 'profile' + '/' + 'images' + '/' + req.session.username + '.jpg';
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
      fs.rename(req.file.path, file, function(err) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('dashboard')
        }
      })
    })

  module.exports = router