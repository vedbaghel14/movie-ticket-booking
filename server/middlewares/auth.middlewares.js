const {clerkClient} = require('@clerk/express')

const protectAdmin = async (req,res,next)=>{
    try{
        const {userId} = req.auth()
        const user = await clerkClient.users.getUser(userId)
        if(user.publicMetadata.role === 'admin'){
            next()
        }
        else{
            res.status(401).json({success:false,message:'Unauthorized'})
        }
    }
    catch(err){
        res.status(401).json({success:false,message:'Unauthorized'})
    }
    
    
}

module.exports = {protectAdmin}