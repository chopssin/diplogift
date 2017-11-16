(function($) {
var Phrases = {
  'ITEM_NAME': '品項名稱',
  'FROM': '致贈者',
  'TO': '受贈者',
  'NO': '錄案編號',
  'RECEIVED_DATE': '受贈日期',
  'RELATED_ITEMS': '交流禮品',
  'RELATED_EVENTS': '交流事件',
  'EXT_LINKS': '相關連結',
  'ITEMS': '禮品數位典藏庫',
  'EVENTS': '交流事件簿',
  'THE_ITEM': '交流禮品',
  'COL': '圖輯',
  'COVER_STORY': '封面故事',
  'RECENT': '近期',
  'RECOMMENDED': '推薦閱讀',
  'EVENTS_TITLE': '城市交流與活動',
  'EVENT_TITLE': '事件標題',
  'EVENT_CONTENT': '事件內文',
  'ITEMS_TITLE': '交流禮品',
  'NEXT': '下一步',
  'ADD_IMG': '新增圖片',
  'ADD_FROM_COL': '從圖庫新增',
  'PUBLISHED': '發布中',
  'UNPUBLISHED': '未發布',
  'BE_PUBLISHED_AT': '將發布於',
  'CONTENT': '內文',
  'UNTITLED': '未命名標題',
  'NO_CONTENT': '編輯內文',
  'NOT_SET': '未設定',
  'SET_COVER_STORY': '設為封面故事',
  'IS_COVER': '已設為封面故事',
  'REMOVE_PAGE': '移除本頁',
  'PUBLISH': '發布',
  'SET_PUBLISH_TIME': '設定發布時間',
  'REMOVE': '移除',
  'SET_COVER_IMG': '設為封面照片',
  'VIEW_IMAGES': '全部圖檔',
  'ADD_ITEM': '新增禮品',
  'ADD_EVENT': '新增交流事件',
  'ADD_LINK': '新增外部連結',
  'ADD_TEXT': '新增文字',
  'CLICK_TO_EDIT': '點我編輯',
  'LOAD_MORE': '更多',
  'NOW': '現在',
  'DAYS_LATER': '天之後',
  'UPLOAD': '上傳',
  'PAUSE': '暫停',
  'CANCEL': '取消',
  'YES': '確定'
};
  
var Dg = copeApp(),
    Views = Dg.useViews(),
    Editor = Dg.useEditor(),
    Util = Dg.useUtil(),
    redirect,
    pageRoot = '#page-container',
    coverView = Views.class('Cover'),
    cardView = Views.class('Card'),
    brickView = Views.class('Brick'),
    itemInfoView = Views.class('ItemInfo'),
    addObjZoneView = Views.class('AddObjZone'),
    //addEventZoneView = Views.class('AddEventZone'),
    //addExtZoneView = Views.class('AddExtZone'),
    blogView = Views.class('Blog'),
    textView = Views.class('Text'),
    toggleView = Views.class('Toggle'),
    gridsView = Views.class('Grids'),
    camrollView = Views.class('Camroll'),
    pageControlView = Views.class('PageControl'),
    editMainZoneView = Views.class('EditMainZone'),
    datepickerView = Views.class('Datepicker');


$(pageRoot)
  .addClass('container')
  .addClass('page-container');

redirect = function(t, dest) {
  if (!t || t > new Date().getTime()) {
    if (dest) {
      location.href = dest;
    }
    return true;
  }
  return false;
};

var doit = function() {
  console.log('do it');
  var now = new Date().getTime();
  Dg.ref().child('events').once('value')
    .then(function(snap) {
      evts = snap.val();
      Object.keys(evts).forEach(function(id) {
        //console.log(evts[id]);
        evts[id].publishedAt = now;
      });
      console.log(evts);
      Dg.ref().child('events').ref.set(evts);
    });
}; // end of doit

//  ### Page Types ###
//  # Playgroud
Dg.setPage('test', function() {
  var G = Dg.useGraphDB();
  var Items = G.col('items_v1_0'),
      Evts = G.col('events_v1_0'),
      Blog = G.col('blogs_v1_0');

  var testPage = Util.setTest('test page', false);
  testPage.run('migrate items\' abouts', function(log) {
    var now = new Date().getTime();
    var blogs = [], items = [], count_b = 0, count_i = 0;
    var readyB, readyI;
    var done = function() {
      if (!readyB || !readyI) return;
      log(blogs);
      log(items);
      
      items.forEach(function(x) {
        blogs.forEach(function(y) {
          if (Util.timeOf(y.tags.date).timestamp == x.date) {
            log(x.node.key + ' -> ' + y.node.key);
            log(x.name + ' -> ' + y.title);
            //var Abouts = G.edge('blogs');
            //Abouts.add(x.node, y.node);
          } 
        });
        log('<-------');
      });
    };

    Blog.getNodes().then(function(nodes) {
      nodes.forEach(function(node) {
        node.val().then(function(blog) {
          blog.node = node;
          blogs.push(blog);
          count_b++;
          if (count_b == nodes.length) {
            readyB = true;
            done();
          }
        });
      });
    });

    Items.getNodes().then(function(nodes) {
      nodes.forEach(function(node) {
        node.val().then(function(item) {
          item.node = node;
          items.push(item);
          count_i++;
          if (count_i == nodes.length) {
            readyI = true;
            done();
          }
        });
      });
    });
  }); // end of testPage

  Util.setTest('migrate events').run(function(log) {
    log('start');
    Evts.getNodes().then(function(nodes) {
      nodes.forEach(function(n) {
        n.val('_tmp').then(function(val) {
          if (!val) return;
          log(n.key);

          var date = n.key.split('_').shift();
          date = Util.timeOf(date).timestamp;
          log(date);

          n.val('date', date);
        });
      });
    });
  }); // end of test

  var testWithFiles = function() {
    Editor.getImages().then(function(res) {
      console.log(res);
    });
  };

  var migrateFiles = function() {
    G.rootRef().child('files').once('value').then(function(snap) {
      var val = snap.val();
      console.log(val);

      G.rootRef().child('_files').ref.set(snap.val());
    });
  };

  var migrateItems = function() {
    G.rootRef().child('items').once('value').then(function(snap) {
      var items = snap.val();
      Object.keys(items).forEach(function(key) {
        var item = items[key],
            display = item.images && item.images.display,
            arr = item.images && item.images.arr,
            date = null;

        console.log(key + ' - ' + item.name);
        if (item.receivedDate) {
          console.log(item.receivedDate);
          date = Util.timeOf(item.receivedDate).timestamp;
        }
 
        try { 
          Items.add(key).val({
            'name': item.name,
            'from': item.from,
            'to': item.to,
            'date': date,
            'img_arr': arr,
            'img_display': display,
            'publishedAt': item.publishedAt || null
          });
        } catch (err) {
          console.error(err);
        }
      });
    });
  }; // migrate 

}); // end of page "test"


//  # home
Dg.setPage('home', function() {

  var G = Dg.useGraphDB(),
      Items = G.col('items_v1_0'),
      Events = G.col('events_v1_0'),
      nodeCover = G.col('featurings').get('coverStory'),
      Cover = Views.class('Cover'),
      EditMainZone = Views.class('EditMainZone'),
      coverObj = {
        title: 'D I P L O G I F T',
        caption: 'We build better connections through these events and gifts.',
        //imgsrc: '/images/fallback/aca_night.jpg',
        href: '#'
      },
      vuCover,
      vuEvts,
      vuItems,
      editable = false,
      editMainHTML = '<section id="zone" class="edit-section"></section>', 
      sample1 = 'https://firebasestorage.googleapis.com/v0/b/cope-326d5.appspot.com/o/user_apps%2Fdiplogifts-1%2Fimages%2Fevents%2F361-01.jpg?alt=media&token=648e83f2-f5f3-4b4f-adea-654015a4f658',
      sample2 = 'https://firebasestorage.googleapis.com/v0/b/cope-326d5.appspot.com/o/user_apps%2Fdiplogifts-1%2Fimages%2Fitems%2F409_02.jpg?alt=media&token=eb2d0418-8966-4c8b-b0af-eb752831d9f6',
      aboutText = "<h3>關於網站</h3><p>臺南市不斷與世界各地城市有著各式交流活動，同時也接收到來自各方祝福，收受了各種獨特的公務禮物，但這些禮物過去都只被保存在市府內未曾公開。每個禮物背後都是曾經聯繫的故事，為了讓這些故事更為人所知，讓記憶得以延續，因此誕生了這個網站。</p><p>本網站由<a href=\"http://web.tainan.gov.tw/sec/\">台南市政府秘書處</a>特別企劃。</p>";
  aboutText = "<h3>關於網站</h3><p>臺南市不斷與世界各地城市有著各式交流活動，同時也接收到來自各方祝福，收受了各種獨特的公務禮物，但這些禮物過去都只被保存在市府內未曾公開。每個禮物背後都是曾經聯繫的故事，為了讓這些故事更為人所知，讓記憶得以延續，<a href=\"http://web.tainan.gov.tw/sec/\" target=\"_blank\">秘書處</a>特別建置了「台南市城市交流藝廊」，透過網路線上藝廊的方式來記錄這些禮物背後所蘊含致贈者的心意、文化交流成果及文化意涵，以期民眾及致贈者均能隨時隨地看見這些美麗又感動的時刻。</p>";

  //if (Dg.path.indexOf('edit') > -1) {
  if (this.editable) {
    editable = true;
    $('body').css('background', '#111');
    $('#nav a.logo').prop('href', '/edit');
  }

  $(pageRoot)
    .append('<div id="cover-story" class="col-xs-12"></div>')
    .append('<div id="about" class="col-xs-12"><div class="about-wrap row">'
        + '<div class=\"col-xs-12 col-md-6\"><div class=\"about-text\">' + aboutText + '</div></div>'
        + '<div class="col-xs-12 col-md-6 about-bg"></div>'
        + '</div></div>')
    .append('<div id="events" class="col-xs-12 col-sm-6"></div>')
    .append('<div id="items" class="col-xs-12 col-sm-6"></div>')
    .append('<div id="recommended" class="col-xs-12"></div>');
      
  
  if (editable) {
    $('body').css('background', '#111');
    
    $(pageRoot).prepend(editMainHTML);
    EditMainZone.build({ selector: '#zone' })
      .res('newItem', function(res) {
        Items.get(res.key).val().then(function(val) {
          if (val) { // already exists
            location.href = '/edit/items/' + res.key;
          } else { // create new one
            Items.add(res.key).val(res.obj).then(function() {
              location.href = '/edit/items/' + res.key;
            });
          }
        });
      })
      .res('newEvent', function(res) {
        Events.get(res.key).val().then(function(val) {
          if (val) { // already exists
            location.href = '/edit/events/' + res.key;
          } else { // create new one
            Events.add(res.key).val(res.obj).then(function() {
              location.href = '/edit/events/' + res.key;
            });
          }
        });
      });
  } // if editable

  // Cover story
  vuCover = Cover.build({
    view: 'CoverStory',
    selector: '#cover-story'
  });
  vuCover.ds(coverObj);

  nodeCover.val().then(function(val) {
    val = val[0];
    if (val) {

      var objNode = G.col(val.col).get(val.key);
      objNode.val().then(function(_nval) {
        if (redirect(_nval.publishedAt)) return;
        var href = '';
        if (val.col == 'items_v1_0') href = '/items/' + val.key;
        if (val.col == 'events_v1_0') href = '/events/' + val.key;
        if (editable) href = '/edit' + href;

        vuCover.ds({
          title: Phrases.COVER_STORY,
          caption: _nval.name || _nval.title,
          imgsrc: _nval.img_display,
          href: href
        });
      });
    }
  });

  // Events and Items
  vuEvts = Cover.build({
    selector: '#events',
    data: { 
      href: '/events',
      title: Phrases.EVENTS,
      imgsrc: sample1
    }
  });
  vuItems = Cover.build({
    view: 'CoverStory',
    selector: '#items',
    data: { 
      href: '/items',
      title: Phrases.ITEMS,
      imgsrc: sample2
    }
  });

  if (editable) {
    vuEvts.ds({ href: '/edit/events' });
    vuItems.ds({ href: '/edit/items' });
  }
}); // end of page "home"

//  # items
Dg.setPage('items', function() {
  var debug = Util.setDebug('page items', false);
  var G = Dg.useGraphDB(),
      Items = G.col('items_v1_0'),
      Card = Views.class('Card'),
      editable = false,
      fetchDS = dataSnap(),
      findDS = dataSnap(),
      renderDS = dataSnap(),
      now = new Date().getTime();
      //items = {};

  // Show `Home` link in nav
  showNav();
  
  //if (Dg.path.indexOf('edit') > -1) {
  if (this.editable) {
    editable = true;
    $('body').css('background', '#111');
    $('#nav a.logo').prop('href', '/edit');
  }

  fetchDS.load(function() {
    Items.getNodes().then(function(nodes) {
      // Sort by key
      var ks = [],
          itemNodes = [],
          min = [];
      
      // Convert key, eg. 12-21-test -> [12, 21, -1]
      nodes.forEach(function(n, i) { 
        var _r = {};
        _r.val = (n.key + '-0').split('-').map(function(x) {
          var _num = parseInt(x);
          return !isNaN(_num) ? _num : 999999;
        });
        _r.idx = i;
        ks.push(_r);
      });

      // Sort items by keys
      for (var i = 0; i < ks.length; i++) {
        min[i] = ks[i]; 
        if (i == ks.length -1) {
          min[i] = ks[i];
          break;
        }
        for (var j = i+1; j < ks.length; j++) {
          var segs = Math.max(min[i].val.length, ks[j].val.length),
              minGreater = false;
          // Comparison of the keys
          for (var k = 0; k < segs; k++) {
            var a = min[i].val[k] || 0, 
                b = ks[j].val[k] || 0;
            if (a > b) {
              minGreater = true; 
              break;
            } else if (a < b) {
              break;
            }
          } 
          if (minGreater) {
            var tmp = {};
            tmp.val = min[i].val;
            tmp.idx = min[i].idx
            min[i] = ks[j];
            ks[j] = tmp;
          } 
        }
      }
      itemNodes = min.map(function(x) {
        return nodes[x.idx];
      });
      findDS.update({ nodes: itemNodes });
      findDS.load();
    }); // end of then
  }); // end of fetchDS

  // Find all items
  findDS.load(function() {
    var nodes = this.val().nodes,
        items = [],
        count = 0;
    nodes.forEach(function(n, i) {
      n.val().then(function(val) {
        items[i] = val;
        items[i].no = nodes[i].key;
        count++;

        if (count == nodes.length) {
          renderDS.update({ items: items });
          renderDS.load();
        } 
      });
    });
  });

  renderDS.load(function() {
    var items = this.val().items,
        now = new Date().getTime();
    
    $(pageRoot).append('<div id="all" class="row"></div>');
    if (!editable) {
      items = items.reduce(function(arr, item) {
        if (item.publishedAt && (item.publishedAt <= now)) {
          arr.push(item);
        }
        return arr;
      }, []);
    } else {
      $(pageRoot).prepend('<div id="unpublished" class="row bottom-bar" style="margin-bottom: 16px;">'
        + '<h3 class="color-w">' + Phrases.UNPUBLISHED + '</h3></div>');
      $('#all').prepend('<h3 class="color-w">' + Phrases.PUBLISHED + '</h3>');
    }

    items.forEach(function(item, count) {
      var id = item.no,
          display = item.img_display, 
          vuItem,
          root = '#all',
          _pubAt = Phrases.NOT_SET;
      if (!item.publishedAt 
        || item.publishedAt > now) {
        root = '#unpublished';
      } 
      if (item.publishedAt) { 
        _pubAt = Util.timeOf(item.publishedAt).fullDate;
      }
      $(root).append('<div id="item-' + count + '" ' 
        + 'class="col-xs-12 col-sm-6 col-md-4 col-lg-3">'
          + '<p class="color-w w240">' + _pubAt + '</p>'
        + '</div>');

      debug('items', display);
      vuItem = Card.build({
        selector: '#item-' + count,
        method: 'append',
        data: {
          title: 'No. ' + id,
          caption: item.name,
          href: '/items/' + id,
          centered: true,
          imgsrc: display
        }
      }); // end of Card.build
      if (editable) {
        vuItem.ds({ href: '/edit/items/' + id });
      }
    }); // end of items.forEach
  }); // end of renderDS.load

  fetchDS.load();
  return;
}); // end of page "items"

// # events
Dg.setPage('events', function() {
  var G = Dg.useGraphDB(),
      Events = G.col('events_v1_0'),
      fetchDS = dataSnap(),
      renderDS = dataSnap(),
      Card = Views.class('Card'),
      vuCards = [],
      now = new Date().getTime(),
      editable = false,
      unpub_section;

  // Show `Home` link in nav
  showNav();
  
  //if (Dg.path.indexOf('edit') > -1) {
  if (this.editable) {
    editable = true;
    $('body').css('background', '#111');
    $('#nav a.logo').prop('href', '/edit');
  }

  unpub_section = '<div class="col-xs-12">' 
    + '<h3 id="title-unpub" class="color-w">' + Phrases.UNPUBLISHED + '</h3>'
    + '<div id="unpublished" class="col-xs-12"></div>'
  + '</div>';
  $(pageRoot).html('<div id="events" class="row">'
    + (editable ? unpub_section : '')
    + '<div class="col-xs-12">' 
      + '<h3 id="title-pub" class="' + (editable ? 'color-w':'hidden') + '">' 
        + Phrases.PUBLISHED + '</h3>'
      + '<div id="all" class="col-xs-12"></div>'
    + '</div>'
  + '</div>');

  fetchDS.load(function() {
    var evts = [], count = 0;
    Events.getNodes().then(function(nodes) {
      nodes.forEach(function(n, i) {
        n.val().then(function(evt) {
          evt.href = '/events/' + n.key;
          if (editable) evt.href = '/edit' + evt.href;
          evts.push(evt);
          count++;
          if (count == nodes.length) {
            renderDS.update({ evts: evts });
            renderDS.load();
          }
        });
      });
    });
  });

  renderDS.load(function() {
    var evts = this.val().evts;
    evts = evts.sort(function(a, b) {
      b = b.date || 0;
      a = a.date || 0;
      return b - a;
    });
    evts.forEach(function(evt, i) {
      var root = '#all',
          _pubAt = Phrases.NOT_SET;
      if (!evt.publishedAt || evt.publishedAt > now) {
        if (editable) {
          root = '#unpublished';   
        } else {
          return;
        }
      } 
      if (evt.publishedAt) {
        _pubAt = Util.timeOf(evt.publishedAt).fullDate;
      }
      $(root).append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3" style="margin-top:16px">'
        + '<p class="color-w w240">' + _pubAt + '</p>'
        + '<div id="evt-' + i + '"></div></div>');
      vuCards.push(Card.build({
        sel: '#evt-' + i, method: 'append',
        data: {
          type: 'event',
          centered: true,
          imgsrc: evt.img_display,
          title: Util.timeOf(evt.date).fullDate,
          caption: evt.title,
          href: evt.href
        }
      }));
    });
  }); // end of renderDS.load
      
  fetchDS.load();
}); // end of Dg.setPage('events')

//  # item-single
Dg.setPage('item-single', function(params) {
  var G = Dg.useGraphDB(),
      Items = G.col('items_v1_0'),
      Blogs = G.col('blogs_v1_0'),
      Events = G.col('events_v1_0'),
      Exts = G.col('exts_v1_0'),
      Related = G.edge('related'),
      Links = G.edge('ext_links'),
      Abouts = G.edge('blogs'),
      fetchDS = dataSnap(),
      renderDS = dataSnap(),
      query = Dg.path,
      editable = false,

      Card = Views.class('Card'),
      Info = Views.class('ItemInfo'),
      Camroll = Views.class('Camroll'),
      Brick = Views.class('Brick'),
      PageControl = Views.class('PageControl'),
      AddObjZone = Views.class('AddObjZone'),
      vuCard, vuInfo, vuCamroll, vuPC;
      itemId = Dg.path.split('/').reverse()[0],
      itemNode = Items.get(itemId),
      nodeCover = G.col('featurings').get('coverStory');

  // Show `Home` link in nav
  showNav();

  if (this.editable) {
    editable = true;
    $('#nav a.logo').prop('href', '/edit');
    $('body').css({
      'color': '#eee',
      'background-color': '#111'
    });
  }

  $(pageRoot).html(''
  + '<div class="row">'
    + '<div id="page-control" class="col-xs-12 color-b"></div>'
  + '</div>'
  + '<div class="row">'
    + '<div id="card" class="col-xs-12 col-sm-4"></div>'
    + '<div class="col-xs-12 col-sm-8">'
      + '<div id = "info"></div>'
      + '<div id = "addText"></div>'
      + '<div id = "blogs"></div>'
    +'</div>'
  + '</div>'
  + '<div class="row">'
    + '<div class="col-xs-12 col-sm-4"><div class="row">'
      + '<div class="col-xs-12">'
        + '<h3 id="title-evts" class="hidden">' + Phrases.RELATED_EVENTS + '</h3>' 
        + '<div id="add-event"></div>'
        + '<div id="events"></div>'
      + '</div>'
      + '<div class="col-xs-12">'
        + '<h3 id="title-exts" class="hidden">' + Phrases.EXT_LINKS + '</h3>' 
        + '<div id="add-ext"></div>'
        + '<div id="exts"></div>'
      + '</div>'
    + '</div></div>'
    + '<div class="col-xs-12 col-sm-8"><div class="row">'
      + '<div class="col-xs-12">'
        + '<h3 id="title-col" class="hidden" style="text-align:center">' + Phrases.COL + '</h3>' 
        + '<div id="camroll"></div>'
      + '</div>'
    + '</div></div>'
  + '</div>'
  + '');
  
  if (editable) {
    $('h3.hidden').removeClass('hidden');
    
    // Page control
    vuPC = PageControl.build({
      selector: '#page-control'
    }).res('setAsCoverStory', function() {
      nodeCover.val('0', {
        col: itemNode.col,
        key: itemNode.key
      }).then(function() {
        vuPC.ds({ 'isCover': true });
      });
    }).res('removePage', function() {
      itemNode.del(true).then(function() {
        location.href = "/edit/items";
      });
    }).res('publishAt', function(stamp) {
      itemNode.val('publishedAt', stamp);
    });

    // Check whether the item is the cover story
    nodeCover.val().then(function(val) {
      if (val && val[0] 
          && val[0].col == itemNode.col
          && val[0].key == itemNode.key) {
        vuPC.ds({ isCover: true });
      }
    });
    
    // To add events
    AddObjZone.build({
      selector: '#add-event',
      data: {
        placeholders: ['2016-11-5_jf93jsk'],
        addText: Phrases.ADD_EVENT
      }
    }).res('next', function(vals) {
      if (!vals[0]) return;
      var evtNode = Events.get(vals[0]);
      Related.add(evtNode, itemNode);
      fetchDS.load('events');
    });

    // To add ext links
    AddObjZone.build({
      selector: '#add-ext',
      data: {
        placeholders: ['Google', 'http://example.com/path'],
        addText: Phrases.ADD_LINK
      }
    }).res('next', function(vals) {
      if (!vals[0] || !vals[1]) return;
      var urlKey = vals[1].replace(/\/|\.|\#|\$/g, '_'),
          extNode = Exts.add(urlKey);
      extNode.val('title', vals[0]);
      extNode.val('url', vals[1]);
      Links.add(itemNode, extNode);
      fetchDS.load('exts');
    });

    $('#addText').append('<div class="w600" style="margin-top:16px; margin-bottom:16px"><button id="add-new-text" '
      + 'class="btn btn-default">' + Phrases.ADD_TEXT + '</button></div>');
    $('#add-new-text').off('click').on('click', function() {
      var blog = G.col('blogs_v1_0').add();
      blog.val({
        text: Phrases.CLICK_TO_EDIT,
        publishedAt: new Date().getTime()
      }).then(function() {
        G.edge('blogs').add(itemNode, blog).then(function() {
          console.log('load new text');
          fetchDS.load('blogs');
        });
      });
    });
  } // end of if (editable)

  fetchDS.load('item', function() {
    itemNode.val().then(function(val) {
      if (!editable) redirect(val.publishedAt, '/items');
      val.no = itemNode.key;
      renderDS.update({ item: val });
      renderDS.load('item');
    });
  }); 

  fetchDS.load('blogs', function() {
    var count = 0, textVals = [];
    $('#blogs').html('');
    G.edge('blogs').from(itemNode).then(function(nodes) {
      nodes.forEach(function(node) {
        node.val().then(function(blog) {
          blog.node = node;
          textVals.push(blog);
          count++;
          if (count == nodes.length) {
            renderDS.update({ textVals: textVals });
            renderDS.load('blogs');
          }
        }); //end of node.val ... then
      }); //end of nodes.forEach
    }); // end of G.edge('blogs') ...
  }); // end of fetchDS "blogs"
  renderDS.load('blogs', function() {
    var vals = this.val().textVals;
    console.log(vals);
    vals = vals.sort(function(a, b) {
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return a.publishedAt - b.publishedAt;
    });
    vals.forEach(function(blog) {
      var node = blog.node;
      Views.class('Text').build({
        sel: '#blogs',
        method: 'append',
        data: {
          editable: editable,
          node: node,
          text: blog.text
        }
      }).res('remove', function() {
        var that = this;
        G.edge('blogs').remove(itemNode, node).then(function() {
          node.del(true).then(function() {
            that.$el().fadeOut(300);
          });
        });
      }); // end of Text.res
    }); // end of vals.forEach
  });

  fetchDS.load('events', function() {
    Related.to(itemNode).then(function(nodes) {
      console.log(nodes);
      renderDS.update({ events: nodes });
      renderDS.load('events');
    });
  });
  fetchDS.load('exts', function() {
    Links.from(itemNode).then(function(nodes) {
      console.log(nodes);
      renderDS.update({ exts: nodes });
      renderDS.load('exts');
    });
  });

  renderDS.load('item', function() {
    var item = this.val().item,
        //events = this.val().events || [],
        images = [];
    
    // Update Page-control
    if (vuPC) {
      vuPC.ds({ publishedAt: item.publishedAt });
    }

    // Build the card
    vuCard = Card.build({
      selector: '#card',
      data: { 
        title: 'No. ' + item.no,
        caption: item.name,
        imgsrc: item.img_display,
        href: '#'//'/items/' + item.no 
      }
    });
    
    // Build the info block
    vuInfo = Info.build({
      selector: '#info',
      data: { 
        itemNode: itemNode,
        no: 'No. ' + item.no,
        name: item.name,
        from: item.from,
        to: item.to,
        date: item.date,
        editable: editable,
        vuCard: vuCard
      }
    });

    // Build the camroll
    vuCamroll = Camroll.build({
      selector: '#camroll',
      method: 'append',
      data: { 
        editable: editable,
        mode: 'wide'
        //cardDS: vuCard.ds()
      }
    });
    vuCamroll.res('setAsDisplay', function(_data) {
      vuCard.ds({ imgsrc: _data });
      itemNode.val('img_display', _data);
    });
    vuCamroll.res('updateImages', function(newArr) {
      itemNode.val('img_arr', newArr);
      if (!item.img_display) {
        itemNode.val('img_display', newArr[0]);
        vuCard.ds({ imgsrc: newArr[0] });
      }
    });

    // Update the camroll and imagesDS
    if (item.img_arr) {
      $('#title-col').removeClass('hidden');
      //item.img_arr.forEach(function(p) {
      //  images.push({ src: p });
      //});
      
      // Set the first img as initial display
      if (!item.img_display) {
        if (item.img_arr[0]) {
          itemNode.val('img_display', item.img_arr[0]);
          vuCard.ds({ imgsrc: item.img_arr[0] });
        }
      }
      vuCamroll.ds({ images: item.img_arr });
    }
    //if (editable) {
      //vuCamroll.ds({ 
        //editable: true,
        //mode: ' '
        //refPath: query
      // });
    //}
  }); // end of renderDS.load('item')

  renderDS.load('events', function() {
    var evtNodes = this.val().events;
    if (!evtNodes || evtNodes.length < 1) return;

    $('#title-evts').removeClass('hidden');
    $('#events').html('');
    vuEvents = [];
    evtNodes.forEach(function(n, idx) {
      n.val().then(function(val) {
        var evt = val,
            vuEvt;

        if (!editable && redirect(val.publishedAt)) return;
        vuEvt = Card.build({
          selector: '#events',
          method: 'append',
          data: {
            editable: editable,
            key: n.key,
            type: 'event',
            title: evt.title,
            href: (editable? '/edit' : '') + '/events/' + n.key,
            imgsrc: evt.img_display
          }
        }).res('remove', function() {
          Related.remove(n, itemNode);
        });
      });
    }); // end of evtNodes.forEach
  }); // end of renderDS.load('events')

  renderDS.load('exts', function() {
    var extNodes = this.val().exts,
        vuExts = [],
        count = 0;
    if (!extNodes || extNodes.length < 1) return;

    $('#title-exts').removeClass('hidden');
    $('#exts').html('');
    vuEvents = [];
    extNodes.forEach(function(n, idx) {
      n.val().then(function(ext) {
        Brick.build({
          sel: '#exts',
          method: 'append',
          data: {
            editable: editable,
            key: n.key,
            title: ext.title,
            url: ext.url
          }
        }).res('remove', function() {
          Links.remove(itemNode, n);
        });
      });
    }); // end of evtNodes.forEach
  }); // end of renderDS.load('exts')

  fetchDS.load();
  return;
}); // end of page "item-single"

Dg.setPage('event-single', function() {
  var G = Dg.useGraphDB(),
      Events = G.col('events_v1_0'),
      Items = G.col('items_v1_0'),
      Exts = G.col('exts_v1_0'),
      Related = G.edge('related'),
      Links = G.edge('ext_links'),
      nodeCover = G.col('featurings').get('coverStory'),
      fetchDS = dataSnap(),
      renderDS = dataSnap(),
      PageControl = Views.class('PageControl'),
      Blog = Views.class('Blog'),
      Camroll = Views.class('Camroll'),
      Card = Views.class('Card'),
      Brick = Views.class('Brick'),
      AddObjZone = Views.class('AddObjZone'),
      vuBlog, vuCard, vuCamroll, vuPC,
      vuItems = [], vuBricks = [],
      now = new Date().getTime(),
      editable = false,
      eventId,
      nodeEvt;

  // Show `Home` link in nav
  showNav();

  //if (query.indexOf('edit') > -1) {
  if (this.editable) {
    //query = query.slice(query.indexOf('edit') + 4);
    editable = true;
    $('#nav a.logo').prop('href', '/edit');
    $('body').css({
      'color': '#eee',
      'background-color': '#111'
    });
  }
  console.log(this);
  eventId = this.path.split('/').pop();
  nodeEvt = Events.get(eventId);

  $(pageRoot).html('<div class="row">'
    + '<div id="page-control" class="col-xs-12 color-b"></div>'
  + '</div>'
  + '<div class="row">'
    + '<div id="card" class="hidden-xs hidden-sm col-md-4"></div>'
    + '<div id="blog" class="col-xs-12 col-md-8"></div>'
  + '</div>'
  + '<div class="row">'
    + '<div class="col-xs-12 col-sm-4"><div class="row">'
      + '<div class="col-xs-12">'
        + '<h3 id="title-items" class="hidden">' + Phrases.RELATED_ITEMS + '</h3>'
        + '<div id="add-item"></div>'
        + '<div id="items"></div>'
      + '</div>'
      + '<div class="col-xs-12">' 
        + '<h3 id="title-exts" class="hidden">' + Phrases.EXT_LINKS + '</h3>'
        + '<div id="add-ext"></div>'
        + '<div id="exts"></div>'
      + '</div>'
    +'</div></div>'
    + '<div class="col-xs-12 col-sm-8">'
      + '<h3 id="title-images" class="hidden">' + Phrases.COL + '</h3>'
      + '<div id="images"></div>'
    + '</div>'
  + '</div>');

  if (editable) {
    $('h3.hidden').removeClass('hidden');

    // Page control
    vuPC = PageControl.build({
      selector: '#page-control'
    }).res('setAsCoverStory', function() {
      nodeCover.val('0', {
        col: nodeEvt.col,
        key: nodeEvt.key
      }).then(function() {
        vuPC.ds({ 'isCover': true });
      });
    }).res('removePage', function() {
      nodeEvt.del(true).then(function() {
        location.href = "/edit/events";
      });
    }).res('publishAt', function(stamp) {
      nodeEvt.val('publishedAt', stamp);
    });

    // Check whether the item is the cover story
    nodeCover.val().then(function(val) {
      if (val && val[0] 
          && val[0].col == nodeEvt.col
          && val[0].key == nodeEvt.key) {
        vuPC.ds({ isCover: true });
      }
    });
    
    // To add items
    AddObjZone.build({
      selector: '#add-item',
      data: {
        placeholders: ['123 or 123-1'],
        addText: Phrases.ADD_ITEM
      }
    }).res('next', function(vals) {
      if (!vals[0]) return;
      var nodeItem = Items.get(vals[0]);
      Related.add(nodeEvt, nodeItem);
      fetchDS.load('items');
    });

    // To add ext links
    AddObjZone.build({
      selector: '#add-ext',
      data: {
        placeholders: ['Google', 'http://example.com/path'],
        addText: Phrases.ADD_LINK
      }
    }).res('next', function(vals) {
      if (!vals[0] || !vals[1]) return;
      var urlKey = vals[1].replace(/\/|\.|\#|\$/g, '_'),
          nodeExt = Exts.add(urlKey);
      nodeExt.val('title', vals[0]);
      nodeExt.val('url', vals[1]);
      Links.add(nodeEvt, nodeExt);
      fetchDS.load('exts');
    });
  }

  fetchDS.load('event', function() {
    nodeEvt.val().then(function(evt) {
      
      if (!editable) redirect(evt.publishedAt, '/events');

      renderDS.update({ evt: evt });
      renderDS.load('card');
      renderDS.load('blog');
      renderDS.load('images');
      // Update Page-control
      if (vuPC) {
        vuPC.ds({ publishedAt: evt.publishedAt });
      }
    });
  }); // end of fetchDS "event"

  renderDS.load('card', function() {
    var evt = this.val().evt;
    vuCard = Card.build({
      sel: '#card',
      data: {
        type: 'event',
        imgsrc: evt.img_display,
        title: Util.timeOf(evt.date).fullDate,
        caption: evt.title,
        href: '#'
      }
    });
  }); // end of renderDS "card"

  renderDS.load('blog', function() {
    var evt = this.val().evt;
    Blog.build({
      sel: '#blog',
      data: {
        editable: editable,
        node: nodeEvt,
        title: evt.title,
        content: evt.content
      }
    }).res('titleChanged', function(newTitle) {
      vuCard.ds({ caption: newTitle });
    });
  }); // end of renderDS "blog"

  renderDS.load('images', function() {
    var evt = this.val().evt;
    if (evt.img_arr && evt.img_arr.length) {
      $('#title-images').removeClass('hidden');
    }
    Camroll.build({
      sel: '#images',
      data: {
        editable: editable,
        images: evt.img_arr,
        mode: editable ? ' ' : 'wide'
      }
    }).res('setAsDisplay', function(url) {
      vuCard.ds({ imgsrc: url });
      nodeEvt.val('img_display', url);
    }).res('updateImages', function(newArr) {
      nodeEvt.val('img_arr', newArr);
      if (!evt.img_display) {
        nodeEvt.val('img_display', newArr[0]);
        vuCard.ds({ imgsrc: newArr[0] });
      }
    });
  }); // end of renderDS "images"

  fetchDS.load('items', function() {
    var count = 0, items = [];
    G.edge('related').from(nodeEvt).then(function(nodes) {
      nodes.forEach(function(n) {
        n.val().then(function(item) {
          if (!editable && redirect(item.publishedAt)) return;
          count++;
          item.no = 'No. ' + n.key;
          item.node = n;
          item.href = '/items/' + n.key; 
          if (editable) { item.href = '/edit' + item.href; }
          items.push(item);
          if (count == nodes.length) {
            renderDS.update({ items: items });
            renderDS.load('items');
          }
        });
      });
    });
  }); // end of fetchDS "items"

  renderDS.load('items', function() {
    var items = this.val().items;
    $('#items').html('');
    if (items.length) {
      $('#title-items').removeClass('hidden');
    }
    items.forEach(function(item, i) {
      var vuCard = Card.build({
        sel: '#items', method: 'append',
        data: {
          editable: editable,
          imgsrc: item.img_display,
          title: item.no,
          caption: item.name,
          href: item.href
        }
      }).res('remove', function() {
        Related.remove(nodeEvt, item.node);
      }); // end of Card.build ... .res
    });
  }); // end of renderDS "items"

  fetchDS.load('exts', function() {
    var count = 0, exts = [];
    Links.from(nodeEvt).then(function(nodes) {
      nodes.forEach(function(n) {
        n.val().then(function(ext) {
          ext.node = n;
          exts.push(ext);
          count++;
          if (count == nodes.length) {
            renderDS.update({ exts: exts });
            renderDS.load('exts'); 
          }
        });
      });
    });
  });

  renderDS.load('exts', function() {
    var exts = this.val().exts;
    exts.forEach(function(ext) {
      Brick.build({
        sel: '#exts', method: 'append',
        data: {
          editable: editable,
          title: ext.title,
          url: ext.url
        }
      }).res('remove', function() {
        console.log('remove ext');
        Links.remove(nodeEvt, ext.node);
      });
    });
  });

  fetchDS.load();
}); // end of page "event-single"

Dg.setPage('_event-single', function() {
  var inner, eventId,
      Blog = Views.class('Blog'),
      Camroll = Views.class('Camroll'),
      Card = Views.class('Card'),
      Brick = Views.class('Brick'),
      AddObjZone = Views.class('AddObjZone'),
      //AddExtZone = Views.class('AddExtZone'),
      PageControl = Views.class('PageControl'),
      vuBlog, 
      vuCamroll, 
      vuPC,
      vuItems = [],
      vuBricks = [],
      extsDS = dataSnap(),
      itemsDS = dataSnap(),
      query = Dg.path,
      editable = false;

  // Show `Home` link in nav
  showNav();

  if (query.indexOf('edit') > -1) {
    query = query.slice(query.indexOf('edit') + 4);
    editable = true;
    $('#nav a.logo').prop('href', '/edit');
    $('body').css({
      'color': '#eee',
      'background-color': '#111'
    });
  }
  eventId = query.slice(query.indexOf('events/') + 7);

  inner = '<article id="blog" class="event-post bottom-bar"></article>'
    + '<div id="related-items" class="event-post row">' 
      + '<h3 id="h3-items" class="hidden">' + Phrases.RELATED_ITEMS + '</h3>'
      + '<div class="" id="items-control"></div>'
      + '<div class="" id="items"></div>'
    + '</div>'
    + '<div id="related-exts" class="event-post row">' 
      + '<h3 id="h3-exts" class="hidden">' + Phrases.EXT_LINKS + '</h3>'
      + '<div class="" id="exts-control"></div>'
      + '<div class="" id="exts"></div>'
    + '</div>';
  $(pageRoot).html('<div id="page-control"></div>' 
    + '<div id="event-page" class="row">' + inner + '</div>');

  vuBlog = Blog.build({
    selector: '#blog',
    data: { 
      editable: editable,
      node: false
    }
  });

  if (editable) {
    // Build PageControl
    vuPC = PageControl.build({
      selector: '#page-control'
    });
    Dg.ref().child('cover').once('value')
      .then(function(snap) {
      if (snap.val().objId == ('events/' + eventId)) {
        vuPC.ds({ isCover: true });
      }
    }); // end of Dg

    // Fallback text 
    vuBlog.ds({
      title: Phrases.UNTITLED,
      content: Phrases.CLICK_TO_EDIT
    });

    // Show all titles
    $('h3.hidden').removeClass('hidden');

    // To add new items
    AddObjZone.build({
      selector: '#items-control',
      data: {
        refPath: query + '/itemIds',
        placeholder: '123',
        addText: Phrases.ADD_ITEM,
        updateDS: itemsDS
      }
    });
    
    // To add external links
    AddExtZone.build({
      selector: '#exts-control',
      data: { 
        col: 'events',
        id: eventId,
        updateDS: extsDS
      }
    }); 
  } // end of if (editable)

  vuCamroll = Camroll.build({
    selector: vuBlog.sel('@images'),
    data: { 
      mode: 'wide',
      editable: editable,
      refPath: query
    }
  });
  //vuCamroll.ds('dataDS', imagesDS);

  // Get items
  itemsDS.load('fetch', function() {
    var itemIds;
    $('#items').html('');
    Dg.ref().child(query).once('value')
      .then(function(snap) {
      itemIds = snap.val().itemIds;
      // Set item Cards
      if (itemIds) {
        $('#h3-items').removeClass('hidden');
      }
      Object.keys(itemIds).forEach(function(itemId, idx) {
        $('#items').append('<div id="item-' + idx+ '"'
          + ' class="col-xs-12 col-sm-6"></div>');
        Dg.ref().child('items').child(itemId).once('value')
          .then(function(itemSnap) {
          var item = itemSnap.val(),
              vuItem;
          var vuItem = Card.build({
            selector: '#items #item-' + idx,
            data: {
              itemId: itemId,
              title: 'No. ' + itemId,
              caption: item.name,
              href: '/items/' + itemId,
              imgsrc: item.images && item.images.display
            }
          });
          if (editable) vuItem.ds({ href: '/edit/items/'+ itemId });
          vuItems.push(vuItem);
          itemsDS.load('editable');
        }); // end of Dg...items...
      }); // end of Object.keys...
    }); // end of Dg
  }); // end of itemsDS.load('fetch')
  itemsDS.load('editable', function() {
    if (!editable) return;

    vuItems.forEach(function(v) {
      v.$el('@link').prepend('<button data-component="rmBtn"'
        + ' class="btn btn-danger btn-rm">' 
        + Phrases.REMOVE + '</button>');
      v.$el('@rmBtn').unbind('click').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var itemId = v.val('itemId');
        Dg.ref().child(query).child('itemIds')
          .ref.child(itemId).set(null).then(function() {
          v.$el().fadeOut(300);
        }); // end of Dg
      }); // end of v.$el('@emBtn') ...
    }); // end of vuItems.forEach
  }); // end of itemsDS.load('editable')

  // Get external links
  extsDS.load('fetch', function() {
    Dg.ref().child(query).once('value')
      .then(function(snap) {
      var extLinks = snap.val().extLinks
      vuBricks = [];
      $('#exts').html('');
      if (extLinks) {
        $('#h3-exts').removeClass('hidden');
        Object.keys(extLinks).forEach(function(extId) {
          var brick = Brick.build({
            selector: '#exts',
            method: 'append',
            data: {
              title: extLinks[extId].title,
              url: extLinks[extId].url,
              refPath: query + '/extLinks/' + extId
            }
          });
          vuBricks.push(brick);
        });
      } 
      extsDS.load('editable');
    }); // end of Dg
  }); // end of extsDS.load .. 'fetch'
  extsDS.load('editable', function() {
    if (!editable) return;
    $('#h3-exts').removeClass('hidden');
    vuBricks.forEach(function(v) {
      v.$el().append('<button data-component="rmBtn"' 
        + ' class="btn btn-danger right">' 
        + Phrases.REMOVE + '</button>');
      v.$el('@rmBtn').unbind('click').click(function(e) {
        e.preventDefault();
        Dg.ref().child(v.val('refPath'))
          .ref.set(null)
          .then(function() {
          //extsDS.load('fetch');
          v.$el().fadeOut(300);
        }); // end of Dg
      });
    }); 
  }); // end of extsDS.load .. "editable"
  
  // Load items and exts
  itemsDS.load('fetch');
  extsDS.load('fetch');

  // Get event data
  Dg.ref().child(query)
    //.orderByChild('publishedAt')
    //.endAt(new Date().getTime())
    .once('value')
    .then(function(snap) {
    
    var evt = snap.val(),
        now = new Date().getTime(),
        itemIds = evt.itemIds || {},
        evtDisplay = evt.images && evt.images.display,
        imagesArr = evt.images && evt.images.arr || [],
        images = [],
        isPublished = !(evt.publishedAt > new Date().getTime());
    images = imagesArr.map(function(url) {
      return { src: url };
    });
      
    // Set the first img as initial display
    if (!evtDisplay) {
      if (imagesArr[0]) {
        Dg.ref().child(query).child('images/display')
          .ref.set(imagesArr[0])
      }
    }
    
    if (!editable && (!evt.publishedAt || evt.publishedAt > now)) {
      // TBD: 404
      location.href = '/events';
    }
    
    // Update blog
    vuBlog.ds({
      title: evt.title,
      content: evt.content
    });
    
    // Update images
    vuCamroll.ds({
      images: images
    });
    
    // Update vuPC
    vuPC.ds({
      publishedAt: snap.val().publishedAt,
      coverObj: {
        objId: 'events/' + eventId,
        title: snap.val().title,
        imgsrc: evtDisplay,
        href: '/events/' + eventId
      }
    });
  }); // end of Dg...Dg.path...: fetch event data
}); // end of page "event-single"

Dg.setPage('media.images', function() {
  var Grids = Views.class('Grids'),
      renderDS = dataSnap(),
      fetchDS = dataSnap();

  $('#nav a.logo').prop('href', '/edit');
  $('body').css('background', '#111')
    .css('color', '#fff');

  // Show `Home` link in nav
  showNav();

  fetchDS.load(function() {
    Editor.getImages().then(function(res) {
      renderDS.update({ images: res.images, timestamps: res.timestamps });
      renderDS.load();
    });
  }); //end of mainDS.load

  renderDS.load(function() {
    var val = this.val(),
        vuGrids = {};
    console.log(val);
    
    $(pageRoot).html('<button id="uploadBtn" class="btn btn-primary">' 
      + Phrases.UPLOAD + '</button>');

    // Set uploadBtn
    $('body').on('click.upload', '#uploadBtn', function() {
      Editor.openImageUploader({
        multi: true,
      }).res('done', function(imgArr) { // <- arr of [{ timestamp, url, thumb, path }]
        location.href = '/edit/images';
      }); // end of Editor.open
    }); // end of #uploadBtn
    
    // Set each group of images
    val.timestamps.forEach(function(t, i) {
      var _t = Util.timeOf(t);
      $(pageRoot).append('<div class="row row-images" id="row-' + t + '">'
          + '<h4>' + _t.fullDate + ' ' + _t.fullTime + '</h4>'
          + '<button id="remove-all-' + t + '" '
          + 'class="btn btn-danger">' + Phrases.REMOVE + '</button>'
        + '</div>');
      $('#row-' + t).css({ 'margin-bottom': '40px' });
      $('#remove-all-' + t).off('click').on('click', function() {
        $('#row-' + t).fadeOut(300);

        // Remove images by timestamp
        var imgArr = vuGrids[t + ''].val('imgArr');
        if (!imgArr) return;
        Editor.delImages(imgArr).then(function() {
          // Do nothing, the view will disappear itself
        });
      });
      
      vuGrids[t + ''] = Grids.build({
        selector: '#row-' + t,
        method: 'append'
      });
    });

    // Update images in each vuGrid
    val.images.forEach(function(img) { 
      var vu = vuGrids[img.timestamp + ''],
          imgs = vu.val('images') || [];
          imgArr = vu.val('imgArr') || [];
      imgs.push({ src: img.url, thumb_src: img.thumb });
      imgArr.push(img);
      vu.ds({ 'images': imgs, imgArr: imgArr });
    });

    return;

    $(pageRoot).html('<button id="uploadBtn" class="btn btn-primary">' 
      + Phrases.UPLOAD + '</button>');
    groups.forEach(function(g, i) {
      var t = Util.timeOf(parseInt(g.key));
      $(pageRoot).append('<div class="row row-images" id="row-' + i + '">'
          + '<h4>' + t.fullDate + ' ' + t.fullTime + '</h4>'
          + '<button id="remove-all-' + i + '" '
          + 'class="btn btn-danger">' + Phrases.REMOVE + '</button>'
        + '</div>');
      $('#row-' + i).css({ 'margin-bottom': '40px' });
      Grids.build({
        selector: '#row-' + i,
        method: 'append',
        data: { images: g.images }
      });
      // Set the remove button
      // to remove all the files in the folder of <timestamp>
      $('#remove-all-' + i).off('click').on('click', function() {
        var ts = t.timestamp,
            path = t.path;

        $('#row-' + i).fadeOut(300);
        console.log(g);
        g.files.forEach(function(img) {
          console.log('Removing "' + img.path + '"');


          //TBD: Editor.removeImage(img.path);

          return;
          Dg.storeRef().child(img.path).delete()
            .then(function() {
              Dg.ref().child('_files').child(img.path)
                .ref.set(null)
                .catch(function(err) {
                  console.error(err);
                });
            })
            .catch(function(err) {
              console.error(err);
            }); // end of Eg
        }); // end of g.images.forEach
      }); // end of #remove-all-[i].click
    }); // end of groups.forEach

    // Set uploadBtn
    $('body').on('click.upload', '#uploadBtn', function() {
      Editor.openImageUploader({
        multi: true,
      }).res('done', function(imgArr) {
        // TBD
        console.log(imgArr);
        var urls = imgArr.map(function(x) { return x.url; });
        images = images.concat(urls);
        that.ds({ images: images });
        that.res('updateImages', images);
      }); // end of Editor.open
    }); // end of #uploadBtn
  }); // end of renderDS.load
  fetchDS.load();
}); // end of page "media.images"
/*Dg.setPage('edit-main', function() {
  var EditMainZone = Views.class('EditMainZone');
  $('body').css({ 'background-color': '#111' });
  $(pageRoot).append(''
    + '<section id="zone" class="edit-section"></section>' 
    + '<section id="contents" class="edit-section">Contents</section>' 
    + '<section id="files" class="edit-section">Files</section>' 
    + '');

    + '<section id="zone" class="edit-section"></section>' 
  vuEditMainZone = EditMainZone.build({ selector: '#zone' });

}); // end of page "edit-main"
*/

//  ### Views ###

//  # Cover 
coverView.dom(function() {
  return '<div' + this._ID + 'class="big-cover bg-brown">' 
    + '<a data-component="link" class="mask">' 
      + '<div data-component="text"></div>'
    + '</a>' 
  + '</div>';
}); // end of coverView.dom
coverView.render(function() { // for title and caption
  var title = this.val('title'),
      caption = this.val('caption'),
      h3_title = '',
      p_caption = '';
  if (title || caption) {
    h3_title = title 
      ? '<h3>' + title + '</h3>'
      : '';
    p_caption = caption
      ? '<p>' + caption + '</p>'
      : '';
    this.$el('@text').html(h3_title + p_caption).show();
  }
}); // end of coverView.render
coverView.render(function() { // for cover image and link
  var data = this.ds('dataDS').val(),
      imgsrc = data.imgsrc || this.val('imgsrc'),
      href = data.href || this.val('href');
  if (imgsrc) {
    this.$el().css('background-image', 'url("' + imgsrc + '")'); 
  } 
  if (href) {
    this.$el('@link').prop('href', href);
  }
}); // end of coverView.render

//  # Card
cardView.dom(function() {
  var centered = this.val('centered') ? 'centered' : '',
      href = this.val('href'),
      imgsrc = this.val('imgsrc');
  return '<div' + this._ID + '>'
    + '<a data-component="link" class="card-link ' + centered + '" '
    + 'href="' + href + '">' 
      + '<div class="link-cover bg-slight">' 
        + '<img data-component="display" class="center-cropped" width="100%"' 
        + ' onerror="this.style.display=\'none\'"'
        + ' onload="this.style.display=\'block\'"'
        + ' src="' + imgsrc + '">'
      + '</div>'
      + '<div data-component="sleeve" class="link-description color-w">' 
        + '<div data-component="title" class="title"></div>'
        + '<div data-component="caption" class="caption"></div>'
      + '</div>'
    + '</a>'
  + '</div>';
}); // end of cardView.dom
cardView.render(function() {
  var data = this.ds('dataDS').val(),
      imgsrc = data.imgsrc || this.val('imgsrc'),
      href = data.href || this.val('href'),
      title = data.title || this.val('title'),
      caption = data.caption || this.val('caption'),
      type = data.type || this.val('type');
  if (imgsrc) {
    this.$el('@display').prop('src', imgsrc);
  }
  if (href) {
    this.$el('@link').prop('href', href);
  }
  if (title) {
    this.$el('@title').html(title);
  }
  if (caption) {
    this.$el('@caption').html(caption);
  }
  if (type == 'event') {
    this.$el('@sleeve')
      .addClass('event-type')
      .addClass('bg-green');
  } else {
    this.$el('@sleeve').addClass('bg-brown');
  }
}); // end of cardView.render
cardView.render(function() { // editable
  if (!this.val('editable')) { return; }
  var that = this;
  this.$el('@link').prepend('<button data-component="rmBtn"'
    + ' class="btn btn-danger btn-rm">' 
    + Phrases.REMOVE + '</button>');
  this.$el('@rmBtn').unbind('click').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    that.res('remove');
    that.$el().fadeOut(300);
  });
}); // end of cardView.render for editable

//  # Brick
brickView.dom(function() {
  var title = this.val('title'),
      url = this.val('url');
  return '<a' + this._ID + 'class="brick-link bg-brown" target="_blank"'
    + ' href="' + url + '">' + title + '</a>';
}); // end of brickView.dom
brickView.render(function() { // for editable
  if (!this.val('editable')) { return; }
  var that = this;

  this.$el().append('<button data-component="rmBtn"' 
    + ' class="btn btn-danger right">' 
    + Phrases.REMOVE + '</button>');
  this.$el('@rmBtn').unbind('click').click(function(e) {
    e.preventDefault();
    that.$el().fadeOut(300);
    that.res('remove');
  });
}); // end of brickView.render

//  # Toggle
toggleView.dom(function() {
  return '<div' + this._ID + ' class="toggle-sections">' 
    + '<ul data-component="toggle" class="toggle yearly"></ul>' 
    + '<div data-component="sections" class="sections yearly"><div>'
  +'</div>';
}); // end of toggleView.dom
toggleView.render(function() {
  var listItems = this.val('listItems'),
      defaultIndex = this.val('default'),
      that = this;
  if (Array.isArray(listItems)) {
    listItems.forEach(function(li, idx) {
      var each_li = '<li data-component="li-' + idx + '">' + li + '</li>';
      var each_sec = '<div data-component="sec-' + idx + '"></div>';

      that.$el('@toggle').append(each_li);
      that.$el('@sections').append(each_sec);

      that.$el('@li-' + idx).unbind('click').click(function() {
          that.$el('@toggle').children('li').removeClass('activated');
          that.$el('@sections').children('div').hide();
          that.$el('@sec-' + idx).fadeIn(300);
          $(this).addClass('activated');
      });
    });
      
    // Show the default section
    that.$el('@sections').children('div').hide();
    if (defaultIndex) {
        that.$el('@li-' + defaultIndex).click();
    } else {
        that.$el('@li-0').click();
    }
  } // end of if (Array.isArray ...
}); // end of toggleView.render

//  # ItemInfo
itemInfoView.dom(function() {
  return '<div' + this._ID + '>'
    + '<ul class="item-page-ul">'
      + '<li class="title color-darkred" data-component="no"></li>'
      + '<li data-component="name"></li>'
      + '<li data-component="title-from" class="title color-darkred hidden">' 
        + Phrases.FROM 
      + '</li>'
      + '<li data-component="from"></li>'
      + '<li data-component="title-to" class="title color-darkred hidden">' 
        + Phrases.TO 
      + '</li>'
      + '<li data-component="to"></li>'
      + '<li data-component="title-date" class="title color-darkred hidden">' 
        + Phrases.RECEIVED_DATE 
      + '</li>'
      + '<li data-component="date"></li>'
    + '</ul>'
    + '</div>';
}); // end of itemInfoView.dom
itemInfoView.render(function() {
  var that = this,
      itemNode = that.val('itemNode');
  ['no', 'name', 'from', 'to', 'date'].forEach(function(x) {
    var _val = that.val(x);
    if (x == 'date') _val = Util.timeOf(_val).fullDate;
    if (_val) {
      that.$el('@title-' + x).removeClass('hidden');
      that.$el('@' + x).html(_val);
    }
  });

  // For Editor
  var fields = [{
    name: 'name',
    label: Phrases.ITEM_NAME,
    val: that.val('name')
  }, {
    name: 'from',
    label: Phrases.FROM,
    val: that.val('from')
  }, {
    name: 'to',
    label: Phrases.TO,
    val: that.val('to')
  }, {
    name: 'date',
    label: Phrases.RECEIVED_DATE,
    val: that.val('date')
  }]

  this.update({ fields: fields });
  
}); // end of itemInfoView.render

// Editable part
itemInfoView.render(function() { // append another render func
  var vuCard = this.val('vuCard'),
      editable = this.val('editable'),
      itemNode = this.val('itemNode'),
      fields = this.val('fields'),
      that = this;
  if (!editable) return;

  fields.forEach(function(x) {
    that.$el('@' + x.name).off('click').on('click', function() {
      Editor.openWriter({
        label: x.label,
        node: itemNode, 
        field: x.name,
        useDate: (x.name == 'date')
      }).res('newVal', function(newVal) {
        var ups = {};
        ups[x.name] = newVal;
        that.ds(ups);
            
        //Update the item card
        if (x.name == 'name') {
          vuCard.ds({ caption: newVal });
        }
      }); // end of Editor.open ... res 
    });
  }); // end of [ ... ].forEach
}); // end of itemInfoView.render

//  # Grids
gridsView.dom(function() {
  return '<div' + this._ID + '>' 
    + '<div data-component="total"></div>'
    + '<div data-component="grids" class="row"></div>'
    + '<div class="col-xs-12"><button data-component="load-more"'
    + ' class="btn btn-default hidden color-b">'
      + Phrases.LOAD_MORE
    + '</button></div>'
  + '</div>';
}); // end of gridsView
gridsView.render(function() {
  var images = this.val('images'),
      cursor = this.val('cursor') || 0,
      limit = this.val('limit') || 6,
      reload = this.val('reload') || false,
      hasMore = images && images.length 
        ? (cursor + limit < images.length) 
        : false,
      imagesHTML = '',
      that = this,
      $total = that.$el('@total');
      makePhoto = function(idx, src) {
        var img = new Image(); 
        img.onload = function() {
        that.$el('@img-' + idx).html(img);
          img.style.display = 'block';
        };
        img.src = src;
        img.style.display = 'none';
        return '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">' 
            + '<div style="margin-bottom:15px"'
            + ' class="img-full squared" data-component="img-' + idx + '">'
            //+ '<img src="' + src + '">'
            //+ src.slice(121)
            + '</div>'
          + '</div>';
      };
  
  if (!Array.isArray(images)) return;
  if (reload) this.$el('@grids').html('');
  if (hasMore) {
    this.$el('@load-more').removeClass('hidden');
  } else {
    this.$el('@load-more').addClass('hidden');
  }

  $total.html('<h4>共 ' + images.length + ' 張</h4>');
  that.$el('@grids').html('');
  images.forEach(function(img, i) {
    if (i < cursor || i > (cursor + limit - 1)) { return; }
        
    // Append preview thumbnails
    that.$el('@grids').append(makePhoto(i, img.thumb_src || img.src));
    
    // Feature: click to view the original
    that.$el('@img-' + i)
      .off('click')
      .on('click', function() {
      Editor.open({
        use: 'ImageViewer',
        data: { src: img.src }
      }); 
    });
  });

  // Set load more button
  this.$el('@load-more').off('click').on('click', function() {
    that.ds({ limit: 2000 });
  });
}); // end of gridsView.render

//  # Camroll
camrollView.dom(function() {
  return '<div' + this._ID + '>' 
    + '<div data-component="control" class="camroll-control"></div>'
    + '<div data-component="wall"></div>'
  + '</div>';
}); // end of camrollView.dom
camrollView.render(function() {
  //var data = //this.ds('dataDS').val(),
  var images = this.val('images'),
      imagesHTML = '',
      mode = this.val('mode') || '';
      makePhoto = function(idx, src) {
        return '<div class="centered photo-frame ' + mode + '" data-component="img-' + idx + '">'
          + '<div class="photo-frame-bar color-b hidden">'
            + '<button class="hidden" data-component="displayBtn-'+idx+'">' + Phrases.SET_COVER_IMG + '</button>'
            + '<button class="hidden" data-component="rmBtn-'+idx+'">' + Phrases.REMOVE + '</button>'
          + '</div>'
          + '<div class="photo-frame-img">'
            + '<img width="100%" src="' + src + '">'
          + '</div>'
        + '</div>';
      };
  if (!Array.isArray(images)) {
    images = [];
  }
  images.forEach(function(img_src, idx) {
    imagesHTML = imagesHTML + makePhoto(idx, img_src); 
  });
  this.$el('@wall').html(imagesHTML);
}); // end of camrollView.render
camrollView.render(function() {
  //var dataDS = this.ds(), //this.ds('dataDS'),
  //cardDS = this.val('cardDS'),
      //data = dataDS.val(),
  var editable = this.val('editable'),
      //refPath = this.val('refPath'),
      images = this.val('images'),
      that = this;
  if (!editable) { return; }
  if (!Array.isArray(images)) { images = []; }
  that.$el().find('.photo-frame-bar').removeClass('hidden');
  images.forEach(function(x, idx) {
    that.$el('@img-' + idx).off('mouseenter, mouseleave')
      .on('mouseenter', function() {
        $(this).find('button').removeClass('hidden');
      })
      .on('mouseleave', function() {
        $(this).find('button').addClass('hidden');
      });
    that.$el('@displayBtn-' + idx).unbind('click')
      .click(function() {
        //cardDS.update({ imgsrc: images[idx].src });
        $('body').animate({ scrollTop: 0 });
        that.res('setAsDisplay', x);
        return;
    });
    that.$el('@rmBtn-' + idx).unbind('click')
      .click(function() {
      var $pic = that.$el('@img-' + idx),
          removed = images.splice(idx, 1);

      //that.ds({ images: images });
      $pic.fadeOut(200);
      that.res('updateImages', images);
      return; 
      // dataDS.update({ images: images });
      // Update images.arr
      //Dg.ref().child(refPath + '/images/arr')
      //  .ref.set(updatedArr)
      //  .then(function() {
      //  $pic.fadeOut(300);
      //});
    });
  }); // end of images.forEach

  that.$el('@control').html(''
    + '<button data-component="addImageBtn"'
    + ' class="btn btn-default">'+ Phrases.ADD_IMG + '</button>' 
    + '<button data-component="addFromColBtn"'
    + ' class="btn btn-default">'+ Phrases.ADD_FROM_COL + '</button>' 
    + '');
  // Set add image button
  that.$el('@addImageBtn').unbind('click')
    .click(function() {

      Editor.openImageUploader({
        multi: true,
      }).res('done', function(imgArr) {
        // TBD
        var urls = imgArr.map(function(x) { return x.url; });
        images = images.concat(urls);
        that.ds({ images: images });
        that.res('updateImages', images);
      }); // end of Editor.open

    return;

    Editor.open({
      use: 'ImageUploader',
      data: {
        multi: true,
        callback: function(urls) {
          console.log(urls);
          if (!urls) return;
          
          images = images.concat(urls);
          that.ds({ images: images });
          that.res('updateImages', images);
          return; 
          //Dg.ref().ref.child(refPath).child('images/arr').set(updatedArr);
          //images = images.concat(urls.map(function(u) { return { src: u }; }));
          //that.ds({ images: images });
        }
      }
    });
  }); // end of that.$el..'@addImageBtn' ...

  // Set add-from-col button
  that.$el('@addFromColBtn').off('click').on('click', function() {
    Editor.openImages({
      multi: true 
    }).res('selected', function(selected) {
      images = images.concat(selected.map(function(x) {
        return x.img.url;
      }));
      that.ds({ images: images });
      that.res('updateImages', images);
    });
    return;
  });
}); // end of camrollView.render

/*  

//  # AddEventZone
addEventZoneView.dom(function() {
  return '<div' + this._ID + ' class="color-b">'
    + '<button data-component="add" class="btn btn-default">' 
      + Phrases.ADD_EVENT + '</button>'
    + '<button data-component="cancel" class="btn btn-default hidden">' 
      + Phrases.CANCEL + '</button>'
    + '<div data-component="panel" class="hidden">' 
      + '<input type="text" placeholder="2016-4-13/v0q01dz">' 
      + '<button data-component="next" class="btn btn-primary">'
        + Phrases.NEXT + '</button>'
    + '</div>'
  + '</div>';
}); //end of addEventZoneView.dom
addEventZoneView.render(function() {
  var $add = this.$el('@add'),
      $cancel = this.$el('@cancel'),
      $next = this.$el('@next'),
      $panel = this.$el('@panel'),
      $input = this.$el('input'),
      id = this.val('id'),
      //eventsDS = this.val('eventsDS'),
      callback = this.val('callback'),
      that = this;
  if (!id) return;

  $add.unbind('click').click(function() {
    $add.addClass('hidden');
    $cancel.removeClass('hidden');
    $panel.removeClass('hidden');
  });
  $cancel.unbind('click').click(function() {
    $add.removeClass('hidden');
    $cancel.addClass('hidden');
    $panel.addClass('hidden');
  });
  $next.unbind('click').click(function() {
    var newVal = $input.val().trim().replace(/\//g, '');
    
    $add.removeClass('hidden');
    $cancel.addClass('hidden');
    $panel.addClass('hidden');
    $input.val('');
    if (typeof callback == 'function') {
      callback({
        newVal: newVal
      });
    }
    return;
    //Dg.ref().child('items').child(id)
    //  .child('eventIds')
    //  .ref
    //  .child(newVal).set(true)
    //  .then(function() {
    //  eventsDS.load('fetch');
    //}); // end of Dg...

  });
}); // end of addEventZoneView.render

*/

//  # AddObjZoneZone
addObjZoneView.dom(function() {
  var addText = this.val('addText'),
      placeholder = this.val('placeholder');
  return '<div' + this._ID + ' class="color-b">'
    + '<button data-component="add" class="btn btn-default">' 
      + addText + '</button>'
    + '<button data-component="cancel" class="btn btn-default hidden">' 
      + Phrases.CANCEL + '</button>'
    + '<div data-component="panel" class="hidden">' 
      + '<div data-component="inputs"></div>'
      + '<button data-component="next" class="btn btn-primary">'
        + Phrases.NEXT + '</button>'
    + '</div>'
  + '</div>';
}); //end of addObjZoneView.dom
addObjZoneView.render(function() {
  var $add = this.$el('@add'),
      $cancel = this.$el('@cancel'),
      $next = this.$el('@next'),
      $panel = this.$el('@panel'),
      $inputs = this.$el('@inputs'),
      placeholders = this.val('placeholders'), // Array
      num = 0,
      textInput,
      //updateDS = this.val('updateDS'),
      //refPath = this.val('refPath'),
      that = this;
  //if (!refPath || !updateDS) return;
  textInput = function(_c, _p) {
    return '<input data-component="' + _c 
      + '" type="text" placeholder="' + _p + '"></input>';
  };

  num = placeholders.length || 0;
  $inputs.html('');
  for (var i = 0; i < num; i++) {
    $inputs.append(textInput('input-'+i, placeholders[i]));
  }

  $add.unbind('click').click(function() {
    $add.addClass('hidden');
    $cancel.removeClass('hidden');
    $panel.removeClass('hidden');
  });
  $cancel.unbind('click').click(function() {
    $add.removeClass('hidden');
    $cancel.addClass('hidden');
    $panel.addClass('hidden');
  });
  $next.unbind('click').click(function() {
    var vals = [];
    placeholders.forEach(function(x, i) {
      vals[i] = that.$el('@input-' + i).val().trim();
      that.$el('@input-' + i).val('');
    });
    $add.removeClass('hidden');
    $cancel.addClass('hidden');
    $panel.addClass('hidden');

    that.res('next', (vals || []));
  });
}); // end of addObjZoneView.render

/*  # AddExtZone
addExtZoneView.dom(function() {
  return '<div' + this._ID + ' class="color-b">'
    + '<button data-component="add" class="btn btn-default">' 
      + Phrases.ADD_LINK + '</button>'
    + '<button data-component="cancel" class="btn btn-default hidden">' 
      + Phrases.CANCEL + '</button>'
    + '<div data-component="panel" class="hidden" style="padding:15px 0">' 
      + '<input data-component="title" type="text" placeholder="Title">' 
      + '<input data-component="url" type="text" placeholder="http://">' 
      + '<button data-component="next" class="btn btn-primary">'
        + Phrases.NEXT + '</button>'
    + '</div>'
  + '</div>';
}); //addExtZoneView.dom
addExtZoneView.render(function() {
  var $add = this.$el('@add'),
      $cancel = this.$el('@cancel'),
      $next = this.$el('@next'),
      $panel = this.$el('@panel'),
      $title = this.$el('@title'),
      $url = this.$el('@url'),
      updateDS = this.val('updateDS'),
      col = this.val('col'),
      id = this.val('id'),
      that = this;
  if (!id || !updateDS || !col) return;

  $add.unbind('click').click(function() {
    $add.addClass('hidden');
    $cancel.removeClass('hidden');
    $panel.removeClass('hidden');
  });
  $cancel.unbind('click').click(function() {
    $add.removeClass('hidden');
    $cancel.addClass('hidden');
    $panel.addClass('hidden');
  });
  $next.unbind('click').click(function() {
    var timestamp = new Date().getTime().toString(36),
        newTitle = $title.val().trim().replace(/\//g, '_'),
        newUrl = $url.val().trim(),
        newVal = {};
    if (!newTitle || !newUrl) return;

    newVal.title = newTitle;
    newVal.url = newUrl;
    Dg.ref().child(col).child(id)
      .child('extLinks/' + timestamp)
      .ref
      .set(newVal)
      .then(function() {
      updateDS.load('fetch');
    }); // end of Dg...

    $add.removeClass('hidden');
    $cancel.addClass('hidden');
    $panel.addClass('hidden');
    $title.val('');
    $url.val('');
  });
});//addExtZoneView.render*/

//  # EditMainZone
editMainZoneView.dom(function() {
  return '<div' + this._ID + ' class="edit-main-zone">' 
    + '<div data-component="btns">' 
      + '<button data-component="itemBtn" class="btn btn-default">' 
        + Phrases.ADD_ITEM + '</button>'
      + '<button data-component="eventBtn" class="btn btn-default">' 
        + Phrases.ADD_EVENT + '</button>'
      + '<button data-component="viewImagesBtn" class="btn btn-default">' 
        + Phrases.VIEW_IMAGES + '</button>'
    + '</div>'
    + '<div data-component="new-item" style="display:none">' 
      + '<button class="btn btn-default cancel">'
        + Phrases.CANCEL + '</button>'
      + '<h4>' + Phrases.ADD_ITEM + '</h4>'
      + '<input type="text" placeholder="123">'
      + '<button data-component="item-next" class="btn btn-primary">'
        + Phrases.NEXT + '</button>'
    + '</div>'
    + '<div data-component="new-event" style="display:none">' 
      + '<button class="btn btn-default cancel">' 
        + Phrases.CANCEL + '</button>'
      + '<h4>' + Phrases.ADD_EVENT + '</h4>'
      + '<div data-component="date-picker"></div>'
      + '<button data-component="event-next" class="btn btn-primary">' 
        + Phrases.NEXT + '</button>'
    + '</div>'
    + '<div data-component="edit-place"></div>'
  + '</div>';
});// end of editMainZoneView.dom
editMainZoneView.render(function() {
  var that = this,
      Datepicker = Views.class('Datepicker'),
      vuDate;
  
  // Build date picker for the publish form
  vuDate = Datepicker.build({
    selector: this.sel('@date-picker'),
    data: { 
      start: 2010, 
      allowPast: true, 
      span: (new Date().getFullYear() - 2010)
    }
  });

  this.$el('@itemBtn').unbind('click').click(function() {
    that.$el('@btns').hide();
    that.$el('@new-item').fadeIn(300);
    that.$el('@new-event').hide();
  });
  this.$el('@eventBtn').unbind('click').click(function() {
    that.$el('@btns').hide();
    that.$el('@new-item').hide();
    that.$el('@new-event').fadeIn(300);
  });
  this.$el('@viewImagesBtn').unbind('click').click(function() {
    location.href = '/edit/images';
  });
  this.$el().find('button.cancel').unbind('click')
    .click(function() {
    that.$el('@btns').fadeIn(300); 
    that.$el('@new-item').hide();
    that.$el('@new-event').hide();
  });
  // Set "new event"
  this.$el('@event-next').unbind('click').click(function() {
    var newKey = Util.timeOf(vuDate.val('timestamp')).fullDate
                  .split('/').join('-');
          //that.$el('@new-event').find('input').val().trim(),
        stamp = new Date().getTime().toString(36),
        newEventObj = {
          title: Phrases.UNTITLED,
          content: Phrases.CLICK_TO_EDIT,
          date: vuDate.val('timestamp')
        };
    that.res('newEvent', {
      key: newKey + '_' + stamp,
      obj: newEventObj
    });
    return;
    //Dg.ref().child('events').child(val + '_' + stamp)
    //  .ref.set(newEventObj)
    //  .then(function() {
    //  location.href = '/edit/events/' + val + '_' + stamp;
    //}); //end of Dg
  });
  // Set "new item"
  this.$el('@item-next').unbind('click').click(function() {
    var newKey = that.$el('@new-item').find('input').val().trim(),
        newItemObj = {
          name: Phrases.CLICK_TO_EDIT,
          from: Phrases.CLICK_TO_EDIT,
          to: Phrases.CLICK_TO_EDIT,
          date: new Date().getTime()
        };

    that.res('newItem', {
      key: newKey,
      obj: newItemObj
    });
    return;
    /*itemRef = Dg.ref().child('items').child(val);
    itemRef.once('value').then(function(snap) {
      if (snap.val()) {
        location.href = '/edit/items/' + val;
      } else {
        itemRef.ref.set(newItemObj).then(function() {
          location.href = '/edit/items/' + val;
        });
      }
    });*/

  });
});// end of editMainZoneView.render

datepickerView.dom(function() {
  return '<div' + this._ID + 'class="color-b">'
    + '<select data-component="year"></select>'
    + '<select data-component="month"></select>'
    + '<select data-component="date"></select>'
  + '</div>';
}); // datepickerView.dom
datepickerView.render(function() {
  var start = this.val('start'), // start year
      span = this.val('span'), // year span
      allowPast = this.val('allowPast'),
      defaultDate = this.val('defaultDate'),// yyyy-mm-dd
      def_yyyy, def_m, def_d,
      min, max,
      $year = this.$el('@year'), 
      $month = this.$el('@month'),
      $date = this.$el('@date'),
      that = this,
      now = new Date(),
      opts,
      getTime;

  // To get timestamp and update the data
  getTime = function() {
    var _y, _m, _d, _stamp;
    _y = parseInt($year.val()),
    _m = parseInt($month.val()),
    _d = parseInt($date.val()),
    _stamp = new Date(_y, _m - 1, _d).getTime(),
    that.update({
      year: _y,
      month: _m,
      date: _d,
      timestamp: _stamp
    });
    that.res('getTime', _stamp);
    return _stamp;
  }; // end of getTime

  if (!defaultDate) {
    var _now = Util.timeOf(now.getTime());
    def_yyyy = _now.year;
    def_m = _now.month;
    def_d = _now.date;
  }
  if (!start) start = now.getFullYear();
  if (!span) span = 0;
  min = start;
  max = start + span;

  opts = function(start, end, map) {
    var options = '';
    if (!map) map = function(_i) { return _i; };
    for (var i = start; i <= end; i++) {
      options = options 
        + '<option value="' + i + '">' 
        + map(i) + '</option>';
    }
    return options;
  };
  if (typeof min != 'number'
      || typeof max != 'number') return;
  if (min > max) {
    var tmp = min;
    min = max;
    max = tmp;
  }
  $year.html(opts(min, max));
  $month.html(opts(1, 12));
  // set dates options based on selected year and month
  [$year, $month].forEach(function($x) {
    $x.unbind('change').change(function() {
      var y = $year.val(),
          m = $month.val(),
          days;
      try {
        var cal = Util.getCal(y);
        days = Object.keys(cal[m]).length;
        $date.html(opts(1, days));
      } catch (err) { console.error(err); }
      getTime();
    });
    $date.unbind('change').change(function() {
      getTime();
    });
  }); // end of [ ... ].forEach

  $year.val(def_yyyy);
  $month.val(def_m);
  $month.change().promise().done(function() {
    $date.val(def_d);
    getTime();
  });
}); // datepickerView.render

//  # (Edit Page) PageControl
pageControlView.dom(function() {
  return '<div' + this._ID + 'class="row page-control">' 
    + '<div class="col-xs-6 col-sm-4">'
      + '<div data-component="isCover" class="hidden color-w is-cover">' + Phrases.IS_COVER + '</div>'
      + '<button data-component="setCover"'
        + ' class="btn btn-default hidden">' + Phrases.SET_COVER_STORY + '</button>'
    + '</div>'
    + '<div class="col-xs-6 col-sm-push-4 col-sm-4">'
      + '<button data-component="tryRemove"'
      + ' class="btn btn-default right">' + Phrases.REMOVE_PAGE + '</button>'
      + '<button data-component="removePage"'
      + ' class="btn btn-danger hidden right hidden">' + Phrases.YES + '</button>'
      + '<button data-component="cancel"'
      + ' class="btn btn-default hidden right">' + Phrases.CANCEL + '</button>'
    + '</div>'
    + '<div class="col-xs-12 col-sm-pull-4 col-sm-4">'
      + '<button data-component="setPub" class="btn btn-default">' 
        + Phrases.SET_PUBLISH_TIME + '</button>'
        + '<span data-component="isPublished" class="color-w"></span>'
      + '<form id="form-' + this._id + '" data-component="form" class="hidden color-w">' 
        + '<input type="radio" name="atDate" id="r1" value="now">'
        + '<label for="r1">' + Phrases.NOW + '</label><br>'
        + '<input type="radio" name="atDate" id="r2" value="later">'
        + '<label for="r2">' 
          + '<input id="daysLater" type="number" name="delay" value="3" class="color-b">'
          + Phrases.DAYS_LATER 
          + '</label><br>'
        + '<input type="radio" name="atDate" id="r3" value="date">'
        + '<label for="r3" data-component="datepicker"></label><br>'
        + '<input type="radio" name="atDate" id="r4" value="pause">'
        + '<label for="r4">' + Phrases.PAUSE + '</label><br>'
      + '</form>'
      + '<button class="btn btn-default hidden">' + Phrases.CANCEL + '</button>'
      + '<button data-component="publishBtn" class="hidden btn btn-default">' 
        + Phrases.YES + '</button>'
    + '</div>'
  + '</div>';
}); // end of pageControlView.dom
pageControlView.render(function() {
  var publishedAt = this.val('publishedAt'),
      isCover = this.val('isCover'),
      scheduledAt = false,
      now = new Date().getTime(),
      Datepicker = Views.class('Datepicker'),
      vuDate,
      //refPath = dataDS.val().refPath,
      //coverObj = dataDS.val().coverObj || this.val('coverObj'),
      //objId = coverObj && coverObj.objId,
      $setPub = this.$el('@setPub'),
      $pubBtn = this.$el('@publishBtn'),
      $tryBtn = this.$el('@tryRemove'),
      $cancelBtn = this.$el('@cancel'),
      $rmBtn = this.$el('@removePage'),
      $form = this.$el('@form'),
      $isPublished = this.$el('@isPublished'),
      $radio,
      that = this;

  // Hide setCover btn by default
  this.$el('@setCover').addClass('hidden');

  // "Set thee page as cover"
  if (isCover) {
    this.$el('@isCover').removeClass('hidden');
    this.$el('@setCover').addClass('hidden');
  }
  this.$el('@setCover').unbind('click')
    .click(function() {
    that.res('setAsCoverStory');
  });

  // Check if the obj is published
  if (publishedAt) {
    scheduledAt = Util.timeOf(publishedAt).fullDate;
    if (publishedAt <= now && !isCover) {
      this.$el('@setCover').removeClass('hidden');
    } 
  }
  if (scheduledAt) {
    if (publishedAt > now) {
      $isPublished.html(Phrases.BE_PUBLISHED_AT + ' ' + scheduledAt);
    } else {
      $isPublished.html(Phrases.PUBLISHED + ' (' + scheduledAt + ')');
    }
  } else {
    $isPublished.html(Phrases.UNPUBLISHED);
  }

  // Build date picker for the publish form
  vuDate = Datepicker.build({
    selector: this.sel('@datepicker'),
    data: { span: 2 }
  })
  this.$el().find('input[type="radio"]').unbind('click')
    .click(function() {
    $radio = $(this);
  });

  $setPub.unbind('click').click(function() {
    $form.toggleClass('hidden');
    $pubBtn.toggleClass('hidden');
  });

  // Set the publish inputs and button
  $pubBtn.unbind('click').click(function() {
   // var y = vuDate.val('year'),
   //     m = vuDate.val('month'),
   //     d = vuDate.val('date'),
    var curr = new Date().getTime(),
        stamp;
    switch ($radio.val()) {
      case 'pause':
        stamp = null;//curr * 1000;
        break;
      case 'now':
        stamp = curr;
        break;
      case 'later':
        var days = that.$el().find('#daysLater').val();
        stamp = Util.daysAfterNow(days).timestamp;
        break;
      case 'date':
        stamp = vuDate.val('timestamp');
        break;
    }
    
    // toggle off 
    $setPub.click();

    that.res('publishAt', stamp);
    that.ds({ publishedAt: stamp });
    return;
  }); // end of $pubBtn

  // "Remove the page"
  $tryBtn.unbind('click')
    .click(function() {
    $tryBtn.addClass('hidden');
    $cancelBtn.removeClass('hidden');
    $rmBtn.removeClass('hidden');
  });
  $cancelBtn.unbind('click')
    .click(function() {
    $tryBtn.removeClass('hidden');
    $cancelBtn.addClass('hidden');
    $rmBtn.addClass('hidden');
  });
  $rmBtn.unbind('click')
    .click(function() {
    that.res('removePage');
    //Dg.ref().child(objId).ref.set(null)
    //  .then(function() {
    //  location.href = '/edit';
    //});
  });
  
});// pageControlView.render

//  # Blog
blogView.dom(function() {
  return '<article class="blog"' + this._ID + '>'
    + '<h2 data-component="title"></h2>'
    + '<p data-component="content"></p>'
    + '<div data-component="images"></div>'
  +'</article>';
}); // end of blogView.dom
blogView.render(function() {
  var title = this.val('title') || '',
      content = this.val('content') || '';

  this.$el('@title').text(title);
  this.$el('@content').html(content.replace(/\n/g, '<br>'));
}); // end of blogView.render
blogView.render(function() {
  var editable = this.val('editable'),
      node = this.val('node'),
      that = this;
  
  if (!editable || !node) return;

  [ 
    { name: 'title', label: Phrases.EVENT_TITLE },
    { name: 'content', label: Phrases.CONTENT }
  ].forEach(function(x) {
    that.$el('@' + x.name).off('click')
      .on('click', function() {
      Editor.openWriter({
        label: x.label,
        node: node, 
        field: x.name
      }).res('newVal', function(newVal) {
        var ups = {};
        ups[x.name] = newVal;
        that.ds(ups);
        if (x.name == 'title') {
          that.res('titleChanged', newVal);
        }
      }); // end of Editor.openWriter
    }); // end of .. click ..
  }); // end of [ ... ].forEach
}); // end of blogView.render

textView.dom(function() {
  return '<div' + this._ID + 'class="text-node">'
    + '<button data-component="rmBtn" class="rm-btn btn btn-danger">' 
      + Phrases.REMOVE + '</button>' 
    + '<p data-component="text"></p></div>';
});
textView.render(function() {
  var node = this.val('node'), that = this, 
      text = this.val('text') || '';
  this.$el('@text').html(text.replace(/\n/g, '<br>'));

  if (!this.val('editable') || !node) return;
  this.$el().addClass('editable');
  this.$el().off('click').on('click', function() {
    Editor.openWriter({
      label: Phrases.CONTENT,
      node: node,
      field: 'text'
    }).res('newVal', function(newVal) {
      that.ds({ text: newVal });
    });
  });

  this.$el('@rmBtn').off('click')
    .on('click', function(e) {
      e.stopPropagation();
      that.res('remove');
    });
});

/*
Views.setView('CardLink', function() {
  var data = this.data;
  var that = this;
  var centered = this.val('centered') ? 'centered' : '';
  this.dom = '<div' + this._ID + '>' 
    + '<a id="card-link-' + this._id 
    + '" class="card-link ' + centered + '" '
    + 'href="' + this.val('href') + '">' 
      + '<div class="link-cover bg-slight">' 
        + '<img data-component="display" class="center-cropped" width="100%"' 
        + ' onerror="this.style.display=\'none\'"'
        + ' onload="this.style.display=\'block\'"'
        + ' src="' + this.val('imgsrc') + '">'
      + '</div>'
      + '<div data-component="sleeve" class="link-description color-w">' 
        + '<div data-component="title" class="title"></div>'
        + '<div data-component="caption" class="caption"></div>'
      + '</div>'
    + '</a>'
  + '</div>';

  this.renders.display = function() {
    if (that.val('imgsrc')) {
      that.$el('@display').prop('src', that.val('imgsrc'));
    } else if (that.val('display')) {
      Dg.getImage(that.val('display')).then(function(url) {
        that.$el('@display').prop('src', url);
      });
    }

    if (that.val('title')) {
      that.$el('@title').html(that.val('title'));
    }
    if (that.val('caption')) {
      that.$el('@caption').html(that.val('caption'));
    }
    if (that.val('type') === 'event') {
      that.$el('@sleeve')
        .addClass('event-type')
        .addClass('bg-green');
    } else {
      that.$el('@sleeve').addClass('bg-brown');
    }
  };

  this.useEditor = function() {
    that.$el().unbind('click').click(function(e) {
      that.openEditor({
        path: 'display',
        callback: function(newRaw) {
          that.load({ updates:{ display: { raw: newRaw }}});
        }
      });
    });
  };
  return this;
}); // end of "CardLink"
*/
/*
Views.setView('PhotoFrame', function() {
  var that = this;
  var snap = that.snap;
  var imgPath = that.val('imgPath');
  var imgsrc = that.val('imgsrc');
  var name = that.val('name');
  if (!snap || !imgPath || !imgsrc || !name) return;
  
  this.dom = '<div' + this._ID + 'class="photo-frame">'
    + '<div class="photo-frame-bar">'
      + '<button data-component="coverBtn">' + Phrases.SET_COVER_IMG + '</button>'
      + '<button data-component="rmBtn">' + Phrases.REMOVE + '</button>'
    + '</div>'
    + '<div class="photo-frame-img">'
      + '<img width="100%" data-component="img">'
    + '</div>'
  + '</div>';

  this.renders.all = function() {
    console.log(snap.val());
    that.$el('@img').prop('src', imgsrc);
    //that.$el().prepend('' +
    //  + '<div class="photo-frame-bar">'
    //    + '<button data-component="coverBtn">' + Phrases.SET_COVER_IMG + '</button>'
    //    + '<button data-component="rmBtn">' + Phrases.REMOVE + '</button>'
    //  + '</div>');
    

    that.$el('@coverBtn').unbind('click').click(function() {
      snap.ref.child('images/display').set(imgPath)
        .then(function() {
          console.log('set as display');
          location.reload(true);
        });
    });
    that.$el('@rmBtn').unbind('click').click(function() {
      snap.ref.child('images/all').child(name).set(null)
        .then(function() {
          console.log('remove ' + name);
          location.reload(true);
        });
    });
  };

  return this;
}); // end of "PhotoFrame"

Views.setView('Toggle', function() {
  var that = this;
  this.dom = '<div' + this._ID + ' class="toggle-sections">' 
    + '<ul data-component="toggle" class="toggle yearly"></ul>' 
    + '<div data-component="sections" class="sections yearly"><div>'
  +'</div>';
  this.renders.setLis = function() {
    var listItems, lis = '', secs = '', first='';
    if (that.val('listItems')) {
      listItems = that.val('listItems');
      if (!Array.isArray(listItems)) return;

      listItems.forEach(function(li, idx) {
        var each_li = '<li data-component="li-' + idx + '">' + li + '</li>';
        var each_sec = '<div data-component="sec-' + idx + '"></div>';

        that.$el('@toggle').append(each_li);
        that.$el('@sections').append(each_sec);

        that.$el('@li-' + idx).unbind('click').click(function() {
          that.$el('@toggle').children('li').removeClass('activated');
          that.$el('@sections').children('div').hide();
          that.$el('@sec-' + idx).fadeIn(300);
          $(this).addClass('activated');
        });
      });
      
      // Show the default section
      that.$el('@sections').children('div').hide();
      if (that.val('default')) {
        that.$el('@li-' + that.val('default')).click();
      } else {
        that.$el('@li-0').click();
      }
    }
  };
  return this;
}); // end of "Toggle"
*/

// aasd
/*Views.setView('CoverStory', function() {
  var that = this,
      data = this.ds('data').val(),
      title = data.title || this.val('title'),
      caption = data.caption || this.val('caption'),
      href = data.href || this.val('href'),
      imgsrc = data.imgsrc || this.val('imgsrc');

  this.dom = '<div' + this._ID + ' class="big-cover">' 
    + '<a data-component="link" class="mask">' 
      + '<div data-component="text" style="display:none">' + title + '</div>'
    + '</a>' 
  + '</div>';

  this.renders.all = function() {
    var titleHTML = '', 
        captionHTML = '';
    if (title) {
      titleHTML = '<h2>' + title + '</h2>'; 
    }
    if (caption) {
      captionHTML = '<h4>' + caption + '</h4>';
    }
    if (title || caption) {
      that.$el('@text')
        .html(titleHTML + captionHTML)
        .show();
      console.log(that);
    }
    if (imgsrc) {
      var url = 'url(\"' + imgsrc + '\")';
      that.$el().css('background-image', url);
    }
    if (href) {
      that.$el('@link').prop('href', href);
    }
  };
  return this;
}); // end of "CoverStory"
*/
/*
Views.setView('ControlBar', function() {
  var that = this;
  this.dom = '<div' + this._ID + 'class="control-bar">' 
    + '<button data-component="coverBtn" class="btn btn-default">' 
      + Phrases.SET_COVER_STORY
    + '</button>'
    + '<button data-component="rmBtn" class="btn btn-default">' 
      + Phrases.REMOVE_PAGE
    + '</button>'
    + '<button data-component="rmCancelBtn" class="btn btn-danger hidden">'
      + Phrases.CANCEL
    + '</button>'
    + '<button data-component="rmConfirmBtn" class="btn btn-danger hidden">'
      + Phrases.YES
    + '</button>'
  + '</div>';

  this.renders.setButtons = function() {
    var type = that.val('type');
    var path = that.val('path');
    var refPath = false;
    if (type === 'item') {
      refPath = 'items';
    } else if (type === 'event') {
      refPath = 'events';
    }
    // Set remove page button
    that.$el('@rmBtn').unbind('click').click(function() {
      that.$el('@rmCancelBtn').removeClass('hidden');
      that.$el('@rmConfirmBtn').removeClass('hidden');
    });
    that.$el('@rmCancelBtn').unbind('click').click(function() {
      that.$el('@rmCancelBtn').addClass('hidden');
      that.$el('@rmConfirmBtn').addClass('hidden');
    });
    that.$el('@rmConfirmBtn').unbind('click').click(function() {
      if (refPath) {
        // Double check
        Dg.ref().child(refPath).child(path)
        .set(null).then(function() {
          location.href = '/beta';
        });
      }
    });
    // Set "set as cover" button
    that.$el('@coverBtn').unbind('click').click(function() {
      var coverObj = {};
      var thePath = refPath + '/' + path;
      var fallback = '/images/fallback/aca_night.jpg';
      var fetched = null;
      try {
        fetched = $(that.val('fetchSrc')).prop('src');
      } catch (err) {}
      // TBD: Set start and end date
      // TBD: User set title, caption and imgsrc
      // asd
      coverObj.title = 'D I P L O | C O V E R ';
      coverObj.caption = 'TBD: User define these fields';
      coverObj.imgsrc = fetched || fallback;
      coverObj.href = '/beta/' + thePath;
      Dg.ref().child('cover')
      .set(coverObj).then(function() {
        // TBD: show success
        console.log(thePath);
      });
    });
  };

  return this;
}); // end of "ControlBar"
*/
/*
Views.setView('ItemPage', function() {
  var item = this.ds('item').val(),
      events = item.events,
      no = item.no, 
      name = item.name, 
      from = item.from, 
      to = item.to, 
      date = item.date, 
      href = item.href,
      links = item.extLinks,
      imgsrc = item.imgsrc,
      editable = item.editable;

  console.log(item);
  console.log(events);

  var extLink = function(title, url) {
    return '<a class="brick-link bg-brown" target="_blank" href="' + url + '">' + title + '</a>';
  };
  this.dom = '<div class="row"><div class="col-xs-12 col-sm-5">' 
    + '<h2>' + Phrases.THE_ITEM + '<h2>'
  + '</div></div>'
  + '<div class="row"><div' + this._ID + 'class="col-xs-12 col-sm-5">' 
    + '<div id="item-card" data-component="item-card"></div>'
  + '</div>'
  + '<div' + this._ID + 'class="col-xs-12 col-sm-7">'
    + '<ul class="item-page-ul">'
      + '<li class="title color-darkred" data-component="no"></li>'
      + '<li data-component="name"></li>'
      + '<li class="title color-darkred">' + Phrases.FROM + '</li>'
      + '<li data-component="from"></li>'
      + '<li class="title color-darkred">' + Phrases.TO + '</li>'
      + '<li data-component="to"></li>'
      + '<li class="title color-darkred">' + Phrases.RECEIVED_DATE + '</li>'
      + '<li data-component="date"></li>'
    + '</ul>'
  + '</div></div>'
  + '<div' + this._ID + 'class="row" style="margin-top:100px"><div class="col-xs-12 col-sm-5">' 
    + '<h2 data-component="title-images">' + Phrases.COL + '</h2>'
  + '</div></div>'
  + '<div ' + this._ID + 'class="row"><div class="col-xs-12 col-sm-12">'
    + '<div data-component="images"></div>'
  + '</div></div>'
  + '<div class="row">' 
    + '<div' + this._ID + 'class="col-xs-12">'
      + '<h2 data-component="evt-title" style="display:none">' + Phrases.RELATED_EVENTS + '</h2>'
      + '<div class="row" data-component="event-links"></div>'
    + '</div>'
    + '<div' + this._ID + 'class="col-xs-12">' 
      + '<h2 data-component="ext-title" style="display:none">' + Phrases.EXT_LINKS + '</h2>'
      + '<div data-component="ext-links"></div>'
    + '</div>'
  + '</div>';

  this.renders.all = function() {
    var that = this;
    if (item) {
      this.$el('@no').html(no);
      this.$el('@name').html(name);
      this.$el('@from').html(from);
      this.$el('@to').html(to);
      this.$el('@date').html(date);

      // Display Item Card
      if (imgsrc && imgsrc.display) {
        var vuItemCard = Views.build({
          view: 'CardLink',
          selector: that.sel('@item-card'),
          data: {
            title: no,
            caption: name,
            imgsrc: imgsrc.display,
            href: href
          }
        });
      }
    }
    // Display Image Wall
    if (imgsrc && imgsrc.all) {
      Views.build({
        view: 'ImgWall',
        selector: that.sel('@images'),
        data: {
          all: imgsrc.all,
          editable: editable
        }
      });
    }
    
    // Display Event Cards
    if (events) {
      console.log(events);
      that.$el('@evt-title').show();
      that.$el('@event-links').html('');

      events.forEach(function(evt, idx) {
        that.$el('@event-links')
          .append('<div data-component="evt-' + idx + '"'
            + ' class="col-xs-12 col-sm-6 col-md-4 col-lg-3"></div>');
        var vuCard = Views.build({
          view: 'CardLink',
          selector: that.sel('@evt-' + idx),
          data: {
            type: 'event',
            title: evt.date,
            caption: evt.title,
            imgsrc: evt.imgsrc,
            href: evt.href
          }     
        });
      });
    }

    // Show extLinks
    //var links = this.snap.val().extLinks;
    if (links) {
      that.$el('@ext-title').show();
      that.$el('@ext-links').html('');
      links.forEach(function(link) {
        var title = link.title;
        var url = link.url;
        that.$el('@ext-links').append(extLink(title, url));
      });
    }
  }; // end of this.renders.all

  this.useEditor = function() {
    var that = this;
    that.$el('@event-links').prepend('<div>'
      + '<input type="text" data-component="input-event">'
      + '<button data-component="add-event">' + Phrases.ADD_EVENT + '</button>'
    + '</div>');

    that.$el('@ext-links').prepend('<div>'
      + '<input type="text" data-component="ext-title" placeholder="' + Phrases.UNTITLED + '">'
      + '<input type="text" data-component="ext-url" placeholder="http://...">'
      + '<button data-component="add-link">' + Phrases.ADD_LINK + '</button>'
    + '</div>');

    that.$el('@add-event').unbind('click').click(function() {
      var evtId = that.$el('@input-event').val();
      evtId = evtId.replace(/\//g, '_');
      that.snap.ref.child('eventIds').child(evtId).set(true)
      .then(function() {
        that.$el('@event-links').append('New Link');
      });
    });
    that.$el('@add-link').unbind('click').click(function() {
      var title = that.$el('@ext-title').val();
      var url = that.$el('@ext-url').val();
      var timestamp = new Date().getTime().toString(36);
      that.snap.ref.child('extLinks').child(timestamp).set({
        title: title, url: url
      })
      .then(function() {
        that.$el('@ext-links').append(extLink(title, url));
      });
    });
  };

  $(document).prop('title', Dg.SITE_NAME + ' ' + no + ' | ' + name);
  return this;
}); // end of "ItemPage"
*/

/*
Views.setView('EventPage', function() {
  var evt = this.ds('event').val(),
      imgDS = dataSnap(),
      title = evt.title,
      content = evt.content,
      items = this.ds('items').val().all,
      images = evt.images,
      editable = evt.editable,
      snapEvt = evt.snap,
      path = evt.path,
      that = this;

  this.dom = '<div' + this._ID + 'class="col-xs-12">'
    + '<div class="event-post bottom-bar">' 
      + '<h2 data-component="title"></h2>'
      + '<p data-component="content"></p>' 
      + '<div data-component="images"></div>'
    + '</div>'
    + '<div class="event-post">' 
      + '<h3>' + Phrases.RELATED_ITEMS + '</h3>'
      + '<div class="row" data-component="items-control"></div>'
      + '<div class="row" data-component="items"></div>'
    + '</div>';
  + '</div>';

  this.renders.basic = function() {
    if (title && content) {
      that.$el('@title').text(title);
      that.$el('@content').html(content.replace(/\n/g, '<br>'));
    }
    if (editable && snapEvt) {
      ['title', 'content'].forEach(function(s) {
        that.$el('@' + s).unbind('click').click(function() {
          that.openEditor({
            snap: snapEvt,
            path: s,
            callback: function(newVal) { 
              var ups = {};
              ups[s] = newVal;
              that.ds('event').update(ups);
            }
          });
        });
      }); // end of [...].forEach
    }
  }; // end of render "basic"

  this.renders.loadImages = function() {
    if (images) {
      var vuImgWall = Views.build({
        view: 'ImgWall',
        selector: that.sel('@images')
        //data: { 
        //  all: images.all,
        //  editable: editable
        //}
      });
      vuImgWall.ds('imgDS', imgDS);
      imgDS.val({
        root: 'events/' + path + '/images',
        all: images.all,
        editable: editable,
        mode: 'wide'
      });
    } 
  }; // end of render "loadImages"

  this.renders.displayItemCards = function() {
    // Display Item Cards
    if (items) {
      that.$el('@items').html('');
      items.forEach(function(item, idx) {
        that.$el('@items').append('<div '
          + ' data-component="item-' + idx + '"'
          + ' class="col-xs-12 col-sm-6"></div>');

        var vuCard = Views.build({
          view: 'CardLink',
          selector: that.sel('@item-' + idx),
          data: {
            title: item.title,
            caption: item.caption,
            imgsrc: item.imgsrc
          }
        }); // end of vuCard
      }); // end of Object.keys
    } // end of if

    if (editable && items) {
      items.forEach(function(x, idx) {
        that.$el('@item-' + idx)
          .prepend('<button data-component="rmItemBtn-' 
            + idx + '">' + Phrases.REMOVE + '</button>');
        that.$el('@rmItemBtn-' + idx).unbind('click')
          .click(function() {
          console.log(x);  
          snapEvt.ref.child('itemIds/' + x.id).set(null)
            .then(function() {
            // Update items
            items.splice(idx, 1);
            that.ds('event').update({ items: items });
          });
        });
      });
    }
  }; // end of render "displayItemCards"

  this.renders.setAddItem = function() {
    if (!editable) return;

    that.$el('@items-control').html('<div class="col-xs-12">' 
      + '<input type="text" data-component="item-id" placeholder="123">'
      + '<button data-component="add-item">' + Phrases.ADD_ITEM + '</button>'
    + '</div>');

    that.$el('@add-item').unbind('click').click(function() {
      var itemId = that.$el('@item-id').val().trim();
      if (itemId) {
        snapEvt.ref.child('itemIds').child(itemId).set(true)
        .then(function() {
          that.ds('items').load();
        });
      }
    });
  }; // end of render "setAddItem"
  
  $(document).prop('title', Dg.SITE_NAME + ' | ' + title);

  return this;
}); // end of Views.setView('EventPage')

Views.setView('_ImgWall', function() {
  var that = this;
  var mainSnap = this.snap;

  this.dom = '<div' + this._ID + '>' 
    + '<div data-component="control"></div>'
    + '<div data-component="wall"></div>'
  + '</div>';
  this.renders.all = function() {
    var images = this.raw('images'); // An Object of image paths
    var img_wraps = '';
    if (Array.isArray(images) 
      || typeof images != 'object' 
      || !images) return;

    Object.keys(images).forEach(function(p, idx) {
      img_wraps = img_wraps 
        + '<img data-component="img-' + idx 
        + '" style="display:none; width:100%; margin:8px 0;">';
    });
    this.$el('@wall').html(img_wraps);
    
    Object.keys(images).forEach(function(p, idx) {
      Dg.getImage(images[p]).then(function(url) {
        that.$el('@img-' + idx)
          .prop('src', url)
          .fadeIn(3000);
      });
    });
  };
  this.useEditor = function() {
    var that = this;
    var spa = this.val('savePathsAt');
    var sia = this.val('saveImagesAt');
    var prefix = this.val('prefix') || '';
    var images = this.raw('images'); // An Object of image paths
    if (!spa || !sia) return;

    // Set buttons
    var addImgBtn = '<button data-component="add-img" class="btn btn-default">' 
      + Phrases.ADD_IMG 
    + '</button>';
    this.$el('@control').html(addImgBtn);

    this.$el('@add-img').unbind('click').click(function() {
      that.chooseImagesAs({ 
        savePathsAt: spa,
        saveImagesAt: sia,
        multi: true,
        callback: function(res) {
          console.log(res.url);
        }
      }); // asd TBD
    });

    // Set Photo Frames
    this.$el('@wall').html('');
    Object.keys(images).forEach(function(p, idx) {
      Dg.getImage(images[p]).then(function(url) {
        var vuPhoto = Views.build({
          snap: mainSnap,
          view: 'PhotoFrame',
          selector: that.sel('@wall'),
          method: 'append',
          data: {
            imgsrc: url,
            imgPath: images[p],
            name: p
          }
        });
        if (that.val('EDIT_MODE')) {
          vuPhoto.useEditor();
        }
      });
    });
    // end of Photo Frames
  }; //  end of this.useEditor
  return this;
}); // end of "_ImgWall"

Views.setView('ImgWall', function() {
  var imgDS = this.ds('imgDS'),
      all = imgDS.val().all,
      root = imgDS.val().root,
      editable = imgDS.val().editable,
      mode = imgDS.val().mode,
      that = this;
  this.dom = '<div' + this._ID + '>' 
    + '<div data-component="control"></div>'
    + '<div data-component="wall"></div>'
  + '</div>';

  this.renders.loadImages = function() {
    if (!Array.isArray(all) || !root) return;
    all.forEach(function(img) {
      var vuImg = Views.build({
        view: 'Frame',
        selector: that.sel('@wall'),
        method: 'append',
        data: {
          key: img.key,
          src: img.src,
          path: img.path,
          mode: mode,
          editable: editable,
          root: root // eg. /events/2011-1-1/1
        }
      });
    });
  };

  this.renders.setAddBtn = function() {
    if (editable && root) {
      // Set buttons
      var addImgBtn = '<button data-component="add-img" class="btn btn-default">' 
        + Phrases.ADD_IMG 
      + '</button>';
      that.$el('@control').html(addImgBtn);
      that.$el('@add-img').unbind('click').click(function() {
        console.log(root);
        that.chooseImagesAs({ 
          savePathsAt: root + '/all',
          saveImagesAt: 'events',
          prefix: 'img_',
          multi: true,
          callback: function(res) {
            // res.urls  asd TBD
          }
        });
      }); // end of ...click
    } // end of if (editable ...)
  };
  return this;
}); // end of "ImgWall"

Views.setView('Frame', function() {
  var that = this, 
      idx = that.val('idx'),
      key = that.val('key'), // eg. "<id>/images/all/123_01"
      path = that.val('path'), // eg. value of "<id>/image/all/123_01"
      src = that.val('src'), // eg. file location of "path"
      mode = that.val('mode'),
      root = that.val('root'),
      editable = that.val('editable');
  this.dom = '<div' + this._ID + 'class="photo-frame">'
    + '<div data-component="bar" class="photo-frame-bar hidden">'
      + '<button data-component="displayBtn">' + Phrases.SET_COVER_IMG + '</button>'
      + '<button data-component="rmBtn">' + Phrases.REMOVE + '</button>'
    + '</div>'
    + '<div class="photo-frame-img">'
      + '<img width="100%" data-component="img">'
    + '</div>'
  + '</div>';

  this.renders.loadImage = function() {
    if (src) {
      that.$el('@img').prop('src', src);
    }
    if (editable) {
      that.$el().addClass('black');
      that.$el('@bar').removeClass('hidden');
    }
    switch (mode) {
      case 'full':
        that.$el().addClass('full'); break;
      case 'wide':
        that.$el().addClass('full'); break;
      default:
    }
  };

  this.renders.editable = function() {
    if (editable && root) {
      console.log('editable');
      that.$el('@displayBtn').unbind('click').click(function() {
        // TBD
        console.log(path);
        console.log(root + '/display');
      });
      that.$el('@rmBtn').unbind('click').click(function() {
        // TBD
        console.log(key);
        console.log(root + '/all');
      });
      //that.$el('rmBtn')
    }
  };
  return this;
}); // end of "Frame"

Views.setView('NewObj', function() {
  var that = this;
  var schema = that.val('schema');
  var input = function(obj) {
    var id = that._id + '-' + obj.label;
    var muted = obj.mutedText
      ? '<p class="form-text text-muted">' + obj.mutedText + '</p>'
      : '';
    var component = obj.comp
      ? ' data-component="' + obj.comp + '" '
      : '';
    var pl = obj.placeholder
      ? ' placeholder="' + obj.placeholder + '"'
      : '';
    return '<label for="' + id + '">' + obj.label +'</label>'
    + '<input type="text" id="' + id + '"'
    + component + 'class="form-control" ' + pl + '>'
    + muted;
  }; // end of input

  this.dom = '<div' + this._ID + ' class="w540">'
    + '<div>' 
      + input({ comp: 'new-no', placeholder: '123', label: Phrases.NO })
      + '<button data-component="submit" class="btn btn-default">' 
        + Phrases.NEXT
      + '</button>'
    + '</div>'
    + '<div data-component="form" style="color:#fff;"></div>'
  + '</div>';

  this.renders.all = function() {
    if (!schema || (schema != 'Item' && schema != 'Event')) return;

    that.$el('@submit').unbind('click').click(function() {
      var newId = that.$el('@new-no').val().trim();
      Dg.ref().child('schemas/' + schema)
      .once('value').then(function(snapSchema) {
        var objRefRoot = snapSchema.val().ref // eg. /items
        var objRef = Dg.ref().child(objRefRoot).child(newId);
        var timestamp = new Date().getTime();

        // Check the requested obj is new or being used
        objRef.once('value').then(function(snapItem) {
          if (snapItem.val()) {
            // Has been used
            // "Item"
            switch (schema) {
              case 'Item':
                location.href = '/beta/edit/items/'+ newId;
                break;
            }
          } else {
            // New
            // Item
            switch (schema) {
              case 'Item':
                objRef
                .set(snapSchema.val().blank)
                .then(function() {
                  location.href = '/beta/edit/items/'+ newId;
                });
                break;
            } // end of switch
          } // end of else
        }); // end of objRef.then
      }); // end of Dg.ref
    }); // end of that.click
  }; // end of this.renders.all
  return this;
}); // end of "NewObj"

Views.setView('NewEvent', function() {
  var that = this;
  var now = new Date();
  var today = now.getFullYear()
    + '-' + (now.getMonth() + 1)
    + '-' + (now.getDate());
  this.dom = '<div' + this._ID + 'class="w540">'
    + '<div>' 
      + '<input type="text" placeholder="' + today + '"'
      + ' data-component="new-no"'
      + ' class="form-control">'
      + '<button data-component="submit" class="btn btn-default">' 
        + Phrases.NEXT
      + '</button>'
    + '</div>'
    + '<div data-component="form" style="color:#fff;"></div>'
  + '</div>';

  this.renders.all = function() {
    that.$el('@submit').unbind('click').click(function() {
      var newId = that.$el('@new-no').val().trim();
      if (!newId) return;

      var timestamp = now.getTime().toString(36);
      var blankObj = {};
      blankObj.title = Phrases.UNTITLED;
      blankObj.content = Phrases.NO_CONTENT;
      Dg.ref().child('events')
      .child(newId)
      .child(timestamp)
      .set(blankObj).then(function() {
        location.href = '/beta/edit/events/' + newId + '/' + timestamp;
      });
    }); // end of @submit
  }; // end of this.renders.all
  return this;
}); // end of "NewEvent"
*/

/*var Views = {};
Views.createView = function(viewName, renderFunc) {
  if (!this._renderMethods) {
    this._renderMethods = [];
  }
  this._renderMethods[viewName] = renderFunc;
};

Views.getRenderMethod = function(viewName) {
  return this._renderMethods[viewName];
};

Views.render = function(obj) {
  if (!this._counter) {
    this._counter = 0;
  }
  if (!this.Rendered) {
    this.Rendered = {};
  }

  var viewName = obj.view;
  var selector = obj.selector;
  var method = obj.method || 'html';
  var data = obj.data;
  var keys = obj.keys;
  if (!viewName || !selector || !data) return;
  this._counter++;
  
  var vu = {};
  if (!vu.data) {
    vu.data = {};
  }
  for (var name in data) {
    vu.data[name] = data[name];
  }

  vu.html = '';
  if (!vu._id) {
    vu._id = 'vu_' + (this._counter++);
  }

  var renderMethod = this.getRenderMethod(viewName);
  vu.html = renderMethod.call(obj);

  switch (viewName) {
    case 'CardLink': 
      vu.html = '<div data-view="CardLink" data-vuid="' + vu._id + '">' 
        + '<a id="card-link-' + vu.data.key 
        + '" class="card-link" href="' + vu.data.href + '">' 
          + '<div class="link-cover bg-slight">' 
            + '<img data-component="display" class="center-cropped" width="100%"' 
            + ' onerror="this.style.display=\'none\'"'
            + ' onload="this.style.display=\'block\'"'
            + ' src="' + (vu.data.imgsrc || '') + '">'
          + '</div>'
          + '<div class="link-description bg-brown color-w">' 
            + '<div class="title">' + (vu.data.title || '') + '</div>'
            + '<div class="caption">' + (vu.data.caption || '') + '</div>'
          + '</div>'
        + '</a>'
        + '</div>';
      break;
    case 'ItemPage':
      vu.html = '<div data-vuid="' + vu._id + '" class="col-xs-12 col-sm-6">' 
          + '<div id="item-card" data-view="CardLink"></div>'
        + '</div>'
        + '<div data-vuid="' + vu._id + '" data-view="ItemPage" class="col-xs-12 col-sm-6">'
          + '<ul class="item-page-ul">' 
            + '<li class="title color-darkred">' + vu.data.no + '</li>'
            + '<li data-key="' + obj.keys.name + '">' + vu.data.name + '</li>'
            + '<li class="title color-darkred">' + Phrases.FROM + '</li>'
            + '<li data-key="' + obj.keys.from + '">' + vu.data.from + '</li>'
            + '<li class="title color-darkred">' + Phrases.TO + '</li>'
            + '<li data-key="' + obj.keys.to + '">' + vu.data.to + '</li>'
            + '<li class="title color-darkred">' + Phrases.RECEIVED_DATE + '</li>'
            + '<li data-key="' + obj.keys.date + '">' + vu.data.date + '</li>'
          + '</ul>'
        + '</div>'
        + '<div data-vuid="' + vu._id + '" class="col-xs-12">' 
          + '<div id="info"></div>'
        + '</div>'
        + '<div data-vuid="' + vu._id + '" class="col-xs-12">'
          + '<div id="event-link" data-view="EventLink">'
            + '<a data-key="' + obj.keys.eventHref 
            + '" href="' + vu.data.eventHref  + '">' + vu.data.eventTitle + '</a>'
          +'</div>'
        + '</div>';
      break;
    case 'EventPage':
      vu.html = '<div data-vuid="' + vu._id + '" class="col-xs-12">'
          + '<div class="event-post bottom-bar">' 
            + '<h2>' + vu.data.title + '</h2>'
            + '<p>' + vu.data.content.replace(/\n/g, '<br>') + '</p>'
            + '<div id="images">' 
            + (vu.data.images && vu.data.images.length
            ? vu.data.images.reduce(function(_html, x) {
                if (x) {
                  _html = _html + '<img width="100%" src="' + x + '">';
                }
                return _html;
              }, '')
            : '')
            + '</div>'
          + '</div>'
          + (vu.data.itemLinks && vu.data.itemLinks
          ? '<div class="event-post">' 
            + '<h3>' + Phrases.RELATED_ITEMS + '</h3>'
            + vu.data.itemLinks.reduce(function(_html, x) {
              if (x.href && x.title) {
                _html = _html + '<div><a href="' + x.href + '">' + x.title + '</a></div>';
              }
              return _html;
            }, '')
          + '</div>'
          : '')
        + '</div>';
      break;
    default:
  } // end of switch
  
  switch (method) {
    case 'html':
      $(selector).html(vu.html); break;
    case 'append':
      $(selector).append(vu.html); break;
    case 'prepend':
      $(selector).prepend(vu.html); break;
    default:
      $(selector).html(vu.html);
  }

  vu.path = function(_key) {
    if (!_key) {
      return '[data-vuid="' + vu._id +'"]';
    } else if (_key.charAt(0) === '/') { // eg. "/display"
      return '[data-vuid="' + vu._id + '"] ' 
        + '[data-component="' + _key.slice(1) + '"]';
    }
    return '[data-vuid="' + vu._id + '"] ' + _key;
  };

  vu.update = function(obj) {
    var that = this;
    Object.keys(obj).forEach(function(key) {
      that.data[key] = obj[key];
    });
  };

  vu.setEditMode = function() {
    if (!this.hasSetOnClickForEditor) {
      this.hasSetOnClickForEditor = true;
    } else {
      return;
    }
    if (!obj.keys) return;

    var root = '[data-vuid="' + vu._id + '"]';

    Object.keys(obj.keys).forEach(function(k) {
      $(root + ' [data-key="' + obj.keys[k] + '"]').click(function(e) {
        e.preventDefault();
        Editor.zone.open({
          key: obj.keys[k],
          value: obj.data[k],
          callback: function(newValue) {  
            location.reload(true);
            // TBD: Just reload the component
          }
        });
        console.log(obj.keys[k]);
      });
    });
  };

  this.Rendered[vu._id] = vu;
  return vu;
};*/

var timerRender = setTimer();
function renderMain(data) {
  var path = data.path;
  var names = path.split('/');
  var pageRoot = '#page-container';
  var type;
  var types = {
    HOME: 'Home',
    ITEM_LIST: 'Items',
    ITEM_SINGLE: 'One item',
    EVENT_LIST: 'Events', // single year and multiple years
    EVENT_SINGLE: 'One event',
    EDIT_EVENT: 'Edit event',
    NEW_ITEM: 'New Item'
  };

  console.log('path = ' + path);
  //-----------------
  // Router: Get data schema and render type
  if (path === '/') {
    type = types.HOME;  
  } else if (path.indexOf('/items') === 0 && names[1] === 'items') {
    switch(names.length) {
      case 2:
        type = types.ITEM_LIST; break;
      case 3:
        type = types.ITEM_SINGLE; break;
      default:
    }
  } else if (path.indexOf('/events') === 0 && names[1] === 'events') {
    switch(names.length) {
      case 2:
        type = types.EVENT_LIST; break;
      case 3: // with date, eg. /events/2014-3-2
        var wrap = {};
        wrap[names[2]] = snap;
        snap = wrap;
        type = types.EVENT_LIST; break;
      case 4: // eg. /events/2014-3-2/1
        type = types.EVENT_SINGLE; break;
      default:
    }     
  } else if (path.indexOf('/new-item') === 0 && data.EDIT_MODE) {
    console.log('new item');
    console.log(names);
    type = types.NEW_ITEM;
  } else if (path.indexOf('/new-event') === 0 && data.EDIT_MODE) {
    console.log(names);
    type = types.NEW_EVENT;
  } else {
    // 404
    $(pageRoot).html('<h1 style="margin-top:200px;'
      + ' color: #ddd;'
      + ' font-size:9em;'
      + ' text-align:center;">404</h1>');
    return;
  }
  
  //-----------------
  if (data.EDIT_MODE) {
    $('body').css({ 'background-color': '#111' });
  }
  //----------------

  $(pageRoot)
    .addClass('container')
    .addClass('page-container');
    //.addClass('col-xs-12');
    //.css('padding-top', '50px');

  switch(type) {
    case types.HOME:
      $(pageRoot)
        .append('<div id="cover-story" class="col-xs-12"></div>')
        .append('<div id="events" class="col-xs-12 col-sm-6"></div>')
        .append('<div id="items" class="col-xs-12 col-sm-6"></div>')
        .append('<div id="recommended" class="col-xs-12"></div>');

      // Cover
      var coverObj = {
        title: 'D I P L O G I F T',
        caption: 'We build better connections through these events and gifts.',
        imgsrc: '/images/fallback/aca_night.jpg',
        href: '/beta'
      };
      var vuCover = Views.build({
        view: 'CoverStory',
        selector: '#cover-story',
        data: coverObj
      });
      Dg.ref().child('cover').once('value')
      .then(function(snap) {
        // Update the cover story
        var obj = snap.val();
        vuCover.load({ updates: {
          title: obj.title,
          caption: obj.caption,
          imgsrc: obj.imgsrc,
          href: obj.href
        }});
      });
        //var vuCover = Views.build({
        //  view: 'CoverStory',
        //  selector: '#cover-story',
        //  data: coverObj
        //});
          /*data: {
            title: 'D I P L O G I F T',
            caption: 'We build better connections through these events and gifts.',
            imgsrc: '/images/fallback/aca_night.jpg',
            href: '/beta'
          }*/

      
      // Recommended
      /*
        var things = [];
        var items = snap.val().items;
        var events = snap.val().events;
        Object.keys(items).forEach(function(itemKey, idx) {
          if (idx < 2 || idx > 5) return;
          things.push({
            id: 'item-' + idx,
            title: 'No. ' + itemKey,
            caption: items[itemKey].name,
            display: items[itemKey].images.display,
            href: '/beta/items/' + itemKey
          });
        });
        
        // Start to render
        $('#recommended').append('<h3>' + Phrases.RECOMMENDED+ '</h3>');
        
        things.forEach(function(x, idx) {
          $('#recommended').append('<div id="' + x.id + '" class="col-xs-12 col-sm-6 col-md-4 col-lg-3"></div>');
          var vuItem = Views.build({
            view: 'CardLink',
            selector: '#' + x.id,
            data: {
              title: x.title,
              caption: x.caption,
              display: x.display,
              href: x.href
            }
          });
        });
        // TBD: Random items and events
      */

      // Events and Items
      var sample1 = 'https://firebasestorage.googleapis.com/v0/b/cope-326d5.appspot.com/o/user_apps%2Fdiplogifts-1%2Fimages%2Fevents%2F361-01.jpg?alt=media&token=648e83f2-f5f3-4b4f-adea-654015a4f658';
      var sample2 = 'https://firebasestorage.googleapis.com/v0/b/cope-326d5.appspot.com/o/user_apps%2Fdiplogifts-1%2Fimages%2Fitems%2F409_02.jpg?alt=media&token=eb2d0418-8966-4c8b-b0af-eb752831d9f6';
      Views.build({
        view: 'CoverStory',
        selector: '#events',
        data: { 
          href: '/beta/events',
          title: Phrases.EVENTS,
          imgsrc: sample1
        }
      });
      Views.build({
        view: 'CoverStory',
        selector: '#items',
        data: { 
          href: '/beta/items',
          title: Phrases.ITEMS,
          imgsrc: sample2
        }
      });

      break;
    case types.ITEM_LIST: 
      Dg.ref().child('items').once('value').then(function(snap) {  
        var items = snap.val();
        Object.keys(items).forEach(function(id, idx) {
          $(pageRoot).append('<div id="item-' + idx + '" ' 
            + 'class="col-xs-12 col-sm-6 col-md-4 col-lg-3"></div>');

          var vuItem = Views.build({
            view: 'CardLink',
            selector: '#item-' + idx,
            data: {
              title: 'No. ' + id,
              caption: items[id].name,
              display: items[id].images && items[id].images.display,
              href: '/beta/items/' + id,
              centered: true
            }
          }); // end of Views.build
        }); // end of Object.keys
      }); // end of Dg.ref
      break;

    case types.ITEM_SINGLE:
      var key = names[2],
          events = [],
          extLinks = [],
          imgsrc = {};
          itemDS = dataSnap();
      imgsrc.all = [];
 
      Dg.ref().child('items').child(key).once('value')
        .then(function(snap) {
        var vuPage = Views.build({
          snap: snap,
          view: 'ItemPage',
          selector: pageRoot
        }); 
        
        vuPage.ds('item', itemDS);

        if (extLinks) {
          Object.keys(extLinks).forEach(function(x) {
            extLinks.push(snap.val().extLinks[x]);
          });
        }

        itemDS.update({
          no: 'No. ' + key,
          name: snap.val().name,
          from: snap.val().from,
          to: snap.val().to,
          date: snap.val().receivedDate,
          extLinks: extLinks,
          images: snap.val().images,
          href: '/beta/items/' + key,
          editable: data.EDIT_MODE
        });

        // Update imgsrc.display
        Dg.getImage(snap.val().images.display)
          .then(function(url) {
          imgsrc.display = url;
          itemDS.update({ imgsrc: imgsrc }); 
        });
        
        try {
          // Update imgsrc.all
          Object.keys(snap.val().images.all)
            .forEach(function(_p) {
            var _pth = snap.val().images.all[_p];
            Dg.getImage(_pth).then(function(url) {
              imgsrc.all.push({
                src: url,
                path: 'items/' + _p
              });
              itemDS.update({ imgsrc: imgsrc }); 
            }); 
          });

          Object.keys(snap.val().eventIds).forEach(function(id) {
            var _path = id.replace(/\_/g, '/');
            var idu = id.lastIndexOf('_');
            var date = id.slice(0, idu);
            Dg.ref().child('events').child(_path).once('value')
              .then(function(_snap) {
              Dg.getImage(_snap.val().images.display)
                .then(function(url) {
                events.push({
                  date: date,
                  title: _snap.val().title,
                  href: '/beta/events/' + _path,
                  imgsrc: url
                });

                // Update "events"
                itemDS.update({ events: events });
              });
            }); // end of Dg.ref().child('event')...
          }); // end of Object.keys ...
        } catch (err) {
          console.error(err);
        } // end of try ... catch ...

        /*if (data.EDIT_MODE) {
          setEditorMode(vuPage, vuGallery, vuCard);

          // Set ControlBar
          Views.build({
            view: 'ControlBar',
            selector: pageRoot,
            method: 'prepend',
            data: {
              type: 'item',
              path: key,
              fetchSrc: vuCard.sel('@display')
            }
          });
        }*/
        // end of Dg.then
      }).catch(function(err) {
        console.error(err);
      });
      break;
    case types.EVENT_LIST:
      var years = [2011, 2012, 2013, 2014, 2015, 2016];
      var yearIdx = {};
      var vuYears = Views.build({
        view: 'Toggle',
        selector: pageRoot,
        data: {
          listItems: years,
          'default': 4
        }
      });

      years.forEach(function(year, idx) {
        yearIdx[year] = idx;
      });

      Dg.ref().child('events').once('value').then(function(snap) {
        Object.keys(snap.val()).sort().forEach(function(date) {
          var _data = snap.val()[date];

          Object.keys(_data).forEach(function(seq) {
            var eachEvent = _data[seq];
            var yyyy = yearIdx[date.slice(0, 4)];
            var evtId = 'event-' + date + '-' + seq;
            vuYears.$el('@sec-' + yyyy)
              .append('<div id="' + evtId + '" '
                + 'class="col-xs-12 col-sm-6 col-md-4 col-lg-3"></div>');

            var vuCard = Views.build({
              snap: snap.child(date).child(seq),
              view: 'CardLink',
              selector: vuYears.sel('@sec-' + yyyy) + ' #' + evtId,
              method: 'append',
              data: {
                type: 'event',
                title: date,
                caption: eachEvent.title,
                href: '/beta/events/' + date + '/' + seq,
                display: { path: 'images/display' }
              }
            }); // Views.build
          }); // _data.forEach
        }); // end.Object.keys
      }); // end of Dg.then
      break;

    case types.EVENT_SINGLE:
      var date = names[2],
          seq = names[3],
          path = date + '/' + seq,
          images = {},
          eventDS = dataSnap();
          itemsDS = dataSnap();
      images.all = [];    

      console.log(date);
      console.log(seq);
      
      var vuPage = Views.build({
        view: 'EventPage',
        selector: pageRoot
      });

      vuPage.ds('event', eventDS);
      vuPage.ds('items', itemsDS);
      
      // Update title and content
      Dg.ref().child('events').child(path)
        .once('value').then(function(snap) {
        console.log(snap.val());
        eventDS.update({
          path: path,
          title: snap.val().title,
          content: snap.val().content
        });

        // Update images
        try {
          Object.keys(snap.val().images.all).forEach(function(_p) {
            var _path = snap.val().images.all[_p];
            Dg.getImage(_path).then(function(url) {
              images.all.push({
                key: _p,
                src: url,
                path: _path
              });
              // Update images
              eventDS.update({
                images: images
              });
            });
          });
        } catch (err) {
          console.error(err);
        } // end of try ... catch ...

        if (data.EDIT_MODE && snap) {
          eventDS.update({
            editable: true,
            snap: snap
          });
        }
      }); // end of Dg.ref.then

      // Update items
      itemsDS.load('all', function() {
        var items = [];
        Dg.ref().child('events').child(path)
          .once('value').then(function(snap) {
          try {
            Object.keys(snap.val().itemIds).forEach(function(id) {
              Dg.ref().child('items').child(id).once('value')
                .then(function(_snap) {
                Dg.getImage(_snap.val().images.display)
                  .then(function(url) {
                  items.push({
                    id: id,
                    imgsrc: url,
                    title: 'No. ' + id,
                    caption: _snap.val().name
                  });

                  // Update items
                  itemsDS.update({ all: items });
                });
              }).catch(function(err) {
                // Remove records if not exist
                console.error('item ' + id + ' does not exist');
                snap.ref.child('itemIds').child(id).set(null);
              }); // end of Dg
            });
          } catch (err) { console.error(err); }
        }); // end of Dg
      }); // end of itemsDS.load("all")

      itemsDS.load();

      break;

        //asd
        /*var vuGallery = Views.build({
          snap: snap,
          view: 'ImgWall',
          selector: vuPage.sel('@images'),
          data: {
            images: { path: '/images/all' },
            savePathsAt: 'events/' + date + '/' + seq + '/images/all',
            saveImagesAt: 'events'
          }
        });

        if (data.EDIT_MODE) {
          setEditorMode(vuPage, vuGallery);
          // Set ControlBar
          Dg.getImage(snap.val().images.display).then(function(url) {
            Views.build({
              view: 'ControlBar',
              selector: pageRoot,
              method: 'prepend',
              data: {
                type: 'event',
                path: date + '/' + seq,
                fetchSrc: url
              }
            });
          }); // end of Dg.getImage
        }*/
      //}); // end of Dg.then

       // var total = img.val().all.length;
       // var images = [];
       // var itemLinks = [];

      /*var vuPage = Views.build({
        view: 'EventPage',
        selector: pageRoot,
        data: {
          date: date,
          title: { path: '/title' },
          content: { path: '/content' }
        }
      });*/
      
    case types.NEW_ITEM:
      Views.build({
        view: 'NewObj',
        selector: pageRoot,
        data: { 
          schema: 'Item'
        }
      });
      break;
    case types.NEW_EVENT:
      Views.build({
        view: 'NewEvent',
        selector: pageRoot
      });
      break;
    default:
  }; // end of switch
  timerRender.time();
}; // end of renderMain

//function setEditMode() {
//  Object.keys(Views.Rendered).forEach(function(id) {
//    Views.Rendered[id].setEditor();
//    console.log('[EDIT MODE] ' + id);
//  });
//}; // end of setEditMode

function setTimer() {
  return {
    start: new Date().getTime(),
    time: function() {
      var time = (new Date().getTime() - this.start) / 1000;
      console.log(time + ' seconds');
      return time;
    }
  };
};

function setEditorMode() {
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
    var vu = arguments[i];
    try {
      vu.setEditor();
    } catch (err) {
      console.error(err);
    }
  }
};

function showNav() {
  $('.back-to-home').css("opacity", "1");
};

// Expose Dg
window.Dg = Dg;

})(jQuery);
