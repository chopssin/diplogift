var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');

/* Create */
router.post('/create', function(req, res) {

    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var entry = req.body.entry,
        newRecord = {};   
    var col = 'inventory';

    db.collection(col).insert(newRecord).toArray(function(err, items) {
        res.send(
            (err === '') ? { msg: '' } : { msg: err }
        );
    });
});

/* Read */
router.get('/read', function(req, res) {

    // Handle query with entry
    // Do something ...
    var entry = req.body.entry,
        //query = { 'images.display': { $exists: true, $nin: [null, '', undefined] } };
        query = {};

    // Set the db, collection
    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var col = 'inventory';

    db.collection(col).find(query).toArray(function(err, result) {
        //res.json(items);
        res.send(
            (err === null) ? { msg: 'OK', camps: result } : { msg: err }
        );
    });
});

router.get('/readall', function(req, res) {

    // Handle query with entry
    // Do something ...
    var entry = req.body.entry,
    query = { 
        'images.display': { $exists: true, $nin: [null, '', undefined] }
    };

    // Set the db, collection
    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var col = 'inventory';

    console.log('crud readall');
    db.collection(col).find(query).toArray(function(err, result) {
        res.send(
            (err === null) ? { msg: 'OK', data: result } : { msg: err }
        );
    });
});

/* Read with limitations */
router.get('/readposts/:pid', function(req, res) {

    // Handle query with entry
    //var entry = req.body.entry;

    var pid = req.params.pid;
    if (pid !== 'all') {
        pid = parseInt(pid, 10);
    }

    var query = { 
        'images.display': { $exists: true, $nin: [null, '', undefined] }
    };
    var projection = { 
        '_id': 0
    };

    // Set the db, collection
    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var col = 'inventory';

    db.collection(col).find(query, projection).toArray(function(err, result) {
        //res.json(items);

        result = result.map(function(x) {
            if (!x.isFaved && x.id != pid) {
                x.event.content = '';
                x.about.content = '';
                return x;
            }
            return x;
        });
        //console.log(result);
        res.send(
            (err === null) ? { msg: 'OK', data: result } : { msg: err }
        );
    });
});

/* Show all the givers */
router.get('/showgivers', function(req, res, next) {
    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var col = 'inventory';
    var query = {'images.display': {$exists: true, $nin: [undefined, '', null]}};
    db.collection(col).find(query, {'id': 1, 'name': 1, 'givenBy': 1}).toArray(function(err, result) {
        res.send(
            (err === null) ? { msg: 'OK', allgivers: result } : { msg: err }
        );
    });
});

/* Update */
router.put('/update', function(req, res, next){
    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var col = 'inventory';
    var query = undefined;
    var update = req.body.entry;

    // Handle the update
    console.log('req.body.entry = ' + req.body.entry);
    update = JSON.parse(req.body.entry);

    // Handle the query
    query = { id: update.id };
    for (var name in update) {
        console.log(name + ' : ' + update[name]);
    }
    delete update._id;
    delete update.id;
    db.collection(col).update(query, { $set: update }, function(err, items) {
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    }); 
});

/* Faved */
router.put('/faved', function(req, res, next){
    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var col = 'inventory';
    var query = undefined;
    var update = req.body.entry;

    // Handle the update
    console.log('req.body.entry = ' + req.body.entry);
    update = JSON.parse(req.body.entry);

    // Handle the query
    query = { id: update.cid };
    delete update.cid;
    for (var name in update) {
        console.log(name + ' : ' + update[name]);
    }
    db.collection(col).update(query, { $set: update }, function(err, items) {
        res.send(
            (err === null) ? { msg: 'OK' } : { msg: err }
        );
    });
});

/* Delete */
router.delete('/delete', function(){
    var db = req.db;
    var col = 'posts';
    var query = undefined;
    
    // Handle the query
    // Do something ...

    db.collection(col).remove(query, function(err, items) {
        res.send(
            (err === '') ? { msg: '' } : { msg: err }
        );
    });
});

/* Create new campaign */
router.post('/newcampaign', function(req, res) {

    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var entry = req.body.entry,
        newRecord = {};
    var col = 'campaigns';

    newRecord = req.body.entry;
    console.log('new entry = ' + newRecord);
    newRecord = JSON.parse(newRecord);

    db.collection(col).insert(newRecord, function(err, items) {
        res.send(
            (err === null) ? { msg: 'OK' } : { msg: err }
        );
    });
});

/* Get campaigns */
router.get('/campaigns', function(req, res) {

    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var entry = req.body.entry,
        query = {};
    var col = 'campaigns';

    db.collection(col).find(query).toArray(function(err, result) {

        //console.log(result);
        result = result.reverse();

        res.send(
            (err === null) ? { msg: 'OK', camps: result } : { msg: err }
        );
    });
});

/* Update the campaign */
router.put('/updatecampaign', function(req, res) {

    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var entry = req.body.entry,
        query = {},
        update = {};
    var col = 'campaigns';

    db.collection(col).update(query, {$set: update}, function(err, items) {
        res.send(
            (err === null) ? { msg: 'OK' } : { msg: err }
        );
    });
});

/* Delete the campaign */
router.delete('/rmcampaign', function(req, res) {

    var db = req.mondb({ user:'chopsroot', pwd:'hell1234' });
    var entry = JSON.parse(req.body.entry),
        query = {};
    var col = 'campaigns';
    var the_id = mongo.helper.toObjectID(entry.rid);

    query = { '_id' : the_id };
    console.log('DELETE ' + entry.rid);

    db.collection(col).remove(query, function(err, items) {
        res.send(
            (err === null) ? { msg: 'OK' } : { msg: err }
        );
    });

});


module.exports = router;
