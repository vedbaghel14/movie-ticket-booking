const mongoose = require('mongoose')

const showSchema = new mongoose.Schema({
    movie:{type:String,required:true,ref:"movie"},
    showDateTime:{type:Date,required:true},
    showPrice:{type:Number,required:true},
    occupiedSeats:{type:Object,default:{}}
},{minimize:false})

const show = mongoose.model('show',showSchema)

module.exports = show