/**
 * Requires
 */
var User = require('../models/User');
var Tracker = require('../models/hearthtracker');

/**
 * GET /hearthtracker
 * hearthstone tracker main page
 */
exports.gethearthtracker = function(req, res, next) {
    Tracker.find({user: req.user._id}).exec(function(err, userdata){
        return res.render('hearthtracker/tracker', {
            title: 'Hearthstone Tracker',
            data: userdata,
        });
    })
};

/**
 * POST /hearthtracker
 * hearthstone tracker post data
 */
exports.posthearthtracker = function(req, res, next) {
    console.log(req.user)
    if (typeof req.body.enemy_hero != "string"){
        req.body.enemy_hero = [req.body.enemy_hero]
    }
    if (typeof req.body.win != "string"){
        req.body.win = [req.body.win]
    }
    var new_track = new Tracker({
        user: req.user._id,
        game: req.body.game,
        game_type: req.body.game_type,
        hero: req.body.my_hero,
        enemy_hero: req.body.enemy_hero,
        win: req.body.win,
        date: req.body.date,
        notes: req.body.notes
    });
    new_track.save(function(err, saved) {
        return res.status(200).redirect('/hearthtrack')
    })
};