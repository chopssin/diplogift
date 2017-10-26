(function($) {
  Phrases = {};
  Phrases.PROCESSING = '處理中';
  Phrases.CHOOSE = '選取';
  Phrases.CHOOSE_IMG = '選取圖片';
  Phrases.CHOOSE_FROM_COL = '從圖庫選取';
  Phrases.SAVE = '存擋';
  Phrases.DONE = '確定';

  // -----------------------------
  // setDebug
  // -----------------------------
  var setDebug = function(_name, _toggle, _tag) {
    if (typeof _name != 'string') {
      return console.error('setDebug = function(String _name'
        + '[, Boolean _toggle[, String _tag]])');
    }
    var tags = {}, debug; 
    if (_tag) tags[_tag] = true;

    debug = function() {
      var val,
          theTag = '';
      if (!_toggle) return;

      var args = arguments;
      switch (args.length) {
        case 0: // Show usage
          console.log('---------------------------');
          console.log('[' + _name + '] debug tags:');
          Object.keys(tags).forEach(function(tag) {
            console.log(tag);
          });
          console.log('You can specify the tag in setDebug(_name, _toggle, _tag)');
          console.log('---------------------------');
          return;
          break;
        case 1: // Just print
          val = args[0];
          break;
        case 2: // Filtered
          tags[args[0]] = true; // register as a tag
          if (_tag && args[0] != _tag) return;
          val = args[1];
          theTag = '[ ' + args[0] + ' ]';
          break;
      }
      // Print
      // console.log('---------------------------');
      if (typeof val != 'object') {
        console.log('[' + _name + ']' + theTag + ' ' + val);
      } else {
        console.log('[' + _name + ']' + theTag + ' ->');
        console.log(val);
        console.log('--------------------------------');
      }
      // console.log('---------------------------');
    };
    return debug;
  }; // end of setDebug

  // -----------------------------
  // setTest
  // -----------------------------
  var setTest = function(_name, _toggle) {
    var name = _name, myTest = {}, debug;
    if (typeof name != 'string') {
      var _t = util.timeOf(new Date().getTime());
       name = _t.fullDate + ' ' + _t.fullTime; 
    }
    debug = setDebug('TEST | ' + name, true);
  
    myTest.run = function() {
      if (!_toggle) return;

      var args = arguments;
      switch(args.length) {
        case 1:
          // Anonymous test
          if (typeof args[0] == 'function') {
            debug('testing...');
            args[0](debug);
          }
          break;
        case 2:
          if (typeof args[0] == 'string' && typeof args[1] == 'function') {
            debug(args[0]);
            args[1].call(null, debug);
          }
          break;
      } 
    };
    return myTest;
  }; // end of setTest

  // -----------------------------
  // dataSnap
  // -----------------------------
  var dataSnap = function(_name) {
    var my = {},
        data = {},
        registry = {},
        loaders = {}, // methods to load data
        debug, // to debug
        emit, // deliver updated data to registered Views 
        myName; // optional, name of this dataSnap
  
    myName = _name 
      || (new Date().getTime().toString(36))
          + '_' + Math.floor(Math.random() * 1000);
    
    debug = setDebug('dataSnap ' + myName); // set the initial silent debugger

    emit = function() {
      Object.keys(registry).forEach(function(id) {
        registry[id].load(data);
      });
    };

    my.setDebug = function() {
      debug = setDebug.apply(arguments);
    };

    my.enroll = function(_vu) {
      if (typeof _vu == 'object'
        && typeof _vu._id == 'string') {
        registry[_vu._id] = _vu;
        //_vu.ds((_snapName || name), my);
      } else {
        console.error('_vu is not an valid View object');
      }
    };

    my.val = function(_data) {
      if (_data) {
        data = _data;
        emit();
      }
      debug('val', data);
      return data;
    };

    my.update = function(_updates) {
      if (typeof _updates == 'object') {
        for (var name in _updates) {
          data[name] = _updates[name];
        }
      }
      debug('update', data);
      emit();
    };

    my.load = function(name, func) {
      debug('load', '.load(name, func)');
      switch (arguments.length) {
        case 0: // call all funcs in loaders
          for (var _name in loaders) {
            debug('load', 'call ' + _name);
            loaders[_name].call(my);
          }
          break;
        case 1: 
          // Call specific func in loaders
          if (typeof name == 'string') {
            if (loaders[name]) {
              debug('load', 'call ' + name);
              loaders[name].call(my);
            }
          // Or set anonymous function  
          } else if (typeof name == 'function') {
            var anonymous = (new Date().getTime()).toString(36);
            debug('load', 'set ' + anonymous);
            loaders[anonymous] = name;
          }
          break;
        case 2: // set specific func in loaders
          if (typeof func != 'function'
              || typeof name != 'string') { return; }
          debug('load', 'set ' + name);
          loaders[name] = func;
          break;
      }
      debug('load', data);
    }; // end of my.load

    return my;
  }; // end of dataSnap

  // -----------------------------
  // Editor
  // -----------------------------
  var editor = function() {

    var debug = setDebug('Editor', true);

    var Views = views(),
        ModalView = Views.class('Modal'),
        vuModal,
        ViewClasses = {},
        CopeAccountView, // to sign-in, sign-out or sign-up
        WriterView, // click to edit and upsert data
        ImageViewerView, // click to view the image
        ImageChooserView, // choose images from the collection
        ImageUploaderView, // upload images from local
        lastOpenedVu, // record opened views in modal
        my = {},
        mainApp = this, // the copeApp
        that = this; // the copeApp

    // Cope Account
    CopeAccountView = Views.class('CopeAccount');
    CopeAccountView.dom(function() {
      return '<div' + this._ID + 'class="cope-account">'
        + '<h3>Cope | Sign in</h3>'
        + '<input data-component="account" type="email" placeholder="Email">'
        + '<input data-component="pwd" type="password" placeholder="Password">'
        + '<span data-component="status" class="color-red"></span>'
        + '<button class="final">Go</button>'
        + '</div>';
    });
    CopeAccountView.render(function() {
      var account, pwd,
          error = this.val('error'),
          ok = this.val('ok'),
          that = this;

      this.$el('button').off('click').on('click', function() {
        account = that.$el('@account').val().trim();
        pwd = that.$el('@pwd').val();
        that.res('try', { account: account, pwd: pwd });
      });

      this.$el('@status').text('');
      if (error && !ok) {
        debug('CopeAccount - error', error);
        this.$el('@status').text('Wrong user/password');
      }
      if (ok) {
        my.dismiss();
      }
    });
    ViewClasses.CopeAccount = CopeAccountView;

    // Editor's View Classes
    // Blank
    WriterView = Views.class('Blank');
    WriterView.dom(function() {
      var label = this.val('label') || '';
      return '<div' + this._ID +'>' 
          + '<label data-component="label">' + label +'</label>'
          + '<textarea></textarea>'
          + '<button class="final">Save</button>';
        + '</div>';
    }); // end of Blank.dom
    WriterView.render(function() {
      var node = this.val('node'),
          field = this.val('field'),
          useDate = this.val('useDate'),
          map = this.val('map'), // raw -> val
          raw = this.val('raw'), // val -> raw
          val, //= this.val('val'), 
          newVal,
          valType, // string, number 
          that = this;

      if (!node || !field) return; 

      // Fetch the current value
      node.val(field).then(function(_val) {
        valType = typeof _val;
        val = _val;
        if (useDate) {
          val = util.timeOf(val).fullDate;
        } 
        if (typeof map == 'function') {
          val = map(val);
        }
        that.$el('textarea').val(val);
      });

      that.$el('button').off('click').on('click', function() {
        // Fetch the new value
        newVal = that.$el('textarea').val().trim();
        if (useDate) newVal = util.timeOf(newVal).timestamp;
        if (valType == 'number') newVal = Number(newVal);
        if (typeof raw == 'function') newVal = raw(newVal);
        
        console.log(newVal);
        if (!node || !newVal) return;
        try {
          // Update with the new value
          node.val(field, newVal).then(function() {
            that.res('newVal', newVal);
          });
        } catch (err) { console.error(err); }

        // Dismiss Editor
        my.dismiss();
        return;
      }); // end of ... button ... click
    }); // end of WriterView.render
    ViewClasses.Writer = WriterView;

    ImageViewerView = Views.class('ImageViewer');
    ImageViewerView.dom(function() {
      var src = this.val('src'),
          img = this.val('img');
      if (!src) return '<h3>Failed to open image</h3>';
      if (img) return '<div' + this._ID + ' style="width:100%;"></div>';
      return '<img width="100%" src="' + src + '">';
      //return 'img width="100%" src="' + src + '"';
    });
    ImageViewerView.render(function() {
      var img = this.val('img');
      if (!img) return;
      this.$el().append(img);
    });// end of ImageViewerView.render
    ViewClasses.ImageViewer = ImageViewerView;
    
    ImageChooserView = Views.class('ImageChooser');
    ImageChooserView.dom(function() {
      return '<div' + this._ID + '>' 
          + '<div class="image-chooser" data-component="list"></div>'
          + '<div style="width:100%">'
            + '<button data-component="doneBtn" class="final">'
              + Phrases.DONE 
            + '</button>'
          +'</div>'
        + '</div>';
    });
    ImageChooserView.render(function() {
      var $list = this.$el('@list'),
          multi = this.val('multi'),
          selected = [],
          that = this;

      that.$el('@doneBtn').off('click').on('click', function() {
        that.res('selected', selected);
        my.dismiss();
      });

      // Get images with format { timestamp, filename, thumb, url }
      my.getImages().then(function(res) {
        res.timestamps.forEach(function(t) { 
          var row = '<div class="row"' 
            + ' style="margin:0; margin-bottom: 16px;"' 
            + ' data-component="row-'
            + t + '"></div>';
          $list.append(row);
        }); 

        res.images.forEach(function(img, idx) {
          var imgId = 'img-' + idx,
              t = img.timestamp,
              $img,
              url = img.thumb || img.url,
              html = '<div data-component="' + imgId + '" style="margin:4px; padding:0;"'
                    + ' class="col-xs-4 col-sm-3 col-md-2 img-full squared">' 
                    + '<img src="' + url + '">' + '</div>';
            
          that.$el('@row-' + t).append(html);
          $img = that.$el('@' + imgId);
          $img.off('click').on('click', function() {

                if (multi) {
                  // Multiple selection
                  var found;
                  for (var i = 0; i < selected.length; i++) {
                    if (selected[i].imgId == imgId) {
                      found = i; // Already selected
                      break;
                    }
                  }
                  if (!isNaN(found)) {
                    // Remove from selected
                    selected.splice(found, 1); 
                    $img.removeClass('selected');
                  } else {
                    // Append to selected
                    selected.push({ 
                      img: img, imgId: imgId, 
                      $img: $img
                    });
                    $img.addClass('selected');
                  }
                } else {
                  // Single selection
                  selected = {
                    img: img, imgId: imgId, 
                    $img: $img
                  };
                  that.$el('.selected').removeClass('selected');
                  $img.toggleClass('selected');
                }
          }); // end of ... click
        }); // end of ... forEach
      }); // end of  ... then
    }); // end of ImageChooserView
    ViewClasses.ImageChooser = ImageChooserView;

    // ImageUploader
    // It will upload at least two versions of the image
    // 1. Original
    // 2. Small with width < 480px (240 * 2)
    ImageUploaderView = Views.class('ImageUploader');
    ImageUploaderView.dom(function() {
      var multi = this.val('multi') ? 'multiple' : '';
      return '<div'+ this._ID +'>'
        + '<h4>' + Phrases.CHOOSE_IMG + '</h4>'
        + '<div data-component="images" style="width:100%"></div>'
        + '<input type="file" data-component="file-input" accept="image/*"'
        + ' style="display:none" ' + multi + '>'
        + '<button class="btn btn-primary" data-component="choose" style="margin-right:16px">' 
          + Phrases.CHOOSE + '</button>'
        + '<button data-component="save" class="btn final hidden">' + Phrases.SAVE + '</button>'
        + '<div data-component="note" class="float-right hidden">' 
          + Phrases.PROCESSING 
          + '<span data-component="progress"></span></div>'
      + '</div>';
    }); // end of ImageUploader.dom
    ImageUploaderView.render(function() {
      var that = this,
          G = mainApp.useGraphDB(), 
          counter = 0, // count processed images
          //callback = this.val('callback') || function() {},
          $images = this.$el('@images'),
          $chooseBtn = this.$el('@choose'),
          $saveBtn = this.$el('@save'),
          $note = this.$el('@note'),
          $progress = this.$el('@progress'),
          $fileInput = this.$el('@file-input');
   
      $fileInput.change(function() {
        var files = $fileInput.get(0).files,
            thumbs = [],
            total = files.length,
            timestamp = new Date().getTime(),
            savedUrls = [],
            count = 0, // count thumbs
            p_counts = [], // count thumbnailizing process
            p_total = files.length;
        

        $images.html('');
        $note.removeClass('hidden');

        for (var i = 0; i < files.length; i++) {
          p_counts[i] = 0;
          var a = function(idx) { 

            // Process each image
            var file = files[idx],
                reader = new FileReader();
            reader.onload = function(e) {
              var preview, 
                  img = new Image();
              img.onload = function() {
                // Compress the image
                thumb = util.thumbnailer(img, 240);
                thumb.onload = function() {
                  counter++;
                  if (counter == files.length) {
                    $saveBtn.removeClass('hidden');
                    $note.addClass('hidden');
                  } 
                };
                thumb.onprogress = function(progress) {
                  p_counts[idx] = progress;
                  var p_sum = p_counts.reduce(function(s, p) {
                    return s + p;
                  }, 0);
                  $progress.html('(' 
                    + Math.floor(100 * (p_sum/p_total))
                    + '%)');
                };
                thumbs[idx] = thumb;

                // Preview image wrap
                that.$el('#preview-'+ idx).html(img);
              };
              img.src = e.target.result;
            }; // end of reader.onload
            reader.readAsDataURL(file);
            $images.append('<div id="preview-'+ idx +'"></div>');

          }(i); // end of function "a" 
        } // end of for
       
        // Set the Save button
        $saveBtn.off('click').on('click', function() {
          var count = 0, imgObjs = [];
          for (var i = 0; i < files.length; i++) { 
            var a = function(idx) {

              var file = files[idx];
              var thumb = dataURItoBlob(thumbs[idx].canvas.toDataURL("image/png"));
              var fileParams = {
                folder: 'images',
                timestamp: timestamp,
                filename: file.name,
                file: file
              };
              var thumbParams = {
                folder: 'images',
                timestamp: timestamp,
                filename: file.name + '_thumb_',
                file: thumb
              };

              G.files().saveMany([thumbParams, fileParams]).then(function(_pairs) {
                count++;
                var imgObj = {};
                _pairs.forEach(function(x) {
                  imgObj.timestamp = parseInt(x.timestamp);
                  if (x.path.slice(-7) == '_thumb_') {
                    imgObj.thumb = x.url;
                  } else {
                    imgObj.url = x.url;
                    imgObj.path = x.path;
                  }
                });
                imgObjs.push(imgObj);

                debug('ImageUploader', 'count = ' + count);
                debug('ImageUploader', imgObj);
                debug('ImageUploader', 'Done.');

                if (count == files.length) {
                  that.res('done', imgObjs);
                }
              }); // end of saveMany

              // Dismiss the modal
              my.dismiss();
            }(i); // end of function "a"
          } // end of for
        }); // end of $saveBtn.click
      }); // end of $fileInput.change
      $chooseBtn.click(function() {
        console.log('Choose');
        $fileInput.click();
      });
    });
    ViewClasses.ImageUploader = ImageUploaderView;
    
    // Render initial lightbox and modal
    ModalView.dom(function() { 
      return '<div' + this._ID + 'id="Editor-zone" class="Editor-lightbox">' 
        + '<div data-component="modal" class="modal">'
        + '</div>'
      + '</div>';
    }); // end of ModalView.dom
    ModalView.render(function() { 
      var $this = this.$el();
      this.$el().off('click').on('click', function(e) {
        $this.hide();
        $('body').removeClass('frozen');
      });
      this.$el('@modal').unbind('click').click(function(e) {
        e.stopPropagation();
      });
    }); // end of ModalView.render
    vuModal = ModalView.build({ selector: 'body', method: 'prepend' });

    // Editor's methods
    my.open = function(obj) {
      var UsedView = typeof obj.use == 'string'
            ? ViewClasses[obj.use]
            : null;
      if (!UsedView) {
        return console.error('Failed to open "' + obj.use + '"');
      }

      $('body').addClass('frozen');
      vuModal.$el('@modal').html('');

      lastOpenedVu = UsedView.build({
        selector: vuModal.sel('@modal'),
        data: obj.data || {}
      });

      vuModal.$el().fadeIn(300);
      return lastOpenedVu;
    }; // end of my.open

    my.openCopeAccount = function() {
      return my.open({ use: 'CopeAccount' });
    };
    // @node, @field, @label, @useDate, 
    // @map: raw -> val,  
    // @raw: val -> raw
    my.openWriter = function(_params) { 
      return my.open({ use: 'Writer', data: _params });
    }; // end of my.openWriter
      
    // @multi
    my.openImages = function(_params) { 
      return my.open({ use: 'ImageChooser', data: _params });
    }; // end of my.openImages
      
    // @multi
    my.openImageUploader = function(_params) { 
      return my.open({ use: 'ImageUploader', data: _params });
    }; // end of my.openImageUploader

    my.getImages = function() {
      var _thenable = {},
          _images = {}, // <t>.<f> -> { timestamp, filename, url, thumb }
          images = [], // flattened _images
          _timestamps = {},
          timestamps = [],
          path = 'images', 
          done;
      _thenable.then = function(_cb) {
        if (typeof _cb == 'function') { done = _cb; }
      }
      mainApp.useGraphDB().files().open(path).then(function(res) {
        debug('getImages - res', res);

        Object.keys(res).forEach(function(_t) {
          _timestamps[_t] = true,
          Object.keys(res[_t]).forEach(function(_f) {
            var _filename = _f;
            if (_f.slice(-7) == '_thumb_') {
              _filename = _f.slice(0, -7);
            }

            if (!_images[_t]) _images[_t] = {};
            if (!_images[_t][_filename]) _images[_t][_filename] = {};

            if (_f.slice(-7) == '_thumb_') {
              _images[_t][_filename].thumb = res[_t][_f];
            } else {
              _images[_t][_filename].url = res[_t][_f];
              _images[_t][_filename].filename = _filename;
              _images[_t][_filename].timestamp = parseInt(_t);
            }
          });
        });
        
        Object.keys(_images).forEach(function(_t) {
          Object.keys(_images[_t]).forEach(function(_f) {
            images.push(_images[_t][_f]);
          });
        });
        debug('getImages - images', images);
        
        Object.keys(_timestamps).forEach(function(_t) {
          timestamps.push(parseInt(_t));
        });
        timestamps = timestamps.sort(function(a, b) { return a - b; });

        if (typeof done == 'function') { done({ timestamps: timestamps, images: images }); }
      });
      return _thenable;
    }; // end of my.getImages

    // @imgArr accepts three forms:
    // 1. <string> path
    // 2. <object> { timestamp, filename, thumb }
    // 3. <object> { path }
    my.delImages = function(imgArr) {
      debug('delImages', imgArr); // imgArr = [<x>]
      if (!Array.isArray(imgArr)) return;

      var paths = [], _thenable = {}, done, validate;
      validate = function(_p) {
        if (typeof _p == 'string') {
          var _idx = _p.indexOf('images/');
          if (_idx > -1) {
            _p = _p.slice(_idx);
            return _p;
          } 
        }
        return false;
      }; // end of validate
      _thenable.then = function(_cb) { done = _cb; };
      
      imgArr.forEach(function(x) {
        var _p;
        if (typeof x == 'string') { //x: path
          _p = validate(x);
          if (_p) paths.push(_p);

        } else if (x.timestamp && x.filename) { //x: { timestamp, filename, thumb, url }
          paths.push('images/' + x.timestamp + '/' + x.filename);
          if (x.thumb) {
            paths.push('images/' + x.timestamp + '/' + x.filename + '_thumb_');
          }

        } else if (typeof x.path == 'string') { //x: { path }
          _p = validate(x);
          if (_p) paths.push(_p);
        }
      });

      debug('delImages', paths);
      mainApp.useGraphDB().files().delMany(paths).then(function() {
        console.log('Deleted.');
        if (typeof done == 'function') {
          done(paths);
        }
      });

      return _thenable;
    };  // end of my.delImages

    my.dismiss = function() {
      vuModal.$el().click(); 
    };
    return my;
  }; // end of function "editor"

  // -----------------------------
  // util
  // -----------------------------
  var util = {},
      _cal = {},
      daysInMonth = function(month, year) {
        return new Date(year, month, 0).getDate();
      };

  util.setDebug = setDebug;
  util.setTest = setTest;
      
  util.getCal = function(year) {
    if (!_cal[year + '']) {
      _cal[year + ''] = {};
      for (var month = 1; month < 13; month++) {
        var days = daysInMonth(month, year);
        _cal[year + ''][month + ''] = {};
        for (var date = 1; date < (days+1); date++) {
          _cal[year + ''][month + ''][date + ''] 
            = new Date(year, month, date).getDay();
        }
      }
    }
    return _cal[year + ''];
  }; // end of util.getCal

  util.daysAfterNow = function(days) {
    var now = new Date().getTime(),
        time;
    days = parseInt(days, 10);
    if (isNaN(days)) return;

    time = now + days * 86400000;
    now = new Date(time);
    return {
      timestamp: time, 
      year: now.getFullYear(),
      month: now.getMonth(),
      date: now.getDate(),
      hr: now.getHours(),
      min: now.getMinutes()
    };
  }; // end of util.daysAfterNow

  util.timeOf = function(timestamp) {
    if (!timestamp) return {};

    if (typeof timestamp == 'string') {
      // e.g. 2012-3-22, 2012/3/22
      var str = timestamp.split(/\/|\-/).join('/');
      timestamp = new Date(str).getTime();
    }

    var t = parseInt(timestamp, 10),
        d = new Date(t),
        two = function(num) { // two-digit
          return ('00' + num).slice(-2);
        };
    if (!d) return {};
    var year = d.getFullYear(),
        month = d.getMonth() + 1,
        date = d.getDate(),
        hr = d.getHours(),
        min = d.getMinutes(),
        sec = d.getSeconds(),
        fullDate = year
          + '/' + month
          + '/' + date;
        fullTime = two(hr) 
          + ':' + two(min)
          + ':' + two(sec);
    return {
      timestamp: timestamp,
      fullDate: fullDate,
      fullTime: fullTime,
      year: year,
      month: month,
      date: date,
      hr: hr,
      min: min,
      sec: sec
    };
  }; // end of util.dateOf
  
  util.setTimer = function() {
    var start = new Date().getTime();
    return {
      lap: function() {
        var duration = (new Date().getTime() - start) / 1000;
        console.log('[debug] start = ' + start + '; duration = ' + duration);
        return duration;
      }
    };
  };//util.setTimer

  // --- util.thumbnailer ---
  util.thumbnailer = function(img, sx, lobes) {
    var elem = document.createElement("canvas");
    if (!lobes) lobes = 1;
    
    var thumb = new Thumbnailer(elem, img, sx, lobes);
    //thumb.done(function() {
    //  console.log(thumb);
    //});
    return thumb;
  }; // end of util.thumbnailer
  
  // returns a function that calculates lanczos weight
  function lanczosCreate(lobes) {
    return function(x) {
        if (x > lobes)
            return 0;
        x *= Math.PI;
        if (Math.abs(x) < 1e-16)
            return 1;
        var xx = x / lobes;
        return Math.sin(x) * Math.sin(xx) / x / xx;
    };
  }

  // elem: canvas element, img: image element, sx: scaled width, lobes: kernel radius
  function Thumbnailer(elem, img, sx, lobes) {
    this.canvas = elem;
    elem.width = img.width;
    elem.height = img.height;
    elem.style.display = "none";
    this.ctx = elem.getContext("2d");
    this.ctx.drawImage(img, 0, 0);
    this.img = img;
    this.src = this.ctx.getImageData(0, 0, img.width, img.height);
    this.dest = {
        width : sx,
        height : Math.round(img.height * sx / img.width),
    };
    this.dest.data = new Array(this.dest.width * this.dest.height * 3);
    this.lanczos = lanczosCreate(lobes);
    this.ratio = img.width / sx;
    this.rcp_ratio = 2 / this.ratio;
    this.range2 = Math.ceil(this.ratio * lobes / 2);
    this.cacheLanc = {};
    this.center = {};
    this.icenter = {};
    this.p_unit = Math.ceil(sx / 100);
    this._progress = 0;

    if ((img.width / sx) < 2) {
      setTimeout(this.process3, 0, this);
    } else {
      setTimeout(this.process1, 0, this, 0);
    }
  }
  Thumbnailer.prototype.onload = function() {
    if (this.onload) {
      this.onload.call();
    }
  };
  Thumbnailer.prototype.onprogress = function(_p) {
    if (this.onprogress) {
      this.onprogress.call(_p);
    }
  };
  Thumbnailer.prototype.process1 = function(self, u) {
    if (u % self.p_unit == 0) {
      self.onprogress(u / self.dest.width);
    } 
    self.center.x = (u + 0.5) * self.ratio;
    self.icenter.x = Math.floor(self.center.x);
    for (var v = 0; v < self.dest.height; v++) {
        self.center.y = (v + 0.5) * self.ratio;
        self.icenter.y = Math.floor(self.center.y);
        var a, r, g, b;
        a = r = g = b = 0;
        for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
            if (i < 0 || i >= self.src.width)
                continue;
            var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
            if (!self.cacheLanc[f_x])
                self.cacheLanc[f_x] = {};
            for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
                if (j < 0 || j >= self.src.height)
                    continue;
                var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
                if (self.cacheLanc[f_x][f_y] == undefined)
                    self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2)
                            + Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
                weight = self.cacheLanc[f_x][f_y];
                if (weight > 0) {
                    var idx = (j * self.src.width + i) * 4;
                    a += weight;
                    r += weight * self.src.data[idx];
                    g += weight * self.src.data[idx + 1];
                    b += weight * self.src.data[idx + 2];
                }
            }
        }
        var idx = (v * self.dest.width + u) * 3;
        self.dest.data[idx] = r / a;
        self.dest.data[idx + 1] = g / a;
        self.dest.data[idx + 2] = b / a;
    }

    if (++u < self.dest.width)
        setTimeout(self.process1, 0, self, u);
    else
        setTimeout(self.process2, 0, self);
  };
  Thumbnailer.prototype.process2 = function(self) {
    console.log('process2');
    self.canvas.width = self.dest.width;
    self.canvas.height = self.dest.height;
    self.ctx.drawImage(self.img, 0, 0, self.dest.width, self.dest.height);
    self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height);
    var idx, idx2;
    for (var i = 0; i < self.dest.width; i++) {
        for (var j = 0; j < self.dest.height; j++) {
            idx = (j * self.dest.width + i) * 3;
            idx2 = (j * self.dest.width + i) * 4;
            self.src.data[idx2] = self.dest.data[idx];
            self.src.data[idx2 + 1] = self.dest.data[idx + 1];
            self.src.data[idx2 + 2] = self.dest.data[idx + 2];
        }
    }
    self.ctx.putImageData(self.src, 0, 0);
    self.canvas.style.display = "block";
    self.onload();
  };
  Thumbnailer.prototype.process3 = function(self) {
    console.log('process3: actually just turn img into canvas');
    self.ctx.putImageData(self.src, 0, 0);
    self.canvas.style.display = "block";
    self.onload();
  }
  // end of Thumbnailer
  
  util.dataURItoBlob = dataURItoBlob;
  function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
  }; //dataURItoBlob

  // -----------------------------
  // views
  // -----------------------------
  var views = function() {
    var my = {},
        classes = {},
        count = 0,
        renderedVus = {},
        timestamp = new Date().getTime().toString(36),
        newView; // construct new vu
    timestamp = timestamp + Math.floor(Math.random() * 10000).toString(36);

    newView = function(_data) {
      var vu = {},
          _id,
          $el, sel, val, 
          update, load,
          res, // send eventType and data to outside
          _resFuncs = {},
          ds, // method to update data and trigger functions
          data = {},
          myDataSnap = dataSnap(), // default dataSnap
          dataSnaps = {},
          voidDS = dataSnap();

      count = count + 1;
      _id = timestamp + '_' + count;
      if (typeof _data == 'object') {
        data = _data;
      }

      val = function(key, _val) {
        if (arguments.length > 0 
            && typeof key != 'string') return;

        switch (arguments.length) {
          case 2: 
            data[key] = _val;
            return data[key];
            break;
          case 1: 
            return data[key];
            break;
          case 0:
            return data;
        }
      };
      sel = function(_path) {
        var root = '[data-vuid="' + _id + '"]';
        if (!_path) {
          return root;
        } else if (_path.charAt(0) === '@') { // eg. "@display"
          var cmp = '[data-component="' + _path.slice(1) + '"]';
          return root + cmp + ', ' + root + ' ' + cmp; 
        }
        return root + ' ' + _path;
      };
      $el = function(_path) {
        return $(this.sel(_path));
      };
      res = function(_name, _arg) {
        if (typeof _name != 'string') return;
        if (typeof _arg == 'function') {
          // to set res functions
          _resFuncs[_name] = _arg;
        } else {
          // to run res functions with data
          if (typeof _resFuncs[_name] == 'function') {
            _resFuncs[_name].call(vu, _arg);
          }
        }
        return this;
      };
      ds = function(_name, _ds) {
        switch (arguments.length) {
          case 0: 
            return myDataSnap;
            break;
          case 1:
            if (typeof _name == 'string') {
              // Find the customed dataSnap
              return dataSnaps[_name] || voidDS;
            } else if (typeof _name == 'object') {
              // Set the default dataSnap
              var obj = _name; // arg_0 is the updates obj
              update(obj);
              myDataSnap.update(obj);
            }
            break;
          case 2:
            if (typeof _name == 'string') {
              if (_name && _ds) {
                dataSnaps[_name] = _ds;
                _ds.enroll(vu);
              }
            }
            break;
        }
      }; // end of ds
      update = function(_updates) {
        // Update data
        if (typeof _updates == 'object') {
          // e.g. updates = { 'os': '10.2' }
          Object.keys(_updates).forEach(function(name) {
            var uVal = _updates[name];
            val(name, uVal);
          });
        }
      }; // end of update

      vu._id = _id;
      vu._ID = ' data-vuid="' + _id + '" ';
      vu.$el = $el;
      vu.sel = sel;
      vu.val = val;
      vu.update = update;
      vu.load = load; // will be made by proto
      vu.ds = ds;
      vu.res = res.bind(vu);
      
      myDataSnap.enroll(vu);
      return vu;
    }; // end of newView
    my.class = function(viewName) {
      if (!classes[viewName]) {
        var proto = {},
            dom = function() { return ''; },
            renderFuncs = [],
            render,
            renderAll;
        renderAll = function(_vu) {
          renderFuncs.forEach(function(rend) {
            if (typeof rend == 'function') { 
              rend.call(_vu);
            }
          });
        }; // end of renderAll
        proto.dom = function(func) {
          if (typeof func == 'function') { 
            dom = func;
          } 
        };
        // Append a render function to the array
        proto.render = function(func) {
          if (typeof func == 'function') { 
            renderFuncs.push(func);
          } 
        };
        proto.build = function(obj) {
          var vu = newView(obj.data || {}),
              selector = obj.sel || obj.selector,
              method = obj.method || 'html';
          try {
            // Render dom
            vu.load = function() {
              if (vu.$el().length < 1) {
                $(selector)[method](dom.call(vu));
              }
              renderAll(vu);
            };
            vu.load();
          } catch (err) { console.error(err); }
          return vu;
        }; // end of proto.build
        classes[viewName] = proto;
      }
      return classes[viewName];
    }; // end of my.class
    return my;
  }; // end of views
  
  // -----------------------------
  // graphDB
  // @auth: <boolean>
  // @Editor
  // @graphId
  // -----------------------------
  var graphDB = function(params) {
    
    var debug = setDebug('graphDB', true);
    var myDB = {}, app, config, thenable,
        rootRef, storeRef, nodesRef, edgesRef,
        col, node, edge, files,
        graphId = params.graphId, // eg. diplogifts-1
        graphRoot = '/cope_user_apps/' + graphId + '/public',
        storeRoot = '/user_apps/' + graphId,
        myEditor = params.Editor,
        auth, authRequired = params.auth || false,
        signIn = function(_done) {
          // Auth to write
          //var email = account; //TBD: validate account //"chopssin@gmail.com";
          //var password = pwd;  //TBD: validate pwd     //"shmily@cope";
          
          debug('signIn', 'Run signIn');
          myEditor.openCopeAccount().res('try', function(pairs) {
            // Fetch from Editor
            var email = pairs.account,
                password = pairs.pwd,
                that = this;
            debug('signIn', pairs);
            app.auth().signInWithEmailAndPassword(email, password)
              .then(function() {
                that.ds({ 'ok': true });
                if (typeof _done == 'function') {
                  _done(app.auth().currentUser);
                }
              })
              .catch(function(err) {
                debug('signIn', err);
                that.ds({ 'error': err.code });
              });
          });
        }; // end of signIn

    // Config and construct firebase
    config = params.config;
    app = firebase.initializeApp(config);

    myDB.user = function() {
      var _thenable = {}, done;
      _thenable.then = function(_cb) { done = _cb; };
      
      app.auth().onAuthStateChanged(function(user) {
        if (!user) { 
          debug('User gone.');
          auth();
        } else {
          debug('User still alive.');
          if (typeof done == 'function') done(user);
        }
      });
      return _thenable;
    }; // end of myDB.user

    auth = function() { // _r: authIsRequired
      debug('auth', 'Auth the user');
      var user = app.auth().currentUser,
          _thenable = {}, done;

      debug(app.auth());
      _thenable.then = function(_cb) { done = _cb; };

      signIn(function(_user) {
        debug('auth', _user);
        if (typeof done == 'function') {
          done(_user);
        }
      });
      return _thenable;
    }; // end of auth


    // -----------------------------
    debug(graphId);
    rootRef = function() {
      return app.database().ref(graphRoot);
    };

    storeRef = function() {
      return app.storage().ref(storeRoot);
    };

    nodesRef = function() { return rootRef().child('_nodes') };
    edgesRef = function() { return rootRef().child('_edges') };
    
    thenable = function(_ref) {
      var _thenable = {}, that = this;
      _thenable.then = function(cb) {
        if (!_ref.then) return {};
        _ref.then(function(snap) {
          var __val = (snap && snap.val())
            ? snap.val() : null;
          return cb.call(that, __val);
        });
      };
      return _thenable;
    }; // end of thenable
    
    col = function(colName) {
      var myCol = {},
          nodesColRef = nodesRef().child(colName),
          colRef = rootRef().child(colName),
          newRef;
      if (colName.charAt(0) == '_') {
        return console.error('Invalid colName starting with "_"');
      }
      // _nodes._cols.<colName>: true
      nodesRef().child('_cols').child(colName).ref.set(true);

      myCol.add = function(_idKey) {
        if (!isNaN(_idKey)) _idKey = _idKey + '';
        if (typeof _idKey == 'string') {
          nodesColRef.child(_idKey).ref.set({
            createdAt: new Date().getTime()
          });
          return node(colName, _idKey);
        } else {
          if (_idKey) { console.warn('#add(key): invalid key = ' + _idKey); }
          newRef = nodesColRef.push();
          newRef.set({
            createdAt: new Date().getTime()
          });
          return node(colName, newRef.key);
        }
      }; // end of myCol.add
      
      // To find node by key
      myCol.get = function(_key) { 
        if (typeof _key != 'string') return {};
        return node(colName, _key);
      }; // end of myCol.get 

      myCol.getNodes = function() {
        var _thenable = {}, _ns = [];
        _thenable.then = function(cb) {
          cb = (typeof cb == 'function') 
            ? cb : function() {};
          rootRef()
            .child('_nodes').child(colName)
            .once('value')
            .then(function(snap) {
              if (snap.val()) {
                _ns = Object.keys(snap.val())
                  .map(function(_k) { 
                    return node(colName, _k);
                    //return {
                    //  node: _node,
                    //  data: snap.val()[_k]
                    //}; 
                  });
                cb(_ns);
              }
            });
        };
        return _thenable;
      };

      myCol.ref = function() {
        return rootRef().child(colName);
      };

      myCol.col = colName;

      return myCol;
    }; // end of col
    
    node = function(colName, nodeKey) {
      if (!colName || !nodeKey) return;
      var myNode = {},
          thenableWithCol,
          myNodesColRef = nodesRef().child(colName),
          myColRef = rootRef().child(colName);

      thenableFromCol = function(_colRef) {
        var _thenable = {}, that = this;
        _thenable.then = function(cb) {
          if (!_colRef.then) return {};
          _colRef.then(function(snap) {
            var fields = snap.val(), 
                vals = {}, count = 0;
            if (fields) {
              fields = Object.keys(fields)
                .map(function(_f) {
                  return _f;
                });
              fields.forEach(function(_field) {
                that.val(_field).then(function(val) {
                  count++;
                  if (val) vals[_field] = val;
                  if (count == fields.length) {
                    if (typeof cb != 'function') return;
                    if (Object.keys(vals).length === 0) vals = null;
                    return cb.call(that, vals);
                  }
                });
              }); // end of fields.forEach
            } // end of if
          }); // end of _colRef.then
        }; // end of _thenable.then
        return _thenable;
      }; // end of thenableFromCol
      myNode.val = function() {
        var args = arguments, that = this;

        switch (args.length) {
          case 0: // get all vals
            return thenableFromCol.call(that, myColRef.child('__fields').once('value'));
            break;
          case 1: 
            if (typeof args[0] == 'string') {
              // Get specific value by key
              return thenable.call(that, myColRef.child(args[0]).child(nodeKey).once('value'));
            } else if (typeof args[0] == 'object') {
              // Set multiple fields at once
              var _thenable = {}, saveVals;
              saveVals = function(_cb) {
                var _c = 0, _fs = Object.keys(args[0]);
                if (typeof _cb != 'function') _cb = function() {};

                _fs.forEach(function(_field) {
                  var _val = args[0][_field];
                  that.val(_field, _val).then(function() {
                    _c++; 
                    if (_c == _fs.length) {
                      _cb.call(myNode);
                    }
                  });
                });
              }
              saveVals(); // in case _thenable.then isn't called
              _thenable.then = function(_cb) {
                saveVals(_cb);
              };
              return _thenable;
            }
            break;
          case 2: // set specific value by key
            if (typeof args[0] != 'string') return;
            myColRef.child('__fields').child(args[0]).ref.set(true);
            return thenable.call(that, myColRef.child(args[0]).child(nodeKey).ref.set(args[1]));
            break;
        } // end of switch
      }; // end of myNode.val
      
      myNode.del = function(_isTrue) {
        var that = this;
        if (_isTrue === true) {
          myColRef.child('__fields').once('value').then(function(snap) {
            Object.keys(snap.val()).forEach(function(_f) {
              myColRef.child(_f).child(nodeKey).ref.set(null);
            });
          });
          return thenable.call(that, myNodesColRef.child(nodeKey).ref.set(null));
        }
      }; // end of myNode.del

      myNode.key = nodeKey;
      myNode.col = colName;
      return myNode;
    }; // end of node

    edge = function(edgeLabel) {
      var myEdge = {},
          startRef, find, add, remove;
      
      if (typeof edgeLabel != 'string') return null;
      startRef = edgesRef().child(edgeLabel);

      // _edges._labels.<label> : true
      edgesRef().child('_labels').child(edgeLabel).ref.set(true);

      // Set find based on 'from' or 'to'
      find = function(direction, _n) {
        var _thenable = {}, done;
        if (!_n.key || !_n.col) { return null; }

        _thenable.then = function(cb) {
          if (typeof cb == 'function') done = cb;
        };

        startRef.child(direction).child(_n.col).child(_n.key)
          .once('value')
          .then(function(snap) {
              // eg. <toCol>: <toKey>: true
              if (snap.val()) {
                var val = snap.val(),
                    objs = [];

                Object.keys(val).forEach(function(_col) {
                  Object.keys(val[_col]).forEach(function(_key) {
                    //objs.push({
                    //  col: _col,
                    //  key: _key
                    //});
                    objs.push(node(_col, _key));
                  });
                });
                if (typeof done == 'function') {
                  done.call(myEdge, objs);
                }
              } else {
                debug('edge.find', 'Found nothing in ' + edgeLabel);
                debug('edge.find', 'direction = ' + direction);
                debug('edge.find', _n);
              }
          }) // end of then
          .catch(function(err) {
            console.error(err);
          });
        return _thenable;
      }; // end of find

      remove = function(_from, _to) {
        if (!_from || !_from.col || !_from.key) return null;
        if (!_to || !_to.col || !_to.key) return null;
        var _thenable = {}, done;
        _thenable.then = function(_cb) {
          done = _cb;
        };

        startRef.child('from')
          .child(_from.col).child(_from.key)
          .child(_to.col).child(_to.key)
          .ref.set(null)
          .then(function() {
            startRef.child('to')
              .child(_to.col).child(_to.key)
              .child(_from.col).child(_from.key)
              .ref.set(null)
              .then(function() {
                if (typeof done == 'function') {
                  done();
                }
              });
          });
        return _thenable;
      }; // end of remove

      add = function(_from, _to) {
        if (!_from || !_from.col || !_from.key) return null;
        if (!_to || !_to.col || !_to.key) return null;

        var _thenable = {}, done;
        _thenable.then = function(_cb) {
          done = _cb;
        };
        
        startRef.child('from')
          .child(_from.col).child(_from.key)
          .child(_to.col).child(_to.key)
          .ref.set(true)
          .then(function() {
            startRef.child('to')
              .child(_to.col).child(_to.key)
              .child(_from.col).child(_from.key)
              .ref.set(true)
              .then(function() {
                if (typeof done == 'function') {
                  done();
                }
              });
          });
        return _thenable;
      }; // end of add

      myEdge.from = function(_n) {
        return find('from', _n);
      };

      myEdge.to = function(_n) {
        return find('to', _n);
      };

      myEdge.remove = remove;
      myEdge.add = add;
      return myEdge;
    }; // end of edge

    files = function() {
      var manager = {},
          saveCallback; // set by calling manager.save().then()
      manager.open = function(_path) {
        var _thenable = {}, openCallback,
            startRef = rootRef().child('_files');
        _thenable.then = function(cb) {
          if (typeof cb == 'function') {
            openCallback = cb;
          }
        };
           
        if (_path) {
          startRef = startRef.child(_path);
        }
        startRef.once('value').then(function(snap) {
          var val = snap.val();
          debug('files.open', val);
          openCallback(val);
        });
        return _thenable;
      };
      manager.save = function(_params) { // save a file per call
        var _thenable = {},
            uploadTask, saveCallback, 
            folder = _params.folder,
            timestamp = _params.timestamp + '',
            filename = _params.filename,
            file = _params.file,
            _path = [folder, timestamp, filename],
            path,
            err;

        _path = _path.map(function(x) {
          if (typeof x == 'string') {
            if (x.charAt(0) == '/') {
              x = x.slice(1);
            }
            x = x.replace(/\//g, '')
               .replace(/\s/g, '_')
               .replace(/\/|\\/g, '_')
               .replace(/\.|\#|\$|\[|\]/g, '_');
          } 
          if (!x) err = true;
          return x;
        });
        path = _path.join('/');

        debug('save', 'saving "' + path + '"');
        if (err) return console.err(_path);
        //-------------- Start the upload task
        uploadTask = storeRef()
          .child(_path[0]).child(_path[1]).child(_path[2])
          .put(file);
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
          function(snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                debug('files.save', 'Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                debug('files.save', 'Upload is running');
                break;
            }
          }, function(error) {
            switch (error.code) {
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;

              case 'storage/canceled':
                // User canceled the upload
                break;

              //... 

              case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
          }, function() {
            // Upload completed successfully, now we can get the download URL
            var downloadURL = uploadTask.snapshot.downloadURL;
        
            // Save the downloadURL
            rootRef().child('_files').child(path).ref.set(downloadURL)
              .then(function() {
                try {
                  saveCallback({
                    timestamp: timestamp,
                    path: path,
                    url: downloadURL
                  });
                } catch (err) {
                  console.error(err);
                }
              });
          }); // end of uploadTask.on
        //--------------

        // To set the saveCallback function
        _thenable.then = function(cb) {
          if (typeof cb == 'function') {
            saveCallback = cb;
          }
        };
        return _thenable;
      }; // end of manager.save

      manager.saveMany = function(paramsArr) {
        var _thenable = {}, that = this, objs = [],
            done;
        if (!Array.isArray(paramsArr)) return;

        debug('saveMany', 'Called.');
        paramsArr.forEach(function(x, idx) {
          var exec = function() {
            that.save(x).then(function(_obj) {
              debug('saveMany', 'idx = ' + idx);
              debug('saveMany', _obj);
              objs[idx] = _obj;
              if (objs.length == paramsArr.length) {
                debug('saveMany', 'Done.');
                // TBD: what if some fail to upload
                if (typeof done == 'function') {
                  done(objs);
                } else {
                  debug('saveMany done', done);
                }
              } 
            });
          }(); // end of exec
        }); // end of paramsArr.forEach
        
        _thenable.then = function(_done) {
          done = _done;
        };
        return _thenable;
      }; // end of manager.saveMany

      manager.del = function(_path) {
        var _thenable = {}, done;
        _thenable.then = function(_cb) {
          if (typeof _cb == 'function') done = _cb;
        };
        storeRef().child(_path).delete().then(function() {
          rootRef().child('_files').child(_path).ref.set(null)
            .then(function() {
              if (typeof done == 'function') done();
            });
        });
        return _thenable;
      }; // end of manager.del

      manager.delMany = function(arr) { // arr = [<string> path]
        var _thenable = {}, done, count = 0, that = this;
        _thenable.then = function(_cb) {
          if (typeof _cb == 'function') done = _cb;
        };
        try {
          arr.forEach(function(x) {
            that.del(x).then(function() {
              count++;
              debug('delMany count', count);
              if (count == arr.length) {
                if (typeof done == 'function') done();
              }
            });
          });
        } catch (err) { console.error(err); }
        return _thenable;
      };
      return manager;
    }; // end of files

    myDB.hasUser = function() {
      return !!app.auth().currentUser;
    };

    myDB.col = col;
    myDB.edge = edge;
    myDB.files = files;
    //myDB.removeNode = removeNode;
    myDB.rootRef = function() {
      console.warn('ref: deprecated use');
      return rootRef();
    };
    myDB.storeRef = function() {
      console.warn('storeRef: deprecated use');
      return storeRef();
    };
    //myDB.node = node;
    return myDB;
  }; // end of graphDB

  // -----------------------------
  // copeApp
  // -----------------------------
  var copeApp = function() {
    var debug = setDebug('copeApp', true);
    var my = {},
        app, 
        myViews, // where we store constructed Views
        myEditor, // where we store constructed Editor
        myGraphDB, // where we store constructed GraphDB
        //myGraphId, // id to construct GraphDB
        //config, // = params.config,
        //appName, // = params.appName,
        //path, // = params.path,
        pageProtos = {};

    //my.ref = function() {
      //return app.database().ref(appRoot);
      //return myGraphDB.rootRef();
    //};
    //my.storeRef = function() {
      //return app.storage().ref(storageRoot);
      //return myGraphDB.storeRef();
    //};
    my.setPage = function(_pageName, func) {
      // TBD: get type from server
      if (typeof _pageName == 'string'
          && typeof func == 'function') {
        pageProtos[_pageName] = func;
      }
    };
    my.usePage = function(_pageName) {
      debug('usePage - this.editable', this.editable);
      var func = pageProtos[_pageName];
      if (!func) return console.error('Failed to load page');
      if (this.editable) {
        try {
          my.useGraphDB().user().then(function(_user) {
            func.call(my);
          });
        } catch (err) { console.error(err); }
      } else {
        try {
          func.call(my);
        } catch (err) { console.error(err); }
      }
    }; // end of my.usePage
    
    my.useViews = function() {
      if (!myViews) { myViews = views(); }
      return myViews;
    };
    my.useEditor = function() {
      if (!myViews) { myViews = views(); }
      if (!myEditor) { myEditor = editor.call(my); }
      return myEditor; 
    };
    my.useUtil = function() {
      return util; // Utilities
    };
    my.useGraphDB = function(data) {
      //if (!myGraphDB) myGraphDB = graphDB({ config: config, graphId: gid, Editor: myEditor });
      if (myGraphDB) {
        return myGraphDB;
      } if (!myGraphDB && data) {
        debug('useGraphDB - init with data', data);
        data.Editor = myEditor;
        myGraphDB = graphDB(data);
        return myGraphDB;
      }  
      console.error('Fail to useGraphDB');
      return null;
    };
    my.build = function(params) {
      //var pageName, func, editable, config;
      //myGraphId = params.graphId;

      my.path = params.path;
      my.editable = params.editable;

      $.ajax({
        type: 'GET',
        url: '/cope-config'
      }).done(function(data) {
      
        my.appName = data.appName;

        // Init myGraphDB
        my.useGraphDB(data); 

        // Render the page
        my.usePage(params.page); 
      });

    };
    return my;
  }; // end of function copeApp

  window.copeApp = copeApp;
  window.dataSnap = dataSnap;
  //window.Views = views;

})(jQuery);
