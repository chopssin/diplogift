var Editlist = {

    AT: (function() {
        var myAT = Acatool.build(false);
        myAT.fetchData();

        var len = myAT.data.length, goto;
        for (var i = 0; i < len; i++) {
            if (myAT.data[i].hasOwnProperty('goto')) {
                myAT.goto = parseInt(myAT.data[i].goto, 10);
                myAT.data.splice(i, 1);
            }
        }

        return myAT;
    })(),

    mode: true,
    sid: -1,
    noresIMGarray: [],
    waitingHTML: function() {
        return '' +
          '<div id = "waiting">' +
            '<div class = "spinner">' +
              '<div class = "double-bounce1"></div>' +
              '<div class = "double-bounce2"></div>' +
            '</div>' + 
        '</div>';
    }, 

    onReady: function() {

        var w = window.innerWidth, h = window.innerHeight;

        Editlist.AT;
        if (Editlist.AT.mobilecheck() && w / h < 1) {
            location.href = '/m';
        } else {
            Editlist.views();
        }
    },

    beforeViews: function() {
        $('#nav-cities, #nav-comments, #card-showbox-comments').remove();
    },

    views: function() {

        Editlist.beforeViews();
        Editlist.showCards();

        if (typeof Editlist.AT.goto === 'number') {
            for (var i = 0; i < Editlist.AT.data.length; i++) {
                if (Editlist.AT.data[i].id === List.AT.goto) {
                    Editlist.showCardByID(List.AT.goto);
                }
            }
        }

        $('a.logo, h1').click(function() {
            $('body').scrollTop(0);
            Editlist.showCards();
        });
        $('#qry').keyup(function() {
            var text = $('#qry').val();
            if (text !== '') {
                Editlist.searchMode(text);
            } else {
                Editlist.showCards();
            }
        });

        Editlist.toggleDisplay();

        // Recent campaigns panel
        // Do something ...         

        // Log out
        $('.logout-btn').click(function() {
            location.href = '/out';
        });
    },

    init: function() {
        $('.content').hide();
        $('#all-result').html('');
    },

    toggleDisplay: function() {
        $('div.toggle-gift').click(function() {
            switch (Editlist.mode) {
                case true: 
                    $(this).css('background', 'url(\"/images/icons/bs_icn_gift.svg\")').css('background-size', 'cover');
                    Editlist.mode = false;
                    Editlist.showCards();
                    break;
                case false: 
                    $(this).css('background', 'url(\"/images/icons/bs_icn_ppl.svg\")').css('background-size', 'cover');
                    Editlist.mode = true;
                    Editlist.showCards();
                    break;
                default:
            }
        });
    },

    // Instant search
    searchMode: function(text) {
 
        Editlist.showCards();
        text = text.trim();

        for (var i = 0; i < Editlist.AT.data.length; i++) {
            var str = JSON.stringify(Editlist.AT.data[i]);
            var idx = str.indexOf(text);
            if (idx < 0) {
                $('div#' + Editlist.AT.data[i].id).remove();
            }
        }
        if ($('div.card').length < 1) {
            Editlist.init();
            $('#all-result').html('');
            $('#all-result').show();
        }
    },

    showSettings: function() {
        var isRecentON = false, isFavedON = false;
        $('#settings').show();

        // Switch on/off recent campaign panel
        Editlist.showCampaigns();
        $('#show-recent-camp').unbind('click');
        $('#show-recent-camp').click(function() {
            if (isRecentON) {
                $('#recent-camp').hide();
                $('#all-result').show();
                isRecentON = false;
            } else {
                $('#recent-camp').show();
                $('#all-result').hide();
                isRecentON = true;
            }
        });

        // Switch on/off faved posts
        $('#show-faved-posts').unbind('click');
        $('#show-faved-posts').click(function() {
            $('#recent-camp').hide();
            $('#all-result').show();
            var on = function() {
                $('.card').hide();
                for (var i = 0; i < Editlist.AT.data.length; i++) {
                    if (Editlist.AT.data[i].hasOwnProperty('isFaved')) {
                        if (Editlist.AT.data[i].isFaved) {
                            $('#' + Editlist.AT.data[i].id).show();   
                        }
                    }
                }
                isFavedON = true;
            }
            if (isFavedON) {
                $('.card').show();
                isFavedON = false;
            } else {
                on();
            }
        });
    },
 
    showCampaigns: function() {
        // Get all campaigns
        var arr = [{title: 'test'}];
        var idx = [];
        var getCampaigns = function(callback) {
            $.ajax({
                type: 'GET',
                url: '/crud/campaigns'
            }).done(function(response) {
                if (response.msg === 'OK') {
                    arr = response.camps;
                    callback();
                }
            });
        }

        var myCallback = function() {

            // Show all campaigns
            $('ul#show-current-camp').html('');
            for (var i = 0; i < arr.length; i++) {

                var campId = i;
                idx[i] = arr[i]._id;

                var html = '' +
                    '<li id = "camp-li-' + campId + '" class = "show-current-camp-li">' +
                      '<div class = "camp-each-display"></div>' +
                      '<div class = "camp-each-caption" id = "camp-each-caption-' + i + '">' + 
                        '<ul>' + 
                        '</ul>' +
                      '</div>' +
                      '<div class = "xxx"></div>' + 
                    '</li>'; 
              
                var genLink = function(link) {
                    return '<a href = "' + link + '" target = "_blank" style = "color: #eee;">前往活動官網</a>';
                }

                var genPreview = function(link) {
                    return '<img alt = "此圖無法載入" src ="' + link + '" width = "200px" height = "150px" ' +
                           'style = "position: absolute; right: 0; top: -48px">';
                }

                var genRel = function(link) {
                    return '<a href = "' + link + '" target = "_blank" style = "color: #eee;">交流的起源</a>';
                }

                $('ul#show-current-camp').append(html);
                $('#camp-each-caption-' + i + ' ul').append('<li><span>' + arr[i].title + '</span></li>');
                $('#camp-each-caption-' + i + ' ul').append('<li><span>' + arr[i].date + '</span></li>');
                $('#camp-each-caption-' + i + ' ul').append('<li><span>' + arr[i].location + '</span></li>');
                $('#camp-each-caption-' + i + ' ul').append('<li><span>' + arr[i].ticket + '</span></li>');
                $('#camp-each-caption-' + i + ' ul').append('<li><span>' + arr[i].host + '</span></li>');
                $('#camp-each-caption-' + i + ' ul').append('<li><span>' + genLink(arr[i].site) + '</span></li>');
                $('#camp-each-caption-' + i + ' ul').append('<li><span>' + genRel(arr[i].rel) + '</span></li>');
                $('#camp-each-caption-' + i + ' ul').append('<li><span>' + genPreview(arr[i].image) + '</span></li>');
            }

            // Remove a campaign
            $('.xxx').unbind('click');
            $('.xxx').click(function() {
                $('#show-current-camp').html(Editlist.waitingHTML()); 
                var k = $(this).parent().attr('id').slice(8);
                var rmid = idx[parseInt(k, 10)];
                console.log(rmid + ' is going to be removed.');
                var rmshit = { rid : rmid };
                $.ajax({
                    type: 'DELETE',
                    url: '/crud/rmcampaign',
                    data: { entry : JSON.stringify(rmshit) }
                }).done(function(response) {
                    if (response.msg === 'OK') {
                        console.log(rmid + ' removed.');
                        getCampaigns(myCallback);
                    } else {
                        console.log('RM ERR = ' + response.msg);
                    }
                });
            });
        } // EOF myCallback

        getCampaigns(myCallback);

        // Add new campaign
        $('#add-new-shit').unbind('click');
        $('#add-new-shit').click(function() {
            var readyToGo = true,
                newshit = {
                    title: $('#new-camp-title input').val(),
                    date: $('#new-camp-date input').val(),
                    location: $('#new-camp-location input').val(),
                    ticket: $('#new-camp-ticket input').val(),
                    host: $('#new-camp-host input').val(),
                    site: $('#new-camp-site input').val(),
                    image: $('#new-camp-image input').val(),
                    rel: $('#new-camp-rel input').val()
                };

            $('#show-current-camp').html(Editlist.waitingHTML()); 

            if (readyToGo) {
                $.ajax({
                    type: 'POST',
                    url: '/crud/newcampaign',
                    data: { entry: JSON.stringify(newshit) },
                }).done(function( response ){
                    if ( response.msg === 'OK' ) {
                        console.log('New campaign OK');
                        getCampaigns(myCallback);
                    } else {
                        console.log('New campaign ERR ' + response.msg);
                    }
                });
            }
        });
 
    },

    showCards: function() {
        var i, imgSRC = '', mode = Editlist.mode;

        Editlist.init();
        Editlist.showSettings();

        for (i = 0; i < Editlist.AT.data.length; i++) {
            var cardID = Editlist.AT.data[i].id;
            var cardTitle = (mode) ? Editlist.AT.data[i].name : Editlist.AT.data[i].postTitle;
            
            imgSRC = (mode) ? (Editlist.AT.data[i].images.display || '/images/fallback/noimage.png') :
                     (Editlist.AT.data[i].images.displayMayor || Editlist.AT.data[i].images.display);
            $('#all-result').append(Editlist.card(cardID, cardTitle));

            // CSS
            var cardDiv = 'div#' + cardID;
            $(cardDiv).
                css('height', '326px');
            $(cardDiv + ' a').
                css('background', 'url(' + imgSRC + ')').
                css('background-size', 'cover').
                css('background-repeat', 'no-repeat').
                css('background-position', 'center');                                 
            if (Editlist.AT.data[i].hasOwnProperty('isFaved')) {
                if (Editlist.AT.data[i].isFaved) {
                    var starPath = '/images/icons/bs_icn_star_filled.svg';
                    $(cardDiv + ' .faved-icon').css({
                        'background': 'url("' + starPath + '")',
                        'background-size': 'contain',
                        'background-repeat': 'no-repeat'
                    });
                }
            }

            // JQuery - Display the selected card
            $(cardDiv + ' a, ' + cardDiv + ' .card-description, ' + cardDiv + ' .card-no').click(function() {
                var cid = parseInt($(this).parent().attr('id'), 10);
                Editlist.showCardByID(cid);
            });

            if (parseInt($(cardDiv + ' div div p').css('height'), 10) > 49) {
                cardTitle = cardTitle.slice(0, 26) + '...';
                $(cardDiv + ' div div p').text(cardTitle);
            }
        }
        $('#all-result').show();

        // Faved card
        $('.faved-icon').mouseenter(function() {
            var setFaved = function(isFaved) {
                path = (isFaved) ? '/images/icons/bs_icn_star_filled.svg' : '/images/icons/bs_icn_star_hollow.svg';
                return {
                    'background': 'url("' + path + '")',
                    'background-size': 'contain',
                    'background-repeat': 'no-repeat'
                };
            }
            var cid = parseInt($(this).parent().attr('id'), 10);
            var obj = {};
            for (var i = 0; i < Editlist.AT.data.length; i++) {
                if (Editlist.AT.data[i].id === cid) {
                    obj = Editlist.AT.data[i];
                } 
            }
            var thisIsFaved = false;
            if (obj.hasOwnProperty('isFaved')) {
                thisIsFaved = obj.isFaved;
            }

            $(this).css(setFaved(true));
            $(this).mouseleave(function() {
                $(this).css(setFaved(thisIsFaved));
            });
            $(this).unbind('click');
            $(this).click(function() {
                obj.isFaved = (thisIsFaved) ? false : true;
                thisIsFaved = (thisIsFaved) ? false : true;

                updateFaved = JSON.stringify({ cid: cid, isFaved: thisIsFaved });
                $.ajax({
                    type: 'PUT',
                    url: '/crud/faved',
                    data: { entry: updateFaved },
                }).done(function( response ){
                    if ( response.msg === 'OK' ) {
                        console.log('Faved OK');    
                        $(this).css(setFaved(obj.isFaved));
                    } else {
                        console.log('Faved ERR ' + response.msg);    
                    }
                });

            });
        });

    }, // EOF showCards

    // Display single card by ID
    showCardByID: function(j) {
        if (typeof j === 'number') {
            var obj, hasGotObj = false;

            // ScrollTop
            $('body').scrollTop(0);

            for (var i = 0; i < Editlist.AT.data.length; i++) {
                if (j === Editlist.AT.data[i].id) {
                    obj = Editlist.AT.data[i];
                    hasGotObj = true;
                }
            }
            if (hasGotObj) {
                Editlist.init();
                Editcard.onReady(obj);
                $('#card-result').show();
                Edit.run(j);
            }
        }
    }, // EOF showCardByID

    card: function( cardID, cardTitle, cardNo ) {
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
                      '<div class = "card-no">' + cardID +
                      '</div>' +
                      '<div class = "card-faved-box"></div>' + 
                      '<div class = "faved-icon"></div>' + 
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
    Editlist.onReady();
});
