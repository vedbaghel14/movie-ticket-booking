require("dotenv").config()
const express = require("express")
const cors = require("cors")
const {clerkMiddleware} = require('@clerk/express')
const { serve } = require("@inngest/express")
const { inngest, functions } = require("./inngest/index.js")
const connectDB = require("./config/db")
const app = express()
const port = 3000

// middlewares
app.use(clerkMiddleware())
app.use(express.json())
app.use(cors())
app.use("/api/inngest", serve({ client: inngest, functions }));

connectDB()

app.get('/',(req,res)=>{
    res.send("server is Live")
})
app.listen(port, () => {
    console.log("server is running on server",port)
})