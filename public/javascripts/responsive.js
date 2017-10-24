var MB = {
 
    mode: true, // true: show item picture
    visited: false,
    lastScrollTop: 0,
    goto: 'no',
    currentMainPage: $('#home-mode'),
    currentBackPage: $('#home-mode'),
    currentButtons: {
        search: 'search',
        home: 'home',
        menu: 'menu'
    },
    UNIT: {
        w: 0,
        h: 0,
        fontSize: 0,
        init: function() {
            this.w = $('body').width();
            this.h = $('body').height();
            if (this.h < this.w) {
                var tmp = this.w;
                this.w = this.h;
                this.h = tmp;
            } 
        }
    },

    AT: function() {
        var myAT = Acatool.build(false);
        myAT.goto = parseInt($('#acadatapipe-goto').html(), 10) || 'all';
        $('#acadatapipe-goto').remove();
        console.log(myAT.goto);
        //myAT.fetchData();
         
        /*var test = false;
        try {
           test = myAT.data[0].hasOwnProperty('name');
        } catch (e) {
           $('#home-mode').show();
           countdown = function(sec) {    
               $('#home-mode').html('<center><p>伺服器重載中...請稍候' + sec + '秒</p></center>');
               sec--;
               if (sec === 0) {
                   myAT = myAT.ajaxGet("/crud/read", processGoto);
                   return myAT;
               } else {
                   setTimeout(function() { countdown(sec); }, 1000);
               }
           }
           countdown(3);
        }*/
        var processGoto = function(res) {
            if (res.msg != 'OK') {
              return false;
            }
            myAT.data = res.data;
            MB.AT = myAT;
            MB.facebook.init();
            MB.run();
            //var len = myAT.data.length, goto;
            /*for (var i = 0; i < len; i++) {
                if (myAT.data[i].hasOwnProperty('goto')) {
                    myAT.goto = parseInt(myAT.data[i].goto, 10);
                    myAT.data.splice(i, 1);
                }
            }*/

        }
        //processGoto();
        
        $.ajax({
            "method": "GET",
            "url": '/crud/readposts/' + myAT.goto
        }).done(function(res) {
            processGoto(res);
        });

        //return myAT;
    },

    run: function() {

        //MB.AT;
        //MB.facebook.init();
        MB.setFIDs();
        if (window.innerWidth > window.innerHeight) {
           $('#landscape-mode').show().fadeOut('slow');
        }
        MB.UNIT.init();
        MB.initToolbar();
        MB.initScreen();
        MB.initHomeMode();
        MB.visited = true;
        if (typeof MB.AT.goto === 'number') {
            for (var i = 0; i < MB.AT.data.length; i++) {
                if (MB.AT.data[i].id === MB.AT.goto) {
                    MB.initCardMode(MB.AT.data[i].fid);
                    MB.initToolbar();
                    MB.setButton($('#home'), 'left');
                    MB.visited = false;
                }
            }
        }
    },

    setFIDs: function() {
        for (var i = 0; i < MB.AT.data.length; i++) {
            MB.AT.data[i].fid = Math.floor(Math.random() * 10000000);
        }
    },

    init: function() {
        $('body').css({
            'background': 'rgb(255, 255, 248)'
        });
        $('.screen').hide();
        $('#card-images-roll-mask').hide();
    },

    initSearchMode: function() {

        var phD = {
            dictionary: ['日本', '捷克', '蒙古', '南瀛', '澳洲', '藝術'],
            getKeyword: function() {
                var idx = Math.floor(Math.random() * (this.dictionary.length - 1));
                return this.dictionary[idx];
            }
        };

        MB.setButton($('#home'), 'main');

        MB.init();
        $('#search-mode').show();
        $('#search-mode').promise().done(function(){
            var inputH = 0.07 * MB.UNIT.h; //$('.input-search').height();
            $('.input-search').css('font-size', (inputH * 0.8) + 'px');
            $('.input-search').attr('placeholder', phD.getKeyword());
            $('.search-btn-set').css('font-size', inputH * 0.4 + 'px').
                css('height', inputH * 1.1 + 'px');
  
            $('#cancel').unbind('click');
            $('#cancel').click(function() {
                MB.currentMainMode();
                $('.input-search').val('');
            });

            $('#go').unbind('click');
            $('#go').click(function() {
                var totalCount = 0, nothing = '<center><p>請輸入關鍵字</p></center>';
                var result = '', isMatched = false;
                var searchText = $('input.input-search').val();
                $('.ul-search-results').html('');

                if (searchText !== null && searchText !== '' && searchText !== 'undefined') {
                    nothing = '';
                    for (var i = 0; i < MB.AT.data.length; i++) {
                        if (JSON.stringify(MB.AT.data[i].postTitle).indexOf(searchText) > -1 ||
                            JSON.stringify(MB.AT.data[i].name.indexOf(searchText)) > -1 ||
                            JSON.stringify(MB.AT.data[i].givenBy.indexOf(searchText)) > -1 ||
                            JSON.stringify(MB.AT.data[i].receivedDate.indexOf(searchText)) > -1 ||
                            JSON.stringify(MB.AT.data[i].event.title.indexOf(searchText)) > -1 ||
                            JSON.stringify(MB.AT.data[i].about.title.indexOf(searchText)) > -1 ||
                            JSON.stringify(MB.AT.data[i].region.indexOf(searchText)) > -1
                        ) {
                            var imgSRC = MB.AT.data[i].images.display;
                            result = '<li><div id = \"res-' + MB.AT.data[i].fid + '\"></div>' + 
                                '<span>' + MB.AT.data[i].postTitle + '</span></li>';

                            // Print result
                            $('ul.ul-search-results').append(result);

                            // CSS
                            $('div#res-' + MB.AT.data[i].fid).css({
                                'background-color': 'rgb(201, 145, 13)',
                                'background': 'url(' + imgSRC + ') 50% 50%',
                                'background-size': 'cover',
                                'background-repeat': 'no-repeat' 
                            });

                            // Set links
                            var cardLink = $('div#res-' + MB.AT.data[i].fid).parent();
                            cardLink.unbind('click');
                            cardLink.click(function() {
                                var fid = $(this).find('div').attr('id');
                                fid = parseInt(fid.slice(4), 10);
                                //MB.initCardMode(fid); 
                                //MB.setButton($('#home'), 'left');
                                MB.gotoCard(fid);
                            });
  
                            totalCount += 1;
                        }
                    }
                    if (totalCount === 0) {
                        nothing = '<center><p>請試試看其他關鍵字</p></center>';
                    }
                } // end of if
                $('ul.ul-search-results').append('<div class = \"inner-block\">' + nothing +'<p><br><br><br></p></div>');
            });

            $('input.input-search').unbind('focus');
            $('input.input-search').focus();
            $('body').scrollTop(0);
            
        });
        
    },

    gotoHome: function() {
        if (!MB.visited) location.href = '/m';
        MB.initHomeMode();
    },

    initHomeMode: function() {

        MB.currentMainPage = $('#home-mode');
        MB.init();
        $('#home-mode').show();
        MB.setButton($('#home'), 'home');

        $('#home-mode').promise().done(function() {

            // CSS
            var w = MB.UNIT.w * 0.94 * 0.7;
            var h = MB.UNIT.h * 0.86 * 0.3;
            $('.banner-home').
                css('font-size', 0.1 * w + 'px');
                //width(w).
                //height(h).

            $('body').css({
                'background': 'url("/images/g1s/s361_02.jpg") 50% 50%',
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
            });

            if (window.innerWidth < window.innerHeight) { 
                //$('.home-banners-set').width($('body').width() * 0.94 * 0.7);
            } else {
                //$('.home-banners-set').width($('body').width() * 0.94);
            }
        });
       
        // Go to campaigns
        $('#recent-campaigns').unbind('click');
        $('#recent-campaigns').click(function() {
            MB.initCampaignsMode();
            MB.setButton($('#home'), 'left');
        });
        
        // Go to items page
        $('#past-events-n-items').unbind('click');
        $('#past-events-n-items').click(function() {
            MB.mode = true;
            MB.initAllpostsMode();
        });

    },

    initMenuMode: function() {

        MB.setButton($('#home'), 'main');
        MB.setButton($('#menu'), 'cancel');
        $('#menu-mode').show();

        // Recover #menu button
        var recoverMenuButton = MB.recoverMenuButton;

        // CSS
        var blurScreen = {};
        $('#menu-mode').promise().done(function() {
            var w = 0.94 * 0.74 * MB.UNIT.w; //$('.menu-level-0').width();
            $('#menu-mode').
                css('position', 'absolute').
                css('top', '0').
                css('z-index', '3').
                css('background-color', 'rgba(255, 255, 255, 0.6)');
            $('h1').css('font-size', w * 0.09 + 'px');
            $('.menu-level-0').css('font-size', w * 0.1 + 'px');
            $('.screen').each(function() {
                if ($(this).is(':visible') && $(this).attr('id') !== 'menu-mode') {
                    blurScreen = $(this);
                    blurScreen.css({
                        '-webkit-filter': 'blur(15px)',
                        'filter': 'blur(15px)'
                    });
                }
            });
        });

        // Navigation links
        $('ul.menu-level-0 li').unbind('click');
        $('li#goto-home').click(function() {
            //MB.initHomeMode();
            MB.gotoHome();
            recoverMenuButton();
        });
        $('li#goto-campaigns').click(function() {
            MB.initCampaignsMode();
            recoverMenuButton();
        });
        $('li#past-events').click(function() {
            MB.mode = false;
            MB.initAllpostsMode();
            recoverMenuButton();
        });
        $('li#collected-items').click(function() {
            MB.mode = true;
            MB.initAllpostsMode();
            recoverMenuButton();
        });
        $('li#tryit').click(function() {
            //MB.initCardMode('try');
            MB.gotoCard('try');
            recoverMenuButton();
        });
        $('li#about-the-site').click(function() {
            MB.initAboutThisSiteMode();
            recoverMenuButton();
        });
        
        // Dynamic button
        $('#menu, #home').unbind('click');
        $('#menu, #home').click(function() {
           MB.currentMainMode();
           $('#menu-mode').hide();
           recoverMenuButton();
        });
    },

    initAllpostsMode: function() {
        
        MB.currentMainPage = $('#allposts-mode');
        MB.init();
        $('#allposts-mode').show();
        MB.setButton($('#home'), 'left');

        // Show all posts
        $('ul#posts li').remove(); 
        for (var i = 0; i < MB.AT.data.length; i++) {
            if (MB.AT.data[i].images.display) {
                var fid = MB.AT.data[i].fid;
                var imgSRC = (MB.mode) ? (MB.AT.data[i].images.display || '/images/fallback/noimage.png') :
                         (MB.AT.data[i].images.displayMayor || MB.AT.data[i].images.display);
                var html = '<li><div id = \"' + fid +'\"></div></li>';
                $('ul#posts').append(html); 
                $('div#' + fid).css('background', 'url(\"' + imgSRC + '\") 50% 50%');    

                // After clicking/tapping the specific card
                $('div#' + fid).unbind('click');
                $('div#' + fid).click(function() {
                    //MB.initCardMode(parseInt($(this).attr('id'), 10));
                    MB.gotoCard(parseInt($(this).attr('id'), 10));
                });
            }
        }

        // CSS         
        $('#allposts-mode').promise().done(function() {
            var s = 0.94 * 0.47 * MB.UNIT.w; //$('.ul-posts li').width();
            $('.ul-posts li').css('height', s + 'px').
                css('width', s + 'px');
            $('.ul-posts li div').css('height', s + 'px').
                css('width', s + 'px').
                css('background-size', 'cover').
                css('background-repeat', 'no-repeat');
            $('.ul-post').css('overflow', 'scroll').
                css('z-index', '0');

        });
    },

    gotoCard: function(fid) {
        $('.screen').hide();
        $('#waiting').show();
        if (fid === 'try') {
            var i = Math.floor( Math.random() * (MB.AT.data.length - 1) );
            location.href = '/m/' + MB.AT.data[i].id;
        }
        var cid = 0;
        for (var i = 0; i < MB.AT.data.length ;i++) {
            if (MB.AT.data[i].fid === fid) {
                cid = MB.AT.data[i].id;
                location.href = '/m/' + cid;
            }
        }
    },

    initCardMode: function(fid) {

        var prep = Card.contentPrep;
        
        var randomCard = Math.floor(Math.random() * (MB.AT.data.length - 1));
        fid = (fid !== 'try' && typeof fid === 'number') ? fid : MB.AT.data[randomCard].fid;

        var cardImages = '';

        var obj = {};
        for (var i = 0; i < MB.AT.data.length; i++) {
            if (fid === MB.AT.data[i].fid) {
                obj = MB.AT.data[i];
            }
        }

        MB.currentMainPage = $('#card-mode');
        MB.setButton($('#home'), 'left');
        MB.init();

        // Set DOM
        var imgSRC = (MB.mode) ? (obj.images.display || '/images/fallback/noimage.png') :
                     (obj.images.displayMayor || obj.images.display);
        $('#card-images-roll').css({
            'background': 'url(' + imgSRC + ') 50% 50%',
            'background-size': 'cover',
            'background-repeat': 'no-repeat'
        });
        
        //$('#item-title').html('<p>' + obj.postTitle + '</p>');
        $('#item-name').html('<p>' + obj.name + '</p>');
        $('#item-from').html('<p>' + obj.givenBy + '</p>');
        $('#item-to').html('<p>' + obj.receivedBy + '</p>');
        $('#item-date').html('<p>' + obj.receivedDate + '</p>');
        
        $('#event-section-title').html('<b>' + obj.event.title + '</b>');
        $('#event-section-content').html('<p>' + prep(obj.event.content) + '</p>');
        $('#about-section-title').html('<b>' + obj.about.title + '</b>');
        $('#about-section-content').html('<p>' + prep(obj.about.content) + '</p>');

        $('ul#showAllPics').html('').
            append('<li class = \"total-of-pics\"><center><p>共<span></span>張，輕觸螢幕關閉</p></center></li>');
        
        var imgArr = obj.images.others, count = 0;
        for (var i = 0; i < imgArr.length ; i++) {
            if (imgArr[i].slice(0, 8) === '/images/') {
                count++;
                $('ul#showAllPics').
                    append('<li><div class = \"order-of-pics\"><p><span>' +
                    count +'</span></p></div>' +
                    '<img src = \"' + imgArr[i] + '\" width = \"100%\"></li>');
            }
        }
        if (obj.images.hasOwnProperty('displayMayor')) {
            if (obj.images.displayMayor.slice(0, 8) === '/images/') {
                count++;
                $('ul#showAllPics').
                    append('<li><div class = \"order-of-pics\"><p><span>' +
                    count +'</span></p></div>' +
                    '<img src = \"' + obj.images.displayMayor + '\" width = \"100%\"></li>');
            }
        }
        $('ul#showAllPics').append('<li><div class = \"end-of-pics\"></div></li>');

        // Set facebook comment
        //var uri = 'http://tagw2-acatech.rhcloud.com/';
        var uri = 'http://diplogift.com/';
        //$('#card-fb-comments-div').html(MB.facebook.comments(uri));

        // Set fullscreen picture show
        $('.total-of-pics span').text(count);

        $('span.more-section-icn, #card-images-roll').unbind('click');
        $('span.more-section-icn, #card-images-roll').click(function() {


            $('#allpics-mode').unbind('click');
            $('#allpics-mode').click(function() {
                $('#allpics-mode').hide();
            });

            $('#allpics-mode').css('background-color', '#000').
                css('overflow-x', 'hidden').
                css('overflow-y', 'auto');


            $('#allpics-mode').show();
            

            $('#allpics-mode').promise().done(function() {
                $('body').scrollTop(0);
                $('.fullscreen').scrollTop(0);
                $('.fullscreen ul').scrollTop(0);

                // Add niceScroll
                $('.fullscreen').niceScroll().hide();
            });
        });

        // Social plugins
        $('.card-images').css({
            '-webkit-filter': 'blur(0)',
            'filter': 'blur(0)'
        });            
        $('span.share-section-icn').unbind('click');
        $('span.share-section-icn').click(function() {
            var url = 'http://diplogift.com/m/' + obj.id;
            $('.card-fb-icn').unbind('click');
            $('.card-fb-icn').click(function() {

                // Facebook share
                MB.facebook.sharePop(url, obj.postTitle, obj.event.content, imgSRC);
            });

            if ($('#card-images-roll-mask').is(':hidden')) {

                $('#card-images-roll-mask').show();
                $('.card-images').css({
                    '-webkit-filter': 'blur(15px)',
                    'filter': 'blur(15px)'
                });            

                // Set Line share button
                var msg = obj.postTitle + '\n' + 'http://diplogift.com/m/' + obj.id;
                var lineIt = MB.line.initButton(msg);
                $('span.card-line-icn').html(lineIt);
                $('#card-images-roll-mask').unbind('click');
                $('#card-images-roll-mask').click(function() {
                    $('#card-images-roll-mask').hide();
                    $('.card-images').css({
                        '-webkit-filter': 'blur(0)',
                        'filter': 'blur(0)'
                    });            
                });
            } else {
                $('#card-images-roll-mask').hide();
                $('.card-images').css({
                    '-webkit-filter': 'blur(0)',
                    'filter': 'blur(0)'
                });            
            }
            
        });

        $('#card-mode').show();
        $('.screen').scrollTop(0); 
        $('#toolbar').show();
        
    },

    initCampaignsMode: function() {

        MB.currentMainPage = $('#campaigns-mode');
        MB.init();
        $('#campaigns-mode').show();
        MB.setButton($('#home'), 'left');

        var w = 0.92 * MB.UNIT.w; //$('body').width();
        var h = 0.6 * w;

        var campaignsInfo = [];
        var getCampaignInfo = function(theCamp) {
            return {
                title: theCamp.title, //'U12 世界盃少棒錦標賽',
                date: theCamp.date, //'2015/7/24 - 2015/8/2',
                location: theCamp.location, //'台南市立棒球場',
                ticket: theCamp.ticket, //'免費',
                host: theCamp.host, //'美國世界少棒聯盟',
                site: theCamp.site, //'http://ibaf12u.pixnet.net/blog',
                image: theCamp.image, //'/images/fallback/baseball.jpg',
                getHtml: function(id) {
                    var cmpid = 'camp-' + id;
                    return '<ul id = \"' + cmpid + '\" + style = "margin-bottom: 16px;">' + 
                       '<li><div id = \"camp-pic-' + id +'\"></div></li>' + 
                       ((theCamp.title)? '<li><p>' + theCamp.title + '</p></li>' : '') + 
                       ((theCamp.date)? '<li><p>' + theCamp.date + '</p></li>' : '') + 
                       '<ul class = \"tapToShowMore\" style=\"display: none; border: 0; color: #333; font-size: 80%;\">' + 
                       ((theCamp.location)? '<li><p>' + theCamp.location + '</p></li>' : '') + 
                       ((theCamp.ticket)? '<li><p>門票：' + theCamp.ticket + '</p></li>' : '') + 
                       ((theCamp.host)? '<li><p>主辦單位：' + theCamp.host + '</p></li>' : '') + 
                       ((theCamp.site)? '<li><p><a target = \"_blank\" href = \"' + theCamp.site + '\">' +
                       '前往活動頁面</a></p>' : '') + '</ul>' +
                       ((theCamp.rel)? '<li><p><a target = \"_blank\" href = \"' + theCamp.rel + '\">' + 
                       '交流的起源</a></p>' : '') + '</ul>';
                }
            }
        };

        var getCamps = function(next) {
            $.ajax({
                type: 'GET',
                url: '/crud/campaigns'
            }).done(function(response) {
                if (response.msg === 'OK') {
                    for (var k = 0; k < response.camps.length; k++) {
                        campaignsInfo[k] = getCampaignInfo(response.camps[k]);
                    }
                    next();
                }
            });
        }

        var showTheCampaign = function(idx) {
            $('ul#campaigns').
                append(campaignsInfo[idx].getHtml(idx));

            $('#camp-' + idx).unbind('click');
            $('#camp-' + idx).click(function() {
                var target = $(this).find('.tapToShowMore');
                var isShown = false;
                if (target.is(':visible')) {
                    isShown = true;
                } 
                if (isShown) {
                    target.hide();
                } else {
                    target.show(200);
                }
            });

            // Set images
            $('#camp-pic-' + idx).css({
                'background': 'url(\"' + campaignsInfo[idx].image + '\") 50% 50%',
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
                'width': '100%',
                'height': h + 'px'
            });
        }

        var GOGOGO = function() {
            $('ul#campaigns').html('');
            for (var j = 0; j < campaignsInfo.length ; j++) { 
                showTheCampaign(j);
            }
            $('ul#campaigns').append('<p class\"extensive-block\"><br><br><br></p>');
        }

        // Start from here
        getCamps(GOGOGO);
    },

    initAboutThisSiteMode: function() {
        var countPictures = function() {
            var total = 0;
            for (var i = 0; i < MB.AT.data.length; i++) {
                //if (MB.AT.data[i].images.display.slice(0, 8) === '/images/') total += 1;
                if (MB.AT.data[i].images.others) {
                    for (var j = 0; j < MB.AT.data[i].images.others.length; j++) {
                        if (MB.AT.data[i].images.others[j].slice(0, 8) === '/images/') total++;
                    }
                }
                if (MB.AT.data[i].images.displayMayor.slice(0, 8) === '/images/') total += 1;
            }
            return total;
        }

        var totalpics = countPictures();
        var totalitems = 50;
        var totalposts = MB.AT.data.length;
  
        // Set DOM
        MB.init();
        $('#about-this-site-mode').show();
        $('#about-this-site-mode').html('').
            append('<ul id = \"ul-total\"><li><p><span id = \"total-posts\">' + totalposts + '</span>筆交流事件</p></li>' +
                '<li><p><span id = \"total-items\">' + totalitems + '</span>件典藏交流禮品</p></li>' +
                '<li><p><span id = \"total-pics\">' + totalpics + '</span>張照片</p></li></ul>').
            append('<div id = \"logos\"></div>').
            append('<div class = \"footer-info\"><b style = \"font-size:120%\">網站緣由</b>' +
                '<p>臺南市不斷與世界各地城市有著各式交流活動，同時也接收到來自各方祝福，收受了各種獨特的公務禮物，但這些禮物過去都只被保存在市府內未曾公開。每個禮物背後都是曾經聯繫的故事，為了讓這些故事更為人所知，讓記憶得以延續，因此誕生了這個網站。</p><b style = \"font-size:120%\">這個網站由誰提供？如何製作？</b><p>由臺南市政府以及 Aca 阿卡聯合出品，網頁及受贈禮品攝影由 Aca 阿卡執行製作。資料內容根據<a href=\"http://data.tainan.gov.tw\">臺南市政府資料開放平台</a>延伸應用。</p><b style = \"font-size:120%\">版權說明</b><p><a rel=\"license\" href=\"http://creativecommons.org/licenses/by-nc-sa/4.0/\"><img alt=\"創用 CC 授權條款\" style=\"border-width:0; margin-top:0; margin-bottom:-1em\" src=\"https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png\" /></a><br /><p style=\"font-size:105%; line-height:170%\"><span xmlns:dct=\"http://purl.org/dc/terms/\" property=\"dct:title\">台南市城市交流藝廊</span>由<span xmlns:cc=\"http://creativecommons.org/ns#\" property=\"cc:attributionName\"> Aca 阿卡國際</span>製作，以<a rel=\"license\" href=\"http://creativecommons.org/licenses/by-nc-sa/4.0/\">創用CC 姓名標示-非商業性-相同方式分享 4.0 國際 授權條款</a>釋出。</p></div>').
            append('<p><br><br><br><br><br></p>');
        
        $('#logos').height($('#logos').width() * 625 / 1283);
        $('#logos').css('background-image', 'url(\"/images/icons/aca-tn.png\")').
            css('background-size', 'cover').
            css('background-repeat', 'no-repeat');

        // Running numbers!
        var running = function(p, q, r) {
            if (p <= totalposts) $('span#total-posts').text(p);
            if (q <= totalitems) $('span#total-items').text(q);
            if (r <= totalpics) $('span#total-pics').text(r);
            if (Math.max(p, q, r) < totalpics) {
                setTimeout(function() { running(p + 1, q + 1, r + 1); }, 1);
            } 
        }
        running(0, 0, 0);

        $('.screen').scrollTop(0);

    },

    landscapeMode: function() {
        MB.init();
        
    },

    initScreen: function() {
        //var gap = ($('#toolbar').width() - $('.screen').width()) / 2 ;
        var gap = 0.03 * MB.UNIT.w; //( 1 - 0.94 ) / 2;
        $('.screen').css('margin', 'auto ' + gap + 'px');

        // On scroll to show/hide toolbar
        $('.screen').unbind('scroll');
        $('.screen').scroll(function(event) {
            var lst = MB.lastScrollTop,
                st = $(this).scrollTop(),
                h = 0.14 * MB.UNIT.h;//$('#toolbar').height();
            if (st > lst && st > 0) {
                h = 0 - h;
                $('#toolbar').hide();
                $(this).css('height', '96%');
            } else {
                h = 0;
                $(this).css('height', '86%');
                $('#toolbar').show();
            } 
            MB.lastScrollTop = st;
        });
    },

    currentMainMode: function() {

        if ($('#card-mode').is(':visible') && $('#menu-mode').is(':hidden')) {
            MB.currentMainPage = $('#allposts-mode');
            MB.init();
            MB.currentMainPage.show();
            if ($('ul#posts li').length < 2) {
                MB.initAllpostsMode();
            }
            MB.setButton($('#home'), 'left');
        } else if ($('#allposts-mode').is(':visible') && $('#menu-mode').is(':hidden')) {
            MB.currentMainPage = $('#home-mode');
            MB.gotoHome();
            //MB.init();
            //MB.currentMainPage.show();
            MB.setButton($('#home'), 'home');
        } else if ($('#campaigns-mode').is(':visible') && $('#menu-mode').is(':hidden')) {
            MB.currentMainPage = $('#home-mode');
            MB.gotoHome();
            //MB.init();
            //MB.currentMainPage.show();
            MB.setButton($('#home'), 'home');
        } else {
            MB.init();
            MB.currentMainPage.show();
            if (MB.currentMainPage.attr('id') === 'home-mode') {
                MB.setButton($('#home'), 'home');
      
                $('body').css({
                    'background': 'url("/images/g1s/s361_02.jpg") 50% 50%',
                    'background-size': 'cover',
                    'background-repeat': 'no-repeat',
                });

            } else {
                MB.setButton($('#home'), 'left');
            }
        }

        // Reset home-mode
        if (window.innerWidth < window.innerHeight) {
            //$('.home-banners-set').width($('body').width() * 0.94 * 0.7);
        } else {
            //$('.home-banners-set').width($('body').width() * 0.94);
        }

    },

    initToolbar: function() {

        MB.setButton($('.circle'), 'init');
        MB.setButton($('#search'), MB.currentButtons.search);
        MB.setButton($('#home'), MB.currentButtons.home);
        MB.setButton($('#menu'), MB.currentButtons.menu);

        // Event handler
        $('.circle').unbind('click');
        $('.circle').click(function() {

            var selected = $(this).attr('id');
            switch (selected) {
                case 'search':
                    MB.initSearchMode();
                    MB.recoverMenuButton();
                    break;
                case 'home':
                    MB.currentMainMode();
                    break;
                case 'menu':
                    MB.initMenuMode();
                    break;
                default:
                    //MB.initHomeMode();
            }
        });
    }, 

    setButton: function(_btn, mode) {

        // btn should be jQ object
        var BTN = _btn;

        var h = $('#toolbar').height();
        var middle = ($('#toolbar').width() - 0.8 * h) / 2;
        var border = h * 0.1;
        var r = h * 0.4 + 1;
        var icons = {
            src: '/images/icons/icon_sprite_set-09.svg',
            home: '0 33%', 
            left: '0 16.7%',
            all: '0 50%',
            card: '0 66.6%',
            cancel: '0 0',
            menu: '0 83%',
            search: '0 100%',
            init: function(targetBtn) {
                targetBtn.height(h * 0.8).width(h * 0.8).
                    css('background-image', 'url(\"' + icons.src + '")').
                    css('background-size', 'cover').
                    css('background-repeat', 'no-repeat').
                    css({
                        borderTopLeftRadius: r,
                        borderTopRightRadius: r,
                        borderBottomLeftRadius: r,
                        borderBottomRightRadius: r,
                        WebkitBorderTopLeftRadius: r,
                        WebkitBorderTopRightRadius: r,
                        WebkitBorderBottomLeftRadius: r,
                        WebkitBorderBottomRightRadius: r,
                        MozBorderRadius: r 
                    });
                    $('#home').css('margin', border + 'px ' + middle + 'px').
                        css('border', 'solid 1px rgb(117, 76, 41)');
                    $('#menu').css('margin', border + 'px');
                    $('#search').css('margin', border + 'px');
                    $('#menu').css('left', 'auto').css('right', 0);
            },
            setToMain: function() {
                switch (MB.currentMainPage.attr('id')) {
                    case 'home-mode': mode = 'home'; break;
                    case 'campaigns-mode': mode = 'all'; break;
                    case 'allposts-mode': mode = 'all'; break;
                    case 'card-mode': mode = 'card'; break;
                    default: console.log('id = ' + MB.currentMainPage.attr('id'));
                }
            },
            setCurrentButtons: function(jqbtn, mode) {
                var btn = '';
                if (jqbtn.attr('id') === 'home') btn = 'home';
                if (jqbtn.attr('id') === 'search') btn = 'search';
                if (jqbtn.attr('id') === 'menu') btn = 'menu';
                MB.currentButtons[btn] = mode;
            }
        }

        if (icons[mode] !== undefined && icons[mode] !== null && typeof icons[mode] !== 'function') {
            if (mode === 'left' && $('home-mode').is(':visible')) {
                mode = 'home';
                BTN = $('#home');
            }
            BTN.css('background-position', icons[mode]);
            icons.setCurrentButtons(BTN, mode);
        } else if (mode === 'init') {
            icons.init(BTN);
        } else if (mode === 'main') {
            icons.setToMain();
            $('#home').css('background-position', icons[mode]);
            icons.setCurrentButtons($('#home'), mode);
        } else if (mode === 'current') {
            icons.setToCurrent();
        } 
    },

    recoverMenuButton: function() {
        $('#menu').unbind('click');
        $('#menu').click(function() {
            MB.initMenuMode();
        });

        MB.setButton($('#menu'), 'menu');

        // Recover the background screen
        var blurScreen = $('.screen');
        blurScreen.css({
            '-webkit-filter': 'blur(0)',
            'filter': 'blur(0)'
        });
    },

    facebook: {

        init: function() {
            window.fbAsyncInit = function() {
                FB.init({
                    appId: '306911439343485',
                    xfbml: true,
                    status: true,
                    version: 'v2.3'
                });
            };
            $('body').prepend('<div id = \"fb-root\"></div>');

            (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            })(document, 'script', 'facebook-jssdk');
        },

        shareBtnDiv: '<div class = \"about-site-fb-share\"><div ' + 
                       'class = \"' + 'fb-share-button' + '\"' +
                       'data-href = \"' + 'http://diplogift.com/' + '\"' +
                       'data-layout = \"' + 'icon_link' + '\"></div></div>',

        likeBtnDiv: '<div ' +
                      'class=\"fb-like\" ' +
                      'data-share=\"true\" ' +
                      'data-width=\"300\" ' +
                      'data-layout=\"standard\" ' + 
                      'data-action=\"like\" ' +
                      'data-show-faces=\"true\" ' + 
                      'data-share=\"true\">' + 
                    '</div>', 

        sharePop: function(url, title, des, picSRC) {
            console.log('[FB sharing]\n' + url + '\n' + title + '\n' + des.slice(0, 100) + '\n' + picSRC);
            //picSRC = 'http://tagw2-acatech.rhcloud.com/' + picSRC;
            picSRC = 'http://diplogift.com/' + picSRC;
            des = des.slice(0, 150) + '......';
                
            FB.ui(
            {
                method: 'feed',
                link: url, 
                name: title,
                description: des,
                picture: picSRC
            }, function(response){});
        },

        comments: function(uri) {
        // 696111810494747
            FB.api(
                "/983776801647287/comments",
                function (response) {
                    if (response && !response.error) {
                        /* handle the result */
                        for (var name in response.data[0]) {
                            console.log(name + ' : ' + response.data[0][name]);
                        }
                    }
                }
            );
            return '<p>FB comments</p>';
        }

    }, // end of facebook

    line: {
        initButton: function(_text) {
            var imgPath = '/images/icons/0608_mobile_social_button_gold_line.svg';
            return '<a class = \"card-line-icn\" href="http://line.me/R/msg/text/?' + _text + '"></a>';
                //<img src="' + imgPath + '" width="100" height="100" alt="LINE it!" /></a>'
        },

        script: function(str) {
            return '<script type = \"text/javascript\" src=\"//media.line.me/js/line-button.js?v=20140411\">' +
                   '</script>' +
                   '<script type = \"text/javascript\">' +
                   'new media_line_me.LineButton({\"pc\":false,\"lang\":\"en\",\"type\":\"d\",\"text\":\"' + str +
                   '\",\"withUrl\":true})' +
                   '</script>';
        },

        getButton: function(str) {
            return new media_line_me.LineButton({"pc":false,"lang":"en","type":"d","text":"hey","withUrl":true});
        }

    }
};

//MB.facebook.init();
//MB.run();
$(window).resize(function() {

    // Landscape mode
    if (window.innerWidth > window.innerHeight) {
        MB.initToolbar();
        //$('#toolbar').hide();
        MB.initScreen();

        $('input.input-search').unbind('focus');
        if ($('#search-mode').is(':hidden')) {
            $('#landscape-mode').show().fadeOut('slow');            
        }

        // Reset Home-mode
        if ($('#home-mode').is(':visible')) {
            //$('.home-banners-set').width($('body').width() * 0.94);
        }

    // Portrait mode
    } else {
        // font-size fixed
        var fontSize = $('.screen').css('font-size');

        MB.initToolbar();
        MB.initScreen();

        $('.screen').css('font-size', fontSize);
        $('#landscape-mode').hide();
        $('#toolbar').show();
 
        // Reset Home-mode
        if ($('#home-mode').is(':visible')) {
            //$('.home-banners-set').width($('body').width() * 0.6956);
        }
    }
});

$(window).bind('beforeunload', function(e) {
    var message = "確定要離開本網站嗎？";
    e.returnValue = message;
    console.log('Leaving...');
    //return message;
});

MB.AT();
