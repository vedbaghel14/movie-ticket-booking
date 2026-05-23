const { Inngest } = require("inngest");
const usermodel = require("../models/user.model")

// Create a client to send and receive events
const inngest = new Inngest({ id: "movie-ticket-booking" });

//create a function to save user data to the database
const syncUserCreation = inngest.createFunction(
    {id:'sync-user-from-clerk',triggers:[{event:'clerk/user.created'}]},
    
async ({event}) => {
    const {id,first_name,last_name,email_addresses,image_url} = event.data
    const userData = {
        _id:id,
        email:email_addresses[0].email_address,
        name:first_name+' '+last_name,
        image:image_url
    }
    await usermodel.create(userData)
}, )

//inngest function to delete user data from the database
const syncUserDeletion = inngest.createFunction(
    {id:'deleted-user-with-clerk',triggers:[{event:'clerk/user.deleted'}]},
    
async ({event}) => {
    const {id} = event.data
    await usermodel.deleteOne({_id:id})}
)

//inngest function to update user data in the database
const syncUserUpdate = inngest.createFunction(
    {id:'update-user-with-clerk',triggers:[{event:'clerk/user.updated'}]},
    
async ({event}) => {
    const {id,first_name,last_name,email_addresses,image_url} = event.data
    const userData = {
         _id:id,
        email:email_addresses[0].email_address,
        name:first_name+' '+last_name,
        image:image_url
}
    await usermodel.findByIdAndUpdate(id,userData)

}
)

// Create an empty array where we'll export future Inngest functions
const functions = [syncUserCreation, syncUserDeletion,syncUserUpdate];

module.exports = { inngest , functions };
