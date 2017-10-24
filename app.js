var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var session = require('express-session');
//var MongoStore = require('connect-mongo')(session);
var sessions = require('client-sessions');
//var MongoStore = require('connect-mongo')(sessions);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongoskin');

// Aca - Routes
var routes = require('./routes/index');
var mobile = require('./routes/mobile');
var crud = require('./routes/crud');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname + '/public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Aca - Session
/*app.use(session({
  store: new MongoStore({
    url: 'mongodb://chopsroot:hell1234@ds031561.mongolab.com:31561/tagw',
    ttl: 14 * 24 * 60 * 60
  }),
  secret: '123456qwerty',
  cookie: {maxAge: 60000 * 20}
}));*/
app.use(sessions({
    cookieName: 'DiplogiftSession',
    secret: 'diplogift for tn yeah',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    cookie: {
      path: '/',
      ephemeral: false,
      httpOnly: true,
      secure: false,
      maxAge: 30 * 60 * 1000
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

//Aca - Accessible DB
app.use(function(req, res, next){

  // Assign function `mondb` 
  req.mondb = function(account) {
    // account = { user: <user>, pwd: <pwd> }
    var hostdb = 'ds031561.mongolab.com:31561/tagw';
    var uri = 'mongodb://' + account.user + ':' + account.pwd + '@' + hostdb;
    console.log('app.js : uri = ' + uri);
    return mongo.db(uri, { native_parser:true });
  };
  next();
});

// Aca - Routes
app.use('/', routes);
//app.use('/m', mobile);
//app.use('/crud', crud);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  var HOME = '<script>location.href = \"/\"</script>';
  res.send(HOME);
  //next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
    //var HOME = '<script>location.href = \"/\"</script>';
    //res.send(HOME);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
  //var HOME = '<script>location.href = \"/\"</script>';
  //res.send(HOME);
});


module.exports = app;
