const nodemailer = require('nodemailer');

async function sendOtp(email) {
    const rawOtp = generateOtp();

    let transporter = nodemailer.createTransport({
        service: 'gmail', // replace with your email service
        auth: {
            user: process.env.EMAIL_USER, // replace with your email username
            pass: process.env.EMAIL_PASS  // replace with your email password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: "usama.bashirb1@gmail.com", // replace with your company email
        to: email, 
        subject: 'OTP for your request', 
        text: 'Your OTP is: ' + generateOtp, 
        html: '<p>Your OTP is: <b>' + generateOtp + '</b></p>' 
    };

    // send mail with defined transport object
    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error(err);
        throw new Error('There was an error sending the email');
    }

    // You could add additional OTP details here
    const otpDetails = {
        otpHash: hashFunction(generateOtp),  // replace with your hashing function
        otpExpiry: Date.now() + 20*60*1000  // OTP expires after 20 minutes
    };

    return otpDetails;
}

module.exports = {
    sendOtp,
};


