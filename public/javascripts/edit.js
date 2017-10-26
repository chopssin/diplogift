var Edit = {

    run: function(id) {
	Edit.card = Edit.getCard(id);   
        Edit.init(); 
        Edit.setTextareas();    
        Edit.editMode();
    },

    getCard: function(id){
        for (var i = 0; i < Editlist.AT.data.length; i++) {
            if (Editlist.AT.data[i].id === id) {
                return Editlist.AT.data[i];
            }
        }
    },

    card: {},

    newCard: {},

    articles: {
        getEvent: function() {
            return {
                title: $('h2#event-title').text(),
                content: $('#event-content').html()
            };
        },
        getAbout: function() {
            return {
                title: $('h2#about-title').text(),
                content: $('#about-content').html()
            };
        },
        getIntro: function() {
            return {
                name: $('#intro-name').html(),
                from: $('#intro-from').html(),
                to: $('#intro-to').html(),
                date: $('#intro-date').html()
            };
        }
    },

    init: function() {
        $('#box-content').remove();
        $('#done').remove();
        $('#save').remove();
        $('#outer-layer').remove();
    },

    text2str: function(text) {
        text = Edit.reverseHyperlink(text);
        return text.replace(/(\<br\>)/g, '\n');
    },

    str2text: function(str) {
        return str.replace(/\r?\n/g, '<br>');
    },

    setTextareas: function() {

        var html = '';

        // Button - Done
        html = '<button id = \"done\" class = \"save-btn\" style = \"display:none\">取消</button>';
        $('body').append(html); 

        // Button - Save
        html = '<button id = \"save\" class = \"save-btn\" style = \"display:none\">儲存</button>';
        $('body').append(html); 
        
        // Layer
        html = '<div id = \"outer-layer\" style=\"display:none\"></div>';
        $('body').append(html);

        // H4 title
        html = '<input type = "text" id = "h4-title">';
        $('#outer-layer').append(html); 

        // Image pathes
        $('#outer-layer').append('<ul id = "img-pathes"></ul>'); 
        for (var i = 0; i < Edit.card.images.others.length - 1; i++) {
console.log(':: ' + Edit.card.images.others[i]);
            $('#img-pathes').append('<li id = "img-path-'+ i +'"><span>照片' + i + '</span><textarea></textarea></li>');
        }
        $('#img-pathes').append('<li id = "img-path-mayor"><span>事件照片</span><textarea></textarea></li>');
        $('#img-path-0 span').text('預覽照片');

        // Textareas for event / about section
        html = '<div id = \"box-content\" class = \"card-showbox\" style = \"display:none\">' +
                     '<textarea id = \"textarea-title\"></textarea>' +
                     '<textarea id = \"textarea-content\" class = \"showbox-content\"></textarea>' +
                   '</div>';
        $('#outer-layer').append(html); 

        // Textareas for intro
        html = '<ul class = "text-intro">' + $('#card-showbox-intro ul').html().
            replace('intro-name', 'text-intro-name').
            replace('intro-date', 'text-intro-date').
            replace('intro-from', 'text-intro-from').
            replace('intro-to', 'text-intro-to') +
            '</ul>';
        $('#outer-layer').append(html); 
        $('.text-intro li.intro-subcontent').
            html('<textarea></textarea>');

        // CSS
        $('#box-content').css('zIndex', '333');
        $('#save').css('left', '81%');
        $('#textarea-title').
            css('display', 'block').
            css('width', '100%').
            css('font-size', '1.5em').
            css('background-color', 'rgb(25, 25, 24)').
            css('color', '#ddd').
            css('border', '0').
            css('z-index', '300').
            css('resize', 'none');
        $('#textarea-content').
            css('display', 'block').
            css('width', '100%').
            css('height', '400px').
            css('background-color', 'rgb(25, 25, 24)').
            css('color', '#ddd').
            css('border', '0').
            css('z-index', '300').
            css('resize', 'none');
    }, // EOF setTextarea

    editMode: function() {
 
        $('#card-showbox').unbind('click');
        $('#card-showbox').click(function() {
            var article = Edit.articles.default;
            var editedArea = null;

            // Check which of the following is clicked and get current contents
            $('#card-showbox').children().each(function() {
                if (!$(this).is(':hidden')) {
                    editedArea = $(this).attr('id');
                    switch (editedArea) {
                        case 'card-showbox-event': article = Edit.articles.getEvent(); break;
                        case 'card-showbox-about': article = Edit.articles.getAbout(); break;
                        case 'card-showbox-intro': article = Edit.articles.getIntro(); break;
                        default: // Do something
                    }
                }
            });
            if (editedArea === 'card-showbox-event' || editedArea === 'card-showbox-about') {
                $('#card-showbox').hide();
                $('#box-content').show(); 
                $('#textarea-title, #textarea-content').show();
                $('.text-intro').hide(); 
                $('#box-content').promise().done(function() {

                    // Fill the text into the textareas
                    $('#textarea-title').val(Edit.text2str(article.title));
                    $('#textarea-content').val(Edit.text2str(article.content));
                });
                $('#done, #save').show();
                $('#outer-layer').show();
                $('.logout-btn').hide();

            } else if (editedArea === 'card-showbox-intro') {
                $('#card-showbox').hide();
                $('#textarea-title, #textarea-content').hide();
                $('.text-intro').show(); 
                $('#box-content').promise().done(function() {

                    // Fill the text into the textareas
                    $('#text-intro-name textarea').val(Edit.text2str(article.name));
                    $('#text-intro-date textarea').val(Edit.text2str(article.date));
                    $('#text-intro-from textarea').val(Edit.text2str(article.from));
                    $('#text-intro-to textarea').val(Edit.text2str(article.to));
                });
                $('#done, #save').show();
                $('#outer-layer').show();
                $('.logout-btn').hide();
            }
        
            Edit.setSave(editedArea);
        });

        // H4 title 
        $('h4#subtitle').unbind('click');
        $('h4#subtitle').click(function() {
            $('#h4-title').val($('h4#subtitle').text());
            $('#h4-title').show();
            $('#done, #save').show();
            $('#outer-layer').show();
            $('.logout-btn').hide();
            Edit.setSave('subtitle');
        });

        // Image pathes
        $('#left-col').unbind('click');
        $('#left-col').click(function() {

            // Fill in img pathes
            for (var i = 0; i < Edit.card.images.others.length - 1; i++) {
                $('#img-path-' + i + ' textarea').val(Edit.card.images.others[i]);
            }
            $('#img-path-mayor textarea').val(Edit.card.images.displayMayor);

            $('#left-col').hide();
            $('#done, #save').show();
            $('#outer-layer').show();
            $('.logout-btn').hide();
            $('#img-pathes').show();
            Edit.setSave('pictures');
        });

        $('#done').unbind('click');
        $('#done').click(function() {
            Edit.reset();
            console.log('Done');
        });

    }, // EOF editMode 

    setSave: function(editedArea) {
        $('#save').unbind('click');
        $('#save').click(function() {

            var obj = Edit.card;
            var updatedArticle = {
                title: Edit.str2text($('#textarea-title').val()),
                content: Edit.str2text($('#textarea-content').val()) 
            };
            switch (editedArea) {
                case 'card-showbox-event': 
                    obj.event = updatedArticle;
                    $('h2#event-title').text(Edit.text2str(updatedArticle.title));
                    $('div#event-content').html(updatedArticle.content);
                    break;
                case 'card-showbox-about': 
                    obj.about = updatedArticle;
                    $('h2#about-title').text(Edit.text2str(updatedArticle.title));
                    $('div#about-content').html(updatedArticle.content);
                    break;
                case 'card-showbox-intro': 
                    updatedArticle = {
                        name: Edit.text2str($('#text-intro-name textarea').val()),
                        date: Edit.text2str($('#text-intro-date textarea').val()),
                        from: Edit.text2str($('#text-intro-from textarea').val()),
                        to: Edit.text2str($('#text-intro-to textarea').val()),
                    };
                    obj.name = updatedArticle.name;
                    obj.receivedDate = updatedArticle.date;
                    obj.givenBy = updatedArticle.from;
                    obj.receivedBy = updatedArticle.to;
                    $('#intro-name').html(updatedArticle.name); 
                    $('#intro-date').html(updatedArticle.date); 
                    $('#intro-from').html(updatedArticle.from); 
                    $('#intro-to').html(updatedArticle.to); 
                    break;
                case 'subtitle':
                    obj.postTitle = $('#h4-title').val();
                    $('h4#subtitle').text(obj.postTitle); 
                    break;
                case 'pictures': 
                    $('ul#img-pathes li').each(function() {
                        var pid = $(this).attr('id').slice(9);
                        pid = (pid === 'mayor') ? 'displayMayor' : parseInt(pid);
                        if (typeof pid === 'number') {
                            obj.images.others[pid] = $('#img-path-' + pid + ' textarea').val();
                        } else if (pid === 'displayMayor') {
                            obj.images.displayMayor = $('#img-path-mayor textarea').val();
                        }
                    });
                    obj.images.display = obj.images.others[0];
                    break;
                default:
            }

            Edit.update();

            // Reset
            Edit.reset();
            console.log(editedArea + ' saved');
        });
    }, // EOF setSave

    update: function() {

        Edit.newCard = Edit.getNewCard();

        $.ajax({
            type: 'PUT',
            data: { entry: JSON.stringify( Edit.newCard ) },
            url: '/crud/update',
            dataType: 'JSON'
        }).done(function( response ) {
            // Check for successful (blank) response
            console.log("FIRED");
            if (response.msg === '') {

                // Update the data array
                console.log('success = ' + true);
            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    }, // EOF update

    getNewCard: function() {
        Edit.card.about.content = Edit.reverseHyperlink(Edit.card.about.content);
        return Edit.card;
    },

    reverseHyperlink: function(str) {
        var strRetA = str.match(/(\<a\star)[^\>]*(\>)[^\<]*(\<\/a\>)/g);
        if (strRetA !== null) {
            for (var i = 0; i < strRetA.length; i++) {
                var strRet = strRetA[i].match(/(http|https)(\:\/\/)[^\<\>\s]*/);
                if (strRet[0].slice(strRet[0].length - 1) === '"') {
                    strRet[0] = strRet[0].slice(0, strRet[0].length - 1);
                }
                str = str.replace(strRetA[i], strRet[0]);
            }
        }
        return str;
    },

    reset: function() {
        //$('.content').css('z-index', '0');
        $('#box-content').hide();
        $('#card-showbox').show();
        $('#done, #save').hide();
        $('#outer-layer').hide();
        $('.logout-btn').show();
        $('#h4-title').hide();
        $('.text-intro').hide();
        $('#left-col').show();
        $('#img-pathes').hide();
        $('textarea').val('');
    }

}; //EOF Edit

