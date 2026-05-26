const express = require('express')
const { getUserBookings, updateFavouriteMovie, getFavourites } = require('../controllers/user.controller')

const userRouter = express.Router()

userRouter.get('/bookings', getUserBookings)
userRouter.post('/update-favourite', updateFavouriteMovie)
userRouter.get('/favourites', getFavourites)

module.exports = userRouter