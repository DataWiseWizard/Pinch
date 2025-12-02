const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Pinch App <noreply@pinch-your-pins.site>';

const sendVerificationEmail = async (userEmail, token) => {
    const verificationURL = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
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
                    <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        Or copy and paste this link into your browser:
                        <br>
                        <a href="${verificationURL}" style="color: #007bff; word-break: break-all;">
                            ${verificationURL}
                        </a>
                    </p>
                    <p style="font-size: 12px; color: #888;">This verification link will expire in 1 hour.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                </div>
            `
        });

        if (error) {
            console.error("Error sending email via Resend:", error);
            throw new Error(error.message || 'Resend API error');
        }

        console.log("Resend: Email sent successfully!", data.id);

    } catch (error) {
        console.error("Critical error sending email: ", error);
        throw error;
    }
};

module.exports = { sendVerificationEmail };