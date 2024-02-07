const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    
const sendVerificationEmail = async (toEmail, firstName) => {
    const mssg = {
        to: toEmail,
        from: 'reidlongsb@gmail.com',
        subject: 'Welcome to Study Buddy!',
        text: `Hello ${firstName}. We have some great things in store for you!`
    }

    try {
        sgMail.send(mssg)
        console.log("sendgrid request sent: ")
        console.log(mssg)
    }
    catch (error) {
        console.error(error);

        if (error.response) {
            console.error(error.response.body)
        }
    }
}

module.exports = { sendVerificationEmail }