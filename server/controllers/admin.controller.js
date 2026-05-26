const bookingModel = require("../models/booking.model")
const showModel = require("../models/show.model")
const userModel = require("../models/user.model")

//api to check if user is admin or not
const isAdmin = async (req, res) => {
    res.json({success:true,isAdmin:true})
}

//api to get dashboard data
const getDashboardData = async (req, res) => {
    try{
       const bookings = await bookingModel.find({isPaid:true})
        const allShows = await showModel.find({}).populate('movie')
        const now = new Date()
        const activeShows = allShows.filter(show => {
            const dt = show.showDateTime instanceof Date
                ? show.showDateTime
                : new Date(show.showDateTime);
            return !isNaN(dt.getTime()) && dt >= now;
        })
        const totalUser = await userModel.countDocuments()

        const dashboardData = {
            totalBookings:bookings.length,
            totalRevenue:bookings.reduce((acc,booking)=>acc+booking.amount,0),
            activeShows,
            totalUser
        }
        res.json({success:true,dashboardData})
    }
    catch(err){
        res.json({success:false,message:err.message})
    }}


//api to get all shows
const getAllShows = async (req, res) => {
    try{
        const allShows = await showModel.find({}).populate('movie').sort({showDateTime:1})
        const now = new Date()
        const shows = allShows.filter(show => {
            const dt = show.showDateTime instanceof Date
                ? show.showDateTime
                : new Date(show.showDateTime);
            return !isNaN(dt.getTime()) && dt >= now;
        })
        res.json({success:true,shows})
    }
    catch(err){
        res.json({success:false,message:err.message})
    }

}

//api to get all bookings
const getAllBookings = async (req, res) => {
    try{
        const bookings = await bookingModel.find({isPaid:true}).populate('user').populate({
            path:'show',
            populate:{
                path:'movie'
            }
        }).sort({createdAt:-1})
        
        res.json({success:true,bookings})
    }
    catch(err){
        res.json({success:false,message:err.message})
    }
}

module.exports = {
    isAdmin,
    getDashboardData,
    getAllShows,
    getAllBookings
}

