var Card = {

    onReady: function(obj) {
        Card.AT = {};
        Card.AT.data = [obj];
        Card.setElements();
        Card.defaultSection();
        Card.displayPictures();        
    },

    defaultSection: function() {

        // Show the event by default
        $('ul.card-navbar li a p').css( 'color', 'rgb(201, 152, 23)').css('border-bottom', '0px solid #333');
        $('#nav-event p').css( 'color', '#333').css('border-bottom', '1px solid #333');
        $('#card-showbox div').hide();
        $('#card-showbox-comments, #card-showbox-comments div').show();
        $('#card-showbox-comments, #card-showbox-comments div').promise().done(function() {
            $('#card-showbox-event, #card-showbox-event div').show();
        });

        // Toggle between event, about and intro
        $('ul.card-navbar li a').click(function() {
            var s = $(this).attr('id').slice(4);
            $('ul.card-navbar li a p').css( 'color', 'rgb(201, 152, 23)').css('border-bottom', '0px solid #333');
            $('#nav-' + s + ' p').css( 'color', '#333').css('border-bottom', '1px solid #333');
            $('#card-showbox div').hide();
            $('#card-showbox-' + s + ', #card-showbox-' + s + ' div').show();
            $('html').css('overflow', 'auto');
            var myScroll = function(zero) {
                var showCoverST = $(window).height() - 140; 
                if (zero === 0) showCoverST += 140;
                $('body').animate({
                    scrollTop: showCoverST
                }, 500);
            }
            if (s === 'comments') {
               myScroll(1);
            } else {
               myScroll(0);
            }
        });

        $('#card-navbar').css('z-index', '10');
    }, // EOF defaultSection

    displayPictures: function() {
        var i, j, pictures = '', imgSRC = '', pid = '', counter = 1;
        var len = Card.AT.data[0].images.others.length;

        // Push displayMayor to the others array
        if (Card.AT.data[0].images.others[len - 1] !== Card.AT.data[0].images.displayMayor) {
            Card.AT.data[0].images.others[len] = Card.AT.data[0].images.displayMayor;
        }

        $('#left-col').html('');
        for (i = 0; i < Card.AT.data[0].images.others.length; i++) {
            if ( Card.AT.data[0].images.others[i].slice(0,8) === '/images/' ) {
                imgSRC = Card.AT.data[0].images.others[i];
                pid = 'images-' + counter;
                pictures = '<div id=' + pid + '></div>';
                $('#left-col').append(pictures);

                var img = new Image();
                img.onload = function() {
                    var myDiv = this.parentDiv;
                    var divNewH = parseInt($(myDiv).width(), 10) * 
                                  parseInt(this.height, 10) / 
                                  parseInt(this.width, 10) | 0;
                    $(myDiv).height(divNewH);
                }
                img.src = imgSRC;
                img.parentDiv = '#' + pid;
                
                // CSS - pictures
                $('#' + pid).
                    css('background', 'url(' + imgSRC + ')').
                    css('border-bottom', '0px solid rgb(201, 152, 23)').
                    css('margin-bottom', '30px').
                    css('background-size', 'cover').
                    css('background-repeat', 'no-repeat').
                    css('background-position', 'center');
                    //css('width', '100%').
                counter++;
            } 
        }
    },  // EOF displayPictures

    setElements: function() {
        var resultHTML = '';
        var leftCol = '', rightCol = '', divIntro = '', divFBcomments = '';
        var obj = Card.AT.data[0];
        var eventTitle = Card.AT.data[0].event.title || '關於本事件';
        var aboutTitle = Card.AT.data[0].about.title || '關於此禮品';
        var eventContent = Card.AT.data[0].event.content || '...';
        var aboutContent = Card.AT.data[0].about.content || '...';

        eventContent = Card.contentPrep(eventContent);
        aboutContent = Card.contentPrep(aboutContent);

        // Fill in the data
        $('h4#subtitle').text(Card.AT.data[0].postTitle);
        $('h2#event-title').text(eventTitle);
        $('#event-content').html(eventContent);
        $('h2#about-title').text(aboutTitle);
        $('#about-content').html(aboutContent);
        $('#intro-name').html(obj.name);
        $('#intro-date').html(obj.receivedDate);
        $('#intro-from').html(obj.givenBy);
        $('#intro-to').html(obj.receivedBy);


        // CSS
        var cssNormalColor = 'rgb(201, 152, 23)',
            cssActivatedColor = '#333',
            screenH = (parseInt($(window).height(), 10) * 0.88) + 'px';
            
        $('h4#subtitle').css('color', cssActivatedColor);
        $('p.card-nav-title').css('color', cssNormalColor);
        $('#card-showbox').css('color', cssActivatedColor);
        $('.card-showbox').css('z-index','-100');
        $('#card-showbox-intro').css('position', 'absolute').
                                 css('top', '40px').
                                 css('border', '1px solid rgb(79,65,47)').
                                 css('padding', '10px').
                                 css('width', '394px');

        $('.wide').css('height', '100%');


    }, // EOF setElements 

    contentPrep: function(str) {         

        // 1. Turn URLs into hyperlinks
        var strRet = str.match(/(http|https)(\:\/\/)[^\<\>\s]*/g);
        //var ATbot = Acatool.build(false);
        if (strRet !== null) {
            for (var i = 0; i < strRet.length; i++) {
                str = str.replace(strRet[i], '<a target = \"_blank\" href =\"' + strRet[i] + '\">來源' + (i+1) + '</a>'); 
            }
        }

        // 2. Remove redundent `<br>`s
        var j = 0, limit = 0, tmp = '';
        while (j > -1 && limit < str.length) {
            strRet = str.match(/(\<br\>){3,}/);
            if (typeof strRet === 'object' && strRet !== null) {
                j = str.indexOf(strRet[0]);
                if (j > -1) {
                    tmp = str.slice(0, j + strRet[0].length);
                    str = str.slice(j + strRet[0].length);
                    tmp = tmp.replace(strRet[0], '<br><br>');
                    str = tmp + str;
                }
            } else {
                break;
            }
            limit++;
        }
        
        return str;
    }, 

    css: function() {
        var introH = 20;
        $('#card-showbox-intro div').each(function() {
            var h = parseInt($(this).find('.inner-right').height(), 10);
            //$(this).css('height', (h + 4) + 'px');
            introH += h;
            console.log('~~~ ' + $(this).find('.inner-right').height());
        });
        $('#card-showbox-intro').css('height', introH + 'px');
    }
};

