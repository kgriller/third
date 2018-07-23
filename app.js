const express = require('express');
const morgan = require('morgan')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const db = require('./config/db');

global.__basedir = __dirname;

mongoose.Promise = global.Promise
mongoose.connect(db.url)

const app = express()
app.use(morgan('dev'))

app.use(express.static('public'))

app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout' }))
app.set('view engine', 'handlebars')
 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: 'my secret work',
  saveUninitialized: false,
  resave: true
}));
 
app.use(passport.initialize())
app.use(passport.session())
 
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_mesages = req.flash('success')
  res.locals.error_messages = req.flash('error')
  next()
})

app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/reg', require('./routes/reguser'))
 
app.use((req, res, next) => {
  res.render('notFound')
});

app.listen(5000, () => console.log('Server started listening on port 5000!'))