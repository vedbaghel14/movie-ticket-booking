const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    _id:{type: String, required: true},
    title:{type: String, required: true},
    overview:{type: String, required: true},
    poster_path:{type: String, default: null},
    backdrop_path:{type: String, default: null},
    genres:{type: Array, required: true},
    casts:{type:Array, default: []},
    release_date:{type: String, required: true},
    original_language:{type: String},
    tagline:{type: String},
    vote_average:{type: Number,required: true},
    vote_count:{type: Number, required: true},
    runtime:{type: Number, default: 0},
}, {timestamps: true})

const movie = mongoose.model('movie', movieSchema)

module.exports = movie