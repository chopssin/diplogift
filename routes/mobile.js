var express = require('express');
var router = express.Router();
var aca = require('../aca/aca.js');

// For parsing HTML and data
data = aca.initHTML;

router.get('/', function(req, res, next) {
    var dataHomeM = data();
    dataHomeM.title = 'Mobile 台南市城市交流藝廊';
    //dataHomeM.url = 'http://tagw2-acatech.rhcloud.com/';
    dataHomeM.url = 'http://diplogift.com/';
    dataHomeM.css.main = '/stylesheets/mobile.css';
    dataHomeM.js.inc = [
        '/javascripts/jquery.nicescroll.js',
        '/javascripts/card.js',
        '//media.line.me/js/line-button.js?v=20140411',
        '/javascripts/responsive.js',
    ];

    var db = req.mondb({ user:'alice', pwd:'123456' });
    var query = { 'images.display': { $exists: true, $nin: [null, '', undefined] } };

    /*var renderPage = function() {
        db.collection('inventory').find(query).toArray(function(err, result) {
            if (!err) {
                console.log('Launching mobile list page...');
                console.log('result.length = ' + result.length + '\n...' );
                //dataHomeM.ret = JSON.stringify(result);
                res.render('m_list', { 'data': dataHomeM });
            } else {
                console.log("ERR " + err);
                res.render('m_list', { 'data': dataHomeM });
            }
        });
    }*/

    //renderPage();
    res.render('m_list', { 'data': dataHomeM });

});

router.get('/:q([0-9]+)', function(req, res, next) {
    var dataHomeM = data();
    dataHomeM.title = 'Mobile 台南市城市交流藝廊';
    //dataHomeM.url = 'http://tagw2-acatech.rhcloud.com/' + req.params.q;
    dataHomeM.url = 'http://diplogift.com/' + req.params.q;
    dataHomeM.css.main = '/stylesheets/mobile.css';
    dataHomeM.js.inc = [
        '/javascripts/jquery.nicescroll.js',
        '/javascripts/card.js',
        '//media.line.me/js/line-button.js?v=20140411',
        '/javascripts/responsive.js',
    ];

    var db = req.mondb({ user:'alice', pwd:'123456' });
    var query = { 'images.display': { $exists: true, $nin: [null, '', undefined] } };

    /*var renderPage = function() {
        db.collection('inventory').find(query).toArray(function(err, result) {
            if (!err) {
                console.log('Launching mobile list page...');
                console.log('result.length = ' + result.length + '\n...' );

                var qq = parseInt(req.params.q, 10);
                result.push({ 'goto' : qq });


                dataHomeM.ret = JSON.stringify(result);
                res.render('m_list', { 'data': dataHomeM });
            } else {
                console.log("ERR " + err);
                res.render('m_list', { 'data': dataHomeM });
            }
        });
    }*/

    //renderPage();
    var qq = parseInt(req.params.q, 10);
    console.log('Mobile - Gift.id = ' + qq);
    dataHomeM.ret = { 'goto': qq };
    res.render('m_list', { 'data': dataHomeM, 'goto': qq });

});


module.exports = router;
