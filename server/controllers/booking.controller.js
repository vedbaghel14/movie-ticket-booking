const showModel = require('../models/show.model')
const bookingModel = require('../models/booking.model')
//function to check availability of selected seats for a movie
const checkAvailability = async (showId,selectedSeats) => {
    try{
        const showData = await showModel.findById(showId)
        if(!showData){
            return false
        }
        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        

        return !isAnySeatTaken
    }
    catch(err){
        console.log(err.message);
        return false;
    }
}

const createBooking = async (req,res) => {
    try{
        const {userId} = req.auth();
        const {showId,selectedSeats} = req.body;
        const {origin} = req.headers;

        //check if the seat is avilable or not
        const isAvailable = await checkAvailability(showId,selectedSeats);
        if(!isAvailable){
            return res.status(400).send({success:false,message:"Seat is not available"})
        }
        //get the show details
        const showData = await showModel.findById(showId).populate('movie');
        //crate a new booking

        const booking = await bookingModel.create({
            user:userId,
            show:showId,
            bookedSeats:selectedSeats,
            amount:showData.showPrice * selectedSeats.length,
        })

        selectedSeats.forEach((seat) => {
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats')

        await showData.save()

        //stripe gateway initialize


        res.status(200).send({success:true,message:"Booking created successfully"})


    }catch(err){
        res.status(500).send({success:false,message:err.message})
    }
}

const getOccupiedSeats = async (req,res) => {
    try{
        const {showId} = req.params;
        const showData = await showModel.findById(showId);
        const occupiedSeats = Object.keys(showData.occupiedSeats);

        res.json({success:true,occupiedSeats})
    }
    catch(err){
        res.status(500).send({success:false,message:err.message})
}}

module.exports = {
    createBooking,
    getOccupiedSeats
}