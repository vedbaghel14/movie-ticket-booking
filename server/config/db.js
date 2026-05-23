const mongoose = require('mongoose')
const dns = require('dns')
dns.setServers(['8.8.8.8','1.1.1.1'])
const connectDB = async ()=>{
    try{
        mongoose.connection.on('connected',()=>{console.log('MongoDB connected')})
        await mongoose.connect(process.env.MONGO_URI)
        // console.log('MongoDB connected')
    }
    catch(err){
        console.log(err.message)
        process.exit(1)
    }
}

module.exports = connectDB