const express = require('express');
const router = express.Router()
const Joi = require('joi')
const passport = require('passport')
const fs = require('fs')
 
const User = require('../models/user')
 
const userSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required(),
  confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
})

const logSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required()
})

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return res.redirect('/')
  }
}

router.route('/register')
  .get((req, res) => {
    res.render('register')
  })
  .post(async (req, res, next) => {
    try {
      const result = Joi.validate(req.body, userSchema)
      if (result.error) {
        req.flash('error', 'Data entered is not valid. Please try again.')
        res.redirect('/users/register')
        return
      }
 
      const user = await User.findOne({ 'email': result.value.email })
      if (user) {
        req.flash('error', 'Email is already in use.')
        res.redirect('/users/register')
        return
      }
 
      const hash = await User.hashPassword(result.value.password)
 
      delete result.value.confirmationPassword
      result.value.password = hash
 
      const newUser = await new User(result.value)
      await newUser.save()
 
      req.flash('success', 'Registration successfull, go ahead and login.')
      res.redirect('/users/login')
 
    } catch(error) {
      return res.redirect('/')
    }
  })

  router.route('/login')
  .get((req, res) => {
    res.render('login')
  })
  .post(async (req, res, next) => {
      try {
        const result = Joi.validate(req.body, logSchema)
        if(result.error) {
          req.flash('error', 'Invalid data entered. Please try again')
          res.redirect('/users/login')
          return
        }
        const hash = await User.hashPassword(result.value.password)
 
        result.value.password = hash

        User.authenticate(req.body.email, req.body.password, function(error, user) {
          if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.status = 401;
            return next(err);
          } else {
            req.session.userId = user._id;
            req.session.username = user.username;
            return res.redirect('/reg/dashboard')
          }
        })
      } catch (error) {
        return res.redirect('/')
      }
  })

  module.exports = router