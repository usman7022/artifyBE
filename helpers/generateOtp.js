const bcrypt = require('bcryptjs');

async function generateOtp() {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`; // Generate 6 digit random number.
    const hashotp = await bcrypt.hash(otp, 12);
    
    const otpDetails = {
        otpHash: hashotp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
        rawOtp: otp
    };

    return otpDetails;
}

module.exports = generateOtp;
