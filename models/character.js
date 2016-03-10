var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var player_character_Schema = new mongoose.Schema({
    user: ObjectId,
    name: String,
    race: String,
    gender: String,
    hit_points_max: { type: Number, default: 10 },
    hit_points_current: { type: Number },
    magic_points_max: { type: Number, default: 0},
    magic_points_current: { type: Number },
    power: { type: Number, default: 1},
    magic_power: { type: Number, default: 1},
    defense: { type: Number, default: 1},
    magic_defense: { type: Number, default: 1},
    evasion: { type: Number, default: 1},
    luck: { type: Number, default: 1},
    weapon_skill: {
        handtohand: { type: Number, default: 0 },
        sword: { type: Number, default: 0 },
        dagger: { type: Number, default: 0 },
        great_sword: { type: Number, default: 0 },
        staff: { type: Number, default: 0 },
        polearm: { type: Number, default: 0 },
        club: { type: Number, default: 0 },
        bow: { type: Number, default: 0 },
        marksman: { type: Number, default: 0 }
    },
    magic_skill: {
        fire: { type: Number, default: 0 },
        water: { type: Number, default: 0 },
        air: { type: Number, default: 0 },
        earth: { type: Number, default: 0 },
        thunder: { type: Number, default: 0 },
        light: { type: Number, default: 0 },
        dark: { type: Number, default: 0 }
    },
    crafting_skill: {
        smithing: { type: Number, default: 0 },
        chemistry: { type: Number, default: 0 },
        woodworking: { type: Number, default: 0 },
        cooking: { type: Number, default: 0 },
        cloth: { type: Number, default: 0 },
        leather: { type: Number, default: 0 },
        jewelry: { type: Number, default: 0 },
    },
    equipped:{
        head: {type: ObjectId},
        body: {type: ObjectId},
        legs: {type: ObjectId},
        feet: {type: ObjectId},
        arms: {type: ObjectId},
        earL: {type: ObjectId},
        earR: {type: ObjectId},
        ringL: {type: ObjectId},
        ringR: {type: ObjectId},
        neck: {type: ObjectId},
        main: {type: ObjectId},
        sub: {type: ObjectId}
    },
    inventory: [{type: ObjectId}]
}, { timestamps: true });

var player_character = mongoose.model('playerCharacter', player_character_Schema);

module.exports = player_character;
