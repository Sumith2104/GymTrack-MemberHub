import nodemailer from 'nodemailer';
import { getGymSmtpConfig } from '@/lib/data';

interface SendOtpParams {
    to: string;
    otp: string;
    gymId: string;
}

export async function sendOtpEmail({ to, otp, gymId }: SendOtpParams): Promise<{ success: boolean; error?: string }> {
    const smtpConfig = await getGymSmtpConfig(gymId);

    if (!smtpConfig) {
        const errorMessage = `Email service is not configured for this gym (ID: ${gymId}). Cannot send OTP.`;
        console.error(`[sendOtpEmail] ${errorMessage}`);
        return { success: false, error: "The gym's email service is not configured correctly. Please contact support." };
    }

    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: smtpConfig.auth,
    });

    const mailOptions = {
        from: `Member Hub <${smtpConfig.from}>`,
        to: to,
        subject: 'Your Email Change Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0056b3; text-align: center;">Email Change Verification</h2>
                    <p>Hello,</p>
                    <p>We received a request to change the email address associated with your Member Hub account.</p>
                    <p>Please use the following One-Time Password (OTP) to complete the process. This code is valid for 10 minutes.</p>
                    <div style="background-color: #f4f4f4; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
                        <p style="font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 0;">${otp}</p>
                    </div>
                    <p>If you did not request this change, please ignore this email or contact our support team immediately.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.9em; color: #777;">Thank you,<br /><strong>The Member Hub Team</strong></p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.verify();
        await transporter.sendMail(mailOptions);
        console.log(`[sendOtpEmail] OTP email sent successfully to ${to}`);
        return { success: true };
    } catch (error) {
        console.error(`[sendOtpEmail] Failed to send email to ${to}:`, error);
        return { success: false, error: 'Failed to send verification email. Please try again later.' };
    }
}
