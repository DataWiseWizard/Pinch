const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// !! IMPORTANT: Replace this with the email from your verified Resend domain
const FROM_EMAIL = 'Pinch App <noreply@pinch-your-pins.site>';

const sendVerificationEmail = async (userEmail, token) => {
    // This URL logic stays the same
    const verificationURL = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    try {
        // This replaces the transporter.sendMail()
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail, // This comes from the user signing up
            subject: 'Please verify your email address for Pinch',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Welcome to Pinch!</h2>
                    <p>Please click the button below to verify your email address and activate your account:</p>
                    <p>
                        <a href="${verificationURL}" 
                           style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                           Verify Email Address
                        </a>
                    </p>
                    <p style="font-size: 12px; color: #888;">This verification link will expire in 1 hour.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                </div>
            `
        });

        if (error) {
            console.error("Error sending email via Resend:", error);
            // --- FIX: Throw the error so the controller can see it ---
            throw new Error(error.message || 'Resend API error');
        }

        console.log("Resend: Email sent successfully!", data.id);

    } catch (error) {
        console.error("Critical error sending email: ", error);
        // --- FIX: Re-throw the error ---
        throw error;
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