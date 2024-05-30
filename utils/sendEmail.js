const nedemailer=require('nodemailer')

module.exports = async(userEmail,subject,htmlTemplate) =>{
    try {

        const transporter = nedemailer.createTransport({
            service:'gmail',
            auth:{
                user : process.env.APP_EMAIL_ADRESS, //sender
                pass: process.env.APP_EMAIL_PASSWORD 
            }
        })

        const mailOption ={
            from:process.env.APP_EMAIL_ADRESS,
            to:userEmail,
            subject:subject,
            html:htmlTemplate
        }

        const info = await transporter.sendMail(mailOption)

    

    } catch (error) {
        console.log(error)
        throw new Error("Internal Server Error (nodemailer")
    }
}