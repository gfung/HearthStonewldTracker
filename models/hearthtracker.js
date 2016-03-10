var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var win_tracker_Schema = new mongoose.Schema({
    user: {type: ObjectId},
    game: {type: String},
    game_type: {type: String},
    hero: {type: String},
    enemy_hero: [{type: String}],
    win: [{type: Boolean}],
    date: {type: Date},
    notes: {type: String}
}, { timestamps: true });

var win_tracker = mongoose.model('win_tracker', win_tracker_Schema);

module.exports = win_tracker;