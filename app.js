var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let hbs = require("express-handlebars");
const hbshelpers = require("handlebars-helpers");
const multihelpers = hbshelpers();
let db = require('./database-config/connection')
let session = require('express-session')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var superAdmin = require('./routes/super-admin')
require('dotenv').config();




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', helpers: multihelpers, defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/',helpers: {
  inc: function (value, options) {
    return parseInt(value) + 1;
  },
  ifEquels:function(a,b, opts) {
    if (a == b) {
      return opts.fn(this)
  } else {
      return opts.inverse(this)
  } 
  }

} }))
// Helper('ifEquals', f);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
let oneMonth=1000*60*60*24*30


// dbconnect

db.connect((err) => {
  if (err) console.log("Database connection error");
  else console.log("Database connection successfull");
})

app.use(
  session({
    secret: 'brototype',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneMonth},

  })
);

app.use((req, res, next) => {
  if (!req.user) {
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
    res.header("Express", "-3");
  }
  next();
});

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/RestaurantAdmin', superAdmin)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

console.log('hi code rached')



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{err:true});
});

module.exports = app;
