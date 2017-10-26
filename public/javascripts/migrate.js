(function($) {
  
  // -----------------------------
  var config = {
    apiKey: "AIzaSyCgOKeDjUkWX5gBni6e2dhBYBH7u8Uks3E",
    authDomain: "cope-326d5.firebaseapp.com",
    databaseURL: "https://cope-326d5.firebaseio.com",
    storageBucket: "cope-326d5.appspot.com",
    messagingSenderId: "201704308584"
  };
  var app = firebase.initializeApp(config);
  var email = "chopssin@gmail.com";
  var password = "shmily@cope";
  var userId;
  var storageRef = app.storage().ref('/user_apps/diplogifts-1/images');
  var appRef = app.database().ref('/cope_user_apps/diplogifts-1/public')

  var signIn = function() {
    app.auth().signInWithEmailAndPassword(email, password);
  };

  app.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('Signed in'); 
    } else {
      if (signIn) signIn();
      signIn = false;
    }
  });

  // -----------------------------
  var start = new Date().getTime();

  $.ajax({
    type: 'GET',
    url: '/crud/readall'
  }).done(function(res) {
    var end = new Date().getTime();
    var duration = end - start;
    duration = duration/1000;
    console.log(duration + ' seconds');
    console.log(res);

    var ret = '';
    var items = {};
    var events = {};

    var images = {};
    images.items = {};
    images.events = {};
    
    var itemCount = 0;
    var eventCount = 0;

    res.data.forEach(function(x) {
      var ids = {};
      var _images_item = [];
      var _images_event = [];
      x.images.others.forEach(function(y) {
        var names = y.split('/');
        if (names && names.length && names[1] === 'images') {
          var fname = getFname(names[3]);
          
          if (names[2] != 'mayor_photo') {
            var name = getName(names[3], x.id);
            if (name) {
              ids[name] = true;
              _images_item.push('/items/' + fname);
            }
          } else {
            // event file
            _images_event.push('/events/' + fname);
          }
        }
      });


      // Find eventId
      var date = x.receivedDate.split('/');
      if (date[0] === '104') date[0] = '2015';
      date = date.join('-');
      if (!events[date]) {
        events[date] = {};
      }
      var eventId = Object.keys(events[date]).length + 1;

      Object.keys(ids).forEach(function(id) {
        items[id] = {
          name: x.name,
          from: x.givenBy,
          to: x.receivedBy,
          receivedDate: x.receivedDate,
          eventId: date + '/' + eventId
        };

        // Set the item's images
        var display = '/items/' + x.images.display.split('/')[3];
        images.items[id] = {
          all: _images_item,
          display: display
        };

        console.log(x.id + ' -> ' + id);
        itemCount += 1;
      });

      events[date][eventId + ''] = {
        //originalId: x.id,
        //postTitle: x.postTitle,
        title: x.event.title,
        content: x.event.content,
        itemIds: ids
      };

      // Set the event's images
      if (!images.events[date]) {
        images.events[date] = {};
      }
      images.events[date][eventId + ''] = {};
      images.events[date][eventId + '']['all'] = _images_event;

      if (eventId > 1) {
        console.log('Found ' + eventId + ' events at ' + date);
      }

      eventCount += 1;
      console.log('-----------------------');
    }); // end of res.data.forEach

    console.log(images);
    console.log(items);
    console.log(events);
    console.log('Found ' + itemCount + ' items');
    console.log('Found ' + eventCount + ' events');

    if (app.auth().currentUser) {
      console.log('user has signed in');
      var counter = 0;
      var done = function() {
        counter++;
        console.log(counter);
        if (counter === 3) {
          console.log('Done.');
        }
      };
      appRef.child('items').set(items).then(done);
      appRef.child('events').set(events).then(done);
      appRef.child('images').set(images).then(done);
    }

    setTest(images, items, events);
  }); // end of $.ajax

  $('body').css({
    'padding': '15px'
  });

  $('#print').css({
    'display': 'block',
    'width': '540px',
    'padding-left': '4px'
  });

  function setTest(images, items, events) {
    // TEST DATA
    // print image
    $('#submit').click(function() {
      $('#print').html('');
      $('#info').html('');
      var testId = $('#input-id').val();
      var testCol = $('#input-col').val();
      var photos = [];
      var ref;

      if (testCol === 'items') {
        var item = items[testId];
        var itemInfo = '';
        itemInfo = '<ul>'
          + '<li>' + item.name + '</li>'
          + '<li>' + item.from + '</li>'
          + '<li>' + item.to + '</li>'
          + '<li>' + item.receivedDate + '</li>'
          + '<li>' + item.eventId + '</li>'
          + '</ul>';
        $('#info').append(itemInfo);
        ref = images.items[testId].all;
      } else if (testCol === 'events') {
        var names = testId.split('/');
        var evt = events[names[0]][names[1]];
        var eventInfo = '<ul>'
          + '<li>' + evt.title + '</li>'
          + '<li>' + evt.content + '</li>'
          + '<li>' + Object.keys(evt.itemIds).reduce(function(_html, _id) {
            _html += '[' + _id + ']';
            return _html;
          }, '') + '</li>'
          + '</ul>';
        $('#info').append(eventInfo);
        ref = images[testCol][names[0]][names[1]].all;
      }
      
      photos = ref || [];
      photos.forEach(function(path) {
        loadPhoto(path);
      });
    });

    $('#test-inputs').fadeIn(300);
  };

  function getName(_name, _id) {
    var matches = _name.match(/^s?([\d]+(\-[\d+])?)/);
    if (!matches) console.log(_id + ' -> getName exception from "' + _name + '"');
    return matches && matches[1] || null;
  };

  function getFname(_name) {
    if (_name.charAt(0) === 's') {
      _name = _name.slice(1);
    }
    return _name;
  };

  function print(data) {
    var result = String(data);
    $('#print').html(result);
  };

  function loadPhoto(path) {
    storageRef.child(path).getDownloadURL().then(function(url) {
      $('#print').append('<img width="100%" src = "' + url + '">');
    }).catch(function(err) {
      console.log(err);
    });
  };

})(jQuery);
