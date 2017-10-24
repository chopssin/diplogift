var List = {

    AT: (function() {
        var myAT = Acatool.build(false);
        myAT.fetchData();
        return myAT;
    })(),

    mode: true,
    noresIMGarray: [],

    onReady: function() {

        var w = window.innerWidth, h = window.innerHeight;

        List.AT;
        if (List.AT.mobilecheck() && w / h < 1) {
            $('#result').html('<p id = \"lalala\"><br><br><br></p><center><button id = \"mob\">手機版</button><center>');
            $('button#mob').click(function() {
                //List.views();
                location.href = '/m';
            });
            $('#lalala').css('margin-bottom', '540px');
            $('button#mob').css('font-size', '70px');
        } else {
            List.views();
        }
    },

    views: function() {

        List.showCards();

        $('a.logo, h1').click(function() {
            $('body').scrollTop(0);
            List.showCards();
        });
        $('#qry').keyup(function() {
            var text = $('#qry').val();
            if (text !== '') {
                List.searchMode(text);
            } else {
                List.showCards();
            }
        });

        List.toggleDisplay();

    },

    init: function() {
        $('div.cover-3').remove();
        $('h4#subtitle').remove();
        $('ul.card-navbar').remove();
        $('div#left-col').remove();
        $('ul.card-navbar').remove();
        $('#result').html('');
        $('#result').css('top', '0');

        // Preload search-no-result images
        List.noresIMGarray[0] = new Image(); 
        List.noresIMGarray[0].src = '/images/icons/search_no_result_no_result_cat.svg';
        List.noresIMGarray[1] = new Image(); 
        List.noresIMGarray[1].src = '/images/icons/search_no_result_no_result_tea.svg';
        List.noresIMGarray[2] = new Image(); 
        List.noresIMGarray[2].src = '/images/icons/search_no_result_no_result_maglass.svg';
    },

    toggleDisplay: function() {
        $('div.toggle-gift').click(function() {
            switch (List.mode) {
                case true: 
                    $(this).css('background', 'url(\"/images/icons/toggle_gift_on.svg\")').css('background-size', 'cover');
                    List.mode = false;
                    List.showCards();
                    break;
                case false: 
                    $(this).css('background', 'url(\"/images/icons/toggle_ppl_on.svg\")').css('background-size', 'cover');
                    List.mode = true;
                    List.showCards();
                    break;
                default:
            }
        });
    },

    // Instant search
    searchMode: function(text) {
 
        List.showCards();
        text = text.trim();

        for (var i = 0; i < List.AT.data.length; i++) {
            var str = JSON.stringify(List.AT.data[i]);
            var idx = str.indexOf(text);
            if (idx < 0) {
                $('div#' + List.AT.data[i].id).remove();
            }
        }
        if ($('div.card').length < 1) {
            var noResult = '<div id = \"nores\" style=\"width: 300px; height: 200px;\"></div>', noresIMG = '';
            var idx = Math.floor(Math.random() * 3);
            $('#result').html(noResult);
            $('#nores').css('background-image', 'url(\"' + List.noresIMGarray[idx].src + '\")').
                        css('background-size', 'contain').
                        css('background-repeat', 'no-repeat')
        }
    },

    showCards: function() {
        var i, imgSRC = '', mode = List.mode;

        List.init();

        for (i = 0; i < List.AT.data.length; i++) {
            var cardID = List.AT.data[i].id;
            var cardTitle = (mode) ? List.AT.data[i].name : List.AT.data[i].postTitle;
            imgSRC = (mode) ? (List.AT.data[i].images.display || '/images/fallback/noimage.png') :
                     (List.AT.data[i].images.displayMayor || List.AT.data[i].images.display);
            $('#result').append(List.card(cardID, cardTitle));

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
                List.showCardByID(parseInt($(this).attr('id')));
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

            // ScrollTop
            $('body').scrollTop(0);

            for (var i = 0; i < List.AT.data.length; i++) {
                if (j === List.AT.data[i].id) {
                    obj = List.AT.data[i];
                    hasGotObj = true;
                }
            }
            if (hasGotObj) {
                Card.onReady(obj);
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
    } // EOF card
};

$(document).ready(function() {
    List.onReady();
});
