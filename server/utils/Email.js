const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// !! IMPORTANT: Replace this with the email from your verified Resend domain
const FROM_EMAIL = 'Pinch App <PINCH_MAIL@resend.dev>';

const sendVerificationEmail = async (userEmail, token) => {
    // This URL logic stays the same
    const verificationURL = `${process.env.BASE_URL}/verify-email?token=${token}`;

    try {
        // This replaces the transporter.sendMail()
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail, // This comes from the user signing up
            subject: 'Please verify your email address for Pinch',
            html: `<p>Welcome to Pinch!</p><p>Please click on the following link to verify your email address:</p><p><a href="${verificationURL}">${verificationURL}</a></p><p>This link will expire in 1 hour.</p>`
        });

        if (error) {
            console.error("Error sending email via Resend:", error);
            return;
        }

        console.log("Resend: Email sent successfully!", data.id);

    } catch (error) {
        console.error("Critical error sending email: ", error);
    }
};

module.exports = { sendVerificationEmail };

// const nodemailer = require('nodemailer');

// const sendVerificationEmail = async (userEmail, token) => {
//     // For development, we use Ethereal. In production, you would use a real service.
//     // Go to https://ethereal.email/create to get your test account credentials
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     });

//     const verificationURL = `${process.env.BASE_URL}/verify-email?token=${token}`;

//     const mailOptions = {
//         from: '"Pinch App" <noreply@pinch.com>',
//         to: userEmail,
//         subject: 'Please verify your email address',
//         html: `<p>Please click on the following link to verify your email address:</p><p><a href="${verificationURL}">${verificationURL}</a></p><p>This link will expire in 1 hour.</p>`
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log("Email sent: " + info.response);
//         // Ethereal provides a URL to preview the sent email
//         console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//     } catch (error) {
//         console.error("Error sending email: ", error);
//     }
// };

// module.exports = { sendVerificationEmail };