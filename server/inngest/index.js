const { Inngest } = require("inngest");
const usermodel = require("../models/user.model");
const bookingmodel = require("../models/booking.model");
const showModel = require("../models/show.model");
const { sendEmail } = require("../config/nodemailer");

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

//Inngest funtion to cancel booking and release seats of show after 10 min of bookigs created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
    triggers: [
      { event: "app/checkpayment" },
    ],
  },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);

    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;

      const booking = await bookingmodel.findById(bookingId);

      if (!booking || booking.isPaid) return;

      const showData = await showModel.findById(booking.show);

      if (!showData) return;

      // Support occupiedSeats stored either as an array or as a map/object
      if (Array.isArray(showData.occupiedSeats)) {
        showData.occupiedSeats = showData.occupiedSeats.filter(
          (s) => !booking.bookedSeats.includes(s)
        );
      } else if (showData.occupiedSeats && typeof showData.occupiedSeats === 'object') {
        booking.bookedSeats.forEach((seat) => {
          delete showData.occupiedSeats[seat];
        });
      }

      showData.markModified && showData.markModified("occupiedSeats");
      await showData.save();

      await bookingmodel.findByIdAndDelete(booking._id);
    });
  }
);

//inngest funciton to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction({
  id: "send-booking-confirmation-email",
  triggers: [{ event: "app/show.booked" }],
},
async ({ event, step }) => {
    const { bookingId } = event.data
    const booking = await bookingmodel.findById(bookingId).populate({
        path:'show',
        populate:{
            path:'movie',
            model:'movie'
        }
    }).populate('user')

    if (!booking || !booking.user || !booking.show || !booking.show.movie) return

    await sendEmail({
        to: booking.user.email,
        subject:`payment confirmation: "${booking.show.movie.title}" booked`,
        body:`<div style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 0;">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <!-- Header -->
            <tr>
              <td align="center"
                style="background:linear-gradient(135deg,#E50914,#B20710);padding:30px;">
                <h1 style="color:#ffffff;margin:0;">
                  🎬 QuickShow
                </h1>
                <p style="color:#f8d7da;margin-top:8px;">
                  Your movie booking is confirmed!
                </p>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:30px;">
                <h2 style="color:#333;margin-top:0;">
                  Hi ${booking.user.name},
                </h2>

                <p style="color:#555;font-size:16px;line-height:1.6;">
                  Thank you for booking with QuickShow. Your tickets have been successfully confirmed.
                </p>

                <!-- Movie Card -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#fafafa;border:1px solid #eeeeee;border-radius:10px;padding:20px;margin-top:20px;">
                  
                  <tr>
                    <td>
                      <h3 style="margin:0;color:#E50914;">
                        ${booking.show.movie.title}
                      </h3>

                      <p style="margin:10px 0;color:#555;">
                        📅 <strong>Date:</strong>
                        ${new Date(
                          booking.show.showDateTime
                        ).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </p>

                      <p style="margin:10px 0;color:#555;">
                        ⏰ <strong>Time:</strong>
                        ${new Date(
                          booking.show.showDateTime
                        ).toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      <p style="margin:10px 0;color:#555;">
                        💺 <strong>Seats:</strong>
                        ${booking.bookedSeats.join(", ")}
                      </p>

                      <p style="margin:10px 0;color:#555;">
                        🎟️ <strong>Booking ID:</strong>
                        ${booking._id}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Important Info -->
                <div
                  style="background:#fff8e6;border-left:4px solid #ffb300;padding:15px;margin-top:30px;border-radius:6px;">
                  <p style="margin:0;color:#555;">
                    ⚠️ Please arrive at least 15 minutes before the show starts.
                  </p>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="background:#f8f9fa;padding:20px;color:#777;font-size:14px;">
                <p style="margin:0;">
                  Enjoy your movie! 🍿
                </p>

                <p style="margin:10px 0 0;">
                  Thanks for choosing <strong>QuickShow</strong>
                </p>

                <p style="margin-top:10px;font-size:12px;color:#999;">
                  This is an automated email. Please do not reply.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>`
    })
})


// Create an empty array where we'll export future Inngest functions
const functions = [syncUserCreation, syncUserDeletion,syncUserUpdate,releaseSeatsAndDeleteBooking,sendBookingConfirmationEmail];

module.exports = { inngest , functions };
