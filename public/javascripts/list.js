var List = {

    UNIT: {
        setWH: function() {
            List.UNIT.w = $(window).width();
            List.UNIT.h = $(window).height();
        },

        H: function() {
            return $(window).height();
        }
    },
                       
    GOGO: function() {

        var w = window.innerWidth, h = window.innerHeight;
        var myAT = Acatool.build(false);
        //myAT.fetchData();
        myAT.goto = parseInt($('#acadatapipe-goto').html(), 10) || 'all';
        $('#acadatapipe-goto').remove();

        if (myAT.mobilecheck() && w / h < 1) {
            if (typeof myAT.goto === 'number') { 
                var gotothis = '/m/' + myAT.goto;
                location.href = gotothis;
            } else { 
                location.href = '/m';
            }
        } //else {
        //    List.views();
        //}

        /*try {
            var test =  myAT.data[0].hasOwnProperty('name') 
        } catch(e) {
            myAT = myAT.ajaxGet("/crud/read", processGoto);
            console.log('ajaxGet');
            return myAT;
        }*/
        var processGoto = function(res) {

            if (res.msg !== 'OK') return false;

            myAT.data = res.data;
            //var len = myAT.data.length; //goto;
            //console.log(myAT.data);
            
            //for (var i = 0; i < len; i++) {
            //    if (myAT.data[i].hasOwnProperty('goto')) {
            //        myAT.goto = parseInt(myAT.data[i].goto, 10);
            //        myAT.data.splice(i, 1);
            //    }
            //}

            //myAT.goto = parseInt($('#acadatapipe-goto').html(), 10) || 'NaN';
            //$('#acadatapipe-goto').remove();
            //console.log('goto ' + myAT.goto);
            List.AT = myAT;
            List.onReady();
        }
        //var test = false; 
        //if (!test) {
            //myAT.ajaxGet("/crud/read", processGoto);
            
            //console.log('ajaxGet');
            //return myAT;
        //}

        //processGoto();

        $.ajax({
            'method': 'GET', 
            'url': '/crud/readposts/' + myAT.goto
        }).done(function(res) { 
            processGoto(res);
        });

        //return myAT;
    },

    mode: true,
    noresIMGarray: [],

    onReady: function() {

        //var w = window.innerWidth, h = window.innerHeight;

        //List.AT;
        //if (List.AT.mobilecheck() && w / h < 1) {
        //    if (typeof List.AT.goto === 'number') { 
        //        var gotothis = '/m/' + List.AT.goto;
        //        location.href = gotothis;
        //    } else { 
        //        location.href = '/m';
        //    }
        //} else {
        List.views();
        //}

        List.UNIT.setWH();
    },

    views: function() {

        List.setBigCover();
        List.showCards();

        if (typeof List.AT.goto === 'number') {
            for (var i = 0; i < List.AT.data.length; i++) {
                if (List.AT.data[i].id === List.AT.goto) {
                    List.showCardByID(List.AT.goto);
                    //List.initCardMode(MB.AT.data[i].fid);
                    //List.initToolbar();
                    //List.setButton($('#home'), 'left');
                    //List.visited = false;
                }
            }
        }
  
        var lastST = 0;
        $('a.floating-logo').click(function() {
            var st = $('body').scrollTop(),
                dst = 0;
            if (st !== 0) {
                lastST = $('body').scrollTop();
            } else {
                dst = lastST;
            }
            $('html').css('overflow', 'auto');
             
            $('body').animate({
                scrollTop: dst
            }, 500 + st/3);
            return false;
        });
        $('a.logo, h1').click(function() {
            //$('html').css('overflow', 'auto');
            $('body').animate({
                scrollTop: List.UNIT.h - 140
            }, 500);
            List.showCards();
            return false;
        });
        $('#qry').focus(function() {
            $('body').animate({
                scrollTop: List.UNIT.h - 48
            }, 500);
        });
        $('#qry').keyup(function() {
            var text = $('#qry').val();
            if (text !== '') {
                List.searchMode(text);
            } else {
                List.showCards();
            }
            $('body').animate({
                scrollTop: List.UNIT.h - 48
            }, 500);
        });

        List.toggleDisplay();
  
        // Scroll Lock
        $(window).scroll(function() {
            var st = $('body').scrollTop();
            if ($('#card-result').is(':visible') && st > List.UNIT.h) {
                $('body').scrollTop(List.UNIT.h);
                $('html').css('overflow', 'hidden');
            }
        });

        $('.featuring-section').mouseenter(function() {
            $('html').css('overflow', 'hidden');
        });

        $('.featuring-section').mouseleave(function() {
            $('html').css('overflow', 'auto');
        });

        // In Card Mode, unlock the overflow if scrolling up
        $('#right-col, #left-col').scroll(function() {
            $('html').css('overflow', 'auto');
        });

    },

    init: function() {
        $('.content').hide();
        $('#all-result').html('');
        $('.wide').css('height', 'auto');   
        $('#filter-bar').show();
        $('html').css('overflow', 'auto');
    },

    toggleDisplay: function() {
        $('div.toggle-gift').click(function() {
            var st = $('body').scrollTop();
            switch (List.mode) {
                case true: 
                    $(this).css({
                        'background-position': '0 76%'
                    });
                    List.mode = false;
                    List.showCards();
                    break;
                case false: 
                    $(this).css({
                        'background-position': '0 0'
                    });
                    List.mode = true;
                    List.showCards();
                    break;
                default:
            }
            //$('body').scrollTop(st);
        });
    },

    // Instant search
    searchMode: function(text) {
 
        $('body').scrollTop(List.UNIT.h - 48); //660
        List.showCards();
        text = text.trim();

        // Filtering
        for (var i = 0; i < List.AT.data.length; i++) {
            var str = JSON.stringify(List.AT.data[i]);
            var idx = str.indexOf(text);
            if (idx < 0) {
                $('div#' + List.AT.data[i].id).remove();
            }
        }

        // No result
        if ($('div.card').length < 1) {
            List.init();
            $('#all-result').html('');
            $('#all-result').show();
        }
    },

    setBigCover: function() {
        
        var getCamps = function(next) {
            $.ajax({
                type: 'GET',
                url: '/crud/campaigns'
            }).done(function(response) {
                if (response.msg === 'OK') {
                    next(response.camps);
                } else {
                    console.log('fail');
                }
            });
        }
        
        var setCampArr = function(arr) {
            var campArr = [];
            for (var j = 0; j < arr.length; j++) {
                campArr[j] = {
                    idx: j + 1,
                    self: arr[j],
                    title: arr[j].title,
                    date: arr[j].date,
                    location: arr[j].location,
                    ticket: arr[j].ticket,
                    host: arr[j].host,
                    site: arr[j].site,
                    image: arr[j].image,
                    rel: arr[j].rel,
                    content: (function() {
                        var lines = [ 
                            arr[j].date || '', 
                            arr[j].location || '', 
                            arr[j].ticket ? '售票：' + arr[j].ticket : '',
                            arr[j].host ? '主辦單位：' + arr[j].host : '',
                            arr[j].site ? '<a style = "color: rgb(201, 152, 23);"' + 
                                ' target = "_blank" href = "' + arr[j].site + '">' + 
                                '前往活動官網</a>' : '',
                            arr[j].rel ? '<a style = "color: rgb(201, 152, 23);"' + 
                                ' target = "_blank" href = "' + arr[j].rel + '">' + 
                                '交流的起源</a>' : ''
                        ];

                        return lines.reduce(function(x, y) {
                            if (y) y = y + '<br>';
                            return x + y;
                        },'');
                    })(),
                    up: arr[j].image,
                    mid: arr[j].image,
                    down: arr[j].image,
                    next: (j + 1) % arr.length,
                    prev: (j - 1 + arr.length) % arr.length,
                    total: arr.length
                }
            }

            for (var j = 0; j < campArr.length; j++) {
                campArr[j].next = campArr[(j + 1) % campArr.length];
                campArr[j].prev = campArr[(j - 1 + campArr.length) % campArr.length];
            }

            var campFirst = campArr[0];
            var eventPostFirst = eventPosts[0];
            
            fillInFeaturing($('#feature-event'), eventPostFirst);
            clickEvents(eventPosts, campArr);
            if (typeof List.AT.goto === 'number') {
                myScrollTop(List.UNIT.H() - 140);
            } 

            $('.waiting-container').hide().remove();

        } // EOF setCampArr

        

        // Statistics
        var countPictures = function() {
            var total = 0;
            for (var i = 0; i < List.AT.data.length; i++) {
                //if (List.AT.data[i].images.display.slice(0, 8) === '/images/') total += 1;
                if (List.AT.data[i].images.others) {
                    for (var j = 0; j < List.AT.data[i].images.others.length; j++) {
                        if (List.AT.data[i].images.others[j].slice(0, 8) === '/images/') total++;
                    }
                }
                if (List.AT.data[i].images.displayMayor.slice(0, 8) === '/images/') total += 1;
            }
            return total;
        }
        var totalposts = List.AT.data.length;
        var totalgifts = 50;
        var totalpics = countPictures();
        var running = function(p, q, r) {
            if (p <= totalposts) $('span#count-posts').text(p);
            if (q <= totalgifts) $('span#count-gifts').text(q);
            if (r <= totalpics) $('span#count-pics').text(r);
            if (Math.max(p, q, r) < totalpics) {
                setTimeout(function() { running(p + 1, q + 1, r + 1); }, 1);
            }
        };

        // Set div background image
        var setBG = function(path) {
            return {
                'background': 'url(' + path + ') 50% 50%',
                'background-size': 'cover',
                'background-repeat': 'no-repeat'
            };
        }

        // Scroll to top
        myScrollTop = function(mst) {
            $('body').animate({
                scrollTop: mst
            }, 500);
        }

        // Find faved articles
        var eventPosts = [], counter = 0;
        for (var i = 0; i < List.AT.data.length ; i++) {
            if (List.AT.data[i].hasOwnProperty('isFaved') || i === 0) {
                if (List.AT.data[i].isFaved || i === 0) {
                    eventPosts[counter] = {};
                    eventPosts[counter].title = List.AT.data[i].event.title;
                    eventPosts[counter].content = List.AT.data[i].event.content;
                    eventPosts[counter].content += '<br><br><a href = "/' + List.AT.data[i].id +
                                                   '" style = "color: #ccc; position: absolute; right: 0;">閱讀更多</a><br><br>';
                    var ds = List.AT.data[i].images.display;
                    var dm = (List.AT.data[i].images.hasOwnProperty('displayMayor')) ? 
                             List.AT.data[i].images.displayMayor : ds;
                    eventPosts[counter].up = dm;
                    eventPosts[counter].mid = ds;
                    eventPosts[counter].down = dm;
                    counter++;
                }
            }
        }

        if (eventPosts.length > 1 && (!List.AT.isFaved)) {
            eventPosts = eventPosts.slice(1);
        }

        for (var j = 0; j < eventPosts.length; j++) {
            eventPosts[j].idx = j + 1;
            eventPosts[j].prev = eventPosts[(j - 1 + eventPosts.length) % eventPosts.length];
            eventPosts[j].next = eventPosts[(j + 1) % eventPosts.length];
            eventPosts[j].total = eventPosts.length; 
        }


        // Fill in the text and CSS
        var fillInFeaturing = function(jQsection, post) {

            $('.featuring-post').hide();
            jQsection.show();

            $('#feature-event-title').text(post.title);
            $('#feature-event-content').html(post.content);
            //$('#feature-event').show();

            $('.pic-up').css(setBG(post.up));
            $('.pic-mid').css(setBG(post.mid));
            $('.pic-down').css(setBG(post.down));
            $('#f-count').text( post.idx + '/' + post.total);
            $('.featuring-nav span').fadeIn(200);

            $('#right-side-about').hide();
            $('#right-side-articles').show();
            myScrollTop(0);

            // Set next post
            $('.prev, .next').unbind('click');
            $('.next').click(function() {
                //console.log('next: ' + post.next.title);
                fillInFeaturing(jQsection, post.next);    
            });

            // Set prev post
            $('.prev').click(function() {
                fillInFeaturing(jQsection, post.prev);    
            });

        }
      
        // Event handlers of menu
        var clickEvents = function(EP, CA) {
            $('.home-menu li').unbind('click');
            $('#li-featuring').click(function() {
                fillInFeaturing($('#feature-event'), EP[0]);
            });
            $('#li-camp').click(function() {
                fillInFeaturing($('#feature-event'), CA[0]);
                //console.log('CA[0].next = ' + CA[0].next.title);
            });
            $('#li-about-this').click(function() {
                $('.featuring-post').hide();
                $('#feature-about').show();
                $('#right-side-about').show();
                $('#right-side-articles').hide();
                myScrollTop(0);
                $('.featuring-nav span').fadeOut(200);
                running(0, 0, 0);
            });
            $('#li-past').click(function() {
                $('a.logo').click();
                $('body').scrollTop(List.UNIT.h - 140); // 570
            });
        }

        // Start from here
        getCamps(setCampArr);
 
    },

    showCards: function() {
        var i, imgSRC = '', mode = List.mode;

        List.init();

        for (i = 0; i < List.AT.data.length; i++) {
            var cardID = List.AT.data[i].id;
            var cardTitle = (mode) ? List.AT.data[i].name : List.AT.data[i].postTitle;
            imgSRC = (mode) ? (List.AT.data[i].images.display || '/images/fallback/noimage.png') :
                     (List.AT.data[i].images.displayMayor || List.AT.data[i].images.display);
            $('#all-result').append(List.card(cardID, cardTitle));
            $('#all-result').show();

            // CSS
            var cardDiv = 'div#' + cardID;
            $(cardDiv).
                css('height', '326px');
            $(cardDiv + ' a').
                css('background', 'url(' + imgSRC + ')').
                css('background-size', 'cover').
                css('background-repeat', 'no-repeat').
                css('background-position', 'center');                                 

            // JQuery - Display the selected card
            $(cardDiv).click(function() {
                //List.showCardByID(parseInt($(this).attr('id')));
                location.href = '/' + parseInt($(this).attr('id'));
            });

            if (parseInt($(cardDiv + ' div div p').css('height'), 10) > 49) {
                cardTitle = cardTitle.slice(0, 26) + '...';
                $(cardDiv + ' div div p').text(cardTitle);
            }

        }
    }, // EOF showCards

    // Display single card by ID
    showCardByID: function(j) {
        if (typeof j === 'number') {
            var obj, hasGotObj = false;

            for (var i = 0; i < List.AT.data.length; i++) {
                if (j === List.AT.data[i].id) {
                    obj = List.AT.data[i];
                    hasGotObj = true;
                }
            }
            if (hasGotObj) {
                List.init();
                if (List.AT.mobilecheck() && w / h < 1) {
                    location.href = '/m/' + j;
                }
                Card.onReady(obj);
                $('#filter-bar').hide();
                $('#card-result').show();
                $('body').scrollTop($(window).height() - 140); // 570
            }
        }
    }, // EOF showCardByID

    card: function( cardID, cardTitle ) {
        var cardHTML = '';
        cardHTML += '<div id = '+ cardID + ' class = \"card\">' +
                      '<a class = \"card-icn\">' +
                      '</a>' +
                      '<div class = \"sexy-bar\"></div>' +
                      '<div class = \"card-description\">' +
                        '<div id = \"p-wrapper\">' + 
                        '<p class = \"caption\">' + cardTitle + '</p>'+
                        '</div>' +
                      '</div>' +
                    '</div>';
        return cardHTML;
    }, // EOF card

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
        }
    }
};

$(document).ready(function() {
    List.facebook.init();
    //List.onReady();
    List.GOGO();
});
