var express = require('express');
var router = express.Router();
var aca = require('../aca/aca.js');

// TBD: fetch from config.json
var APP_ID = 'diplogifts-1',
    APP_NAME = '台南市城市交流藝廊',
    getInfo = function() {
      return {
        appName: APP_NAME,
        graphId: APP_ID
      };
    };

// Send config data
router.get('/cope-config', function(req, res, next) {
  res.send({
    graphId: APP_ID,
    appName: APP_NAME,
    config: {
      apiKey: "AIzaSyCgOKeDjUkWX5gBni6e2dhBYBH7u8Uks3E",
      authDomain: "cope-326d5.firebaseapp.com",
      databaseURL: "https://cope-326d5.firebaseio.com",
      storageBucket: "cope-326d5.appspot.com",
      messagingSenderId: "201704308584"
    }
  });
});

// Test
router.get('/test', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'test';
  res.render('diplogift-main', info);
});

// Home
router.get('/', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'home';
  res.render('diplogift-main', info);
});

// Items
router.get('/items', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'items';
  res.render('diplogift-main', info);
});

// Events
router.get('/events', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'events';
  res.render('diplogift-main', info);
});

// Item Single 
router.get('/items/:id', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'item-single';
  res.render('diplogift-main', info);
});

// Event Single 
router.get('/events/:id', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'event-single';
  res.render('diplogift-main', info);
});

// Edit mode
router.get('/edit', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'home';
  info.editable = true;
  res.render('diplogift-main', info);
});

// Items in Edit Mode
router.get('/edit/items', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'items';
  info.editable = true;
  res.render('diplogift-main', info);
});

// Events in Edit Mode
router.get('/edit/events', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'events';
  info.editable = true;
  res.render('diplogift-main', info);
});

// Manage images in Edit Mode
router.get('/edit/images', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'media.images';
  info.editable = true;
  res.render('diplogift-main', info);
});

// Edit an item
router.get('/edit/items/:id', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'item-single';
  info.editable = true;
  res.render('diplogift-main', info);
});

// Edit an event
router.get('/edit/events/:id', function(req, res, next) {
  var path = req.path,
      info = getInfo();
  info.path = path;
  info.page = 'event-single';
  info.editable = true;
  res.render('diplogift-main', info);
});
module.exports = router;
