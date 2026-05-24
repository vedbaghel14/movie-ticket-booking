const bookingModel = require("../models/booking.model")
const userModel = require("../models/user.model")

//api to check if user is admin or not
const isAdmin = async (req, res) => {
    res.json({sucess:true,isAdmin:true})
}

//api to get dashboard data
const getDashboardData = async (req, res) => {
    try{
       const bookings = await bookingModel.find({isPaid:true})
        const activeShows = await showModel.find({showDateTime:{$gte:Date.now()}}).populate('movie')
        const totalUser = await userModel.countDocuments()

        const dashboardData = {
            totalBookings:bookings.length,
            totalRevenue:bookings.reduce((acc,booking)=>acc+booking.totalAmount,0),
            activeShows,
            totalUser
        }
        res.json({sucess:true,dashboardData})
    }
    catch(err){
        res.json({sucess:false,message:err.message})
}}


//api to get all shows
const getAllShows = async (req, res) => {
    try{
        const shows = await showModel.find({showDateTime:{$gte:Date.now()}}).populate('movie').sort({showDateTime:1})
        res.json({sucess:true,shows})
    }
    catch(err){
        res.json({sucess:false,message:err.message})
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
        
        res.json({sucess:true,bookings})
    }
    catch(err){
        res.json({sucess:false,message:err.message})
    }
}

module.exports = {
    isAdmin,
    getDashboardData,
    getAllShows,
    getAllBookings
}

