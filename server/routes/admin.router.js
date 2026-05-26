const express = require('express');
const { protectAdmin } = require('../middlewares/auth.middlewares');
const { getDashboardData, getAllBookings, isAdmin, getAllShows } = require('../controllers/admin.controller');

const adminrouter = express.Router();

adminrouter.get('/is-admin',protectAdmin ,isAdmin)
adminrouter.get('/dashboard',protectAdmin ,getDashboardData)
adminrouter.get('/all-shows',protectAdmin ,getAllShows)
adminrouter.get('/all-bookings',protectAdmin ,getAllBookings)

module.exports = adminrouter;