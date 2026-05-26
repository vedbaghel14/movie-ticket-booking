



const {clerkClient} = require('@clerk/express')
const bookingmodel = require("../models/booking.model");
const movieModel = require("../models/movies.model");


//api controller function to get user bookings
const getUserBookings = async (req, res) => {
try{
    const user = req.auth().userId;
    const bookings = await bookingmodel.find({user: user}).populate({
        path: 'show',
        populate: {
            path: 'movie'
        }
    }).sort({createdAt: -1});
    res.status(200).json({success: true , bookings});
}
catch(err){
    res.status(500).json({message: err.message})
}
}

//api controller function to update favourite movie in clerk user metadata
const updateFavouriteMovie = async (req, res) => {
    try{
        const {movieId} = req.body;
        const userId = req.auth().userId;
        const user = await clerkClient.users.getUser(userId);

        if(!user.privateMetadata.favourites){
            user.privateMetadata.favourites = [];

        }
        if(!user.privateMetadata.favourites.includes(movieId)){
            user.privateMetadata.favourites.push(movieId);}
        else{
            user.privateMetadata.favourites = user.privateMetadata.favourites.filter((id) => id !== movieId);
        }
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: user.privateMetadata
            })

           res.json({success: true, message: "favourite movie updated successfully"})
            
    }
    catch(err){
        res.status(500).json({message: err.message})

    }
}

const getFavourites = async (req, res) => {
    try{
        const userId = req.auth().userId;
        const user = await clerkClient.users.getUser(userId);
        const getUser = user.privateMetadata.favourites;

        //getting movies from database
        const movies = await movieModel.find({_id: {$in: getUser}});
        res.json({success: true, movies})
       

    }
    catch(err){
        res.status(500).json({success:false,message: err.message})

    }
}

module.exports = {
    getUserBookings,
    updateFavouriteMovie,
    getFavourites
}

