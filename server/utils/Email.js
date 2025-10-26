const nodemailer = require('nodemailer');

const sendVerificationEmail = async (userEmail, token) => {
    // For development, we use Ethereal. In production, you would use a real service.
    // Go to https://ethereal.email/create to get your test account credentials
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const verificationURL = `${process.env.BASE_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: '"Pinch App" <noreply@pinch.com>',
        to: userEmail,
        subject: 'Please verify your email address',
        html: `<p>Please click on the following link to verify your email address:</p><p><a href="${verificationURL}">${verificationURL}</a></p><p>This link will expire in 1 hour.</p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        // Ethereal provides a URL to preview the sent email
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email: ", error);
    }
};

module.exports = { sendVerificationEmail };