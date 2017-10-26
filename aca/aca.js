var http = require('http');

var AcaServerTool = {
    initHTML: function() {
        console.log('Init html ...');
        return {
            title: 'Aca template',
            welcome: 'Welcome to Aca',
            msg: '{}',
            css: {
                main: '/stylesheets/main.css'
            },
            js: {
                jquery: [
                    'http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js'
                    //'http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js'
                ],
                aca: {
                    tool: '/javascripts/aca/tool.js'
                },
                inc: []
            },
            ret: {} // this part goes to p#acadatapipe
        };
    },

    // Request external site
    fetchExtHTML: function(ho, po, pa) {
        var options = {
            host: ho, port: po, path: pa
        };
        http.get(options, function(response){
            //response.setEncoding('utf8');
            response.on('data', function(chunk){
                return chuck;
            });
        }).on("error", function(e){
            console.log("Got error: " + e.message);
        });
    }
}

module.exports = AcaServerTool;
