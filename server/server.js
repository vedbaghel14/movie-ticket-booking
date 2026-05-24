require("dotenv").config()
const express = require("express")
const cors = require("cors")
const {clerkMiddleware} = require('@clerk/express')
const { serve } = require("inngest/express")
const { inngest, functions } = require("./inngest/index.js")
const showRouter = require("./routes/show.router")
const connectDB = require("./config/db")
const bookingRouter = require("./routes/booking.router.js")
const adminrouter = require("./routes/admin.router.js")
const app = express()
const port = 3000

// middlewares
app.use(clerkMiddleware())
app.use(express.json())
app.use(cors())


connectDB()

app.get('/',(req,res)=>{
    res.send("server is Live")
})
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/shows',showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin',adminrouter)

app.listen(port, () => {
    console.log("server is running on server",port)
})