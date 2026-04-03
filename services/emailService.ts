import { brevo, sender } from "../config/brevo";

export const sendAcountDetails = async (
    email: string,
    name: string,
    password: string
) => {
    try {
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; padding: 30px; border: 1px solid #d1d5db;">
            
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <div style="width: 55px; height: 55px; background: #111827; border-radius: 999px; display: flex; align-items: center; justify-content: center;">
                <img src="/logo.png" alt="logo" style="width: 35px; height: 35px;" />
                </div>

                <h2 style="margin: 0; font-size: 16px; color: #111827;">
                Zhiyuan Enterprice Group Inc.
                </h2>
            </div>

            <hr style="border: none; border-top: 1px solid #d1d5db; margin-bottom: 20px;" />

            <h1 style="font-size: 20px; color: #111827; margin-bottom: 10px;">
                Welcome, ${name}!
            </h1>

            <p style="font-size: 14px; color: #374151; margin-bottom: 20px;">
                Your distributor account has been created successfully. Below are your login credentials:
            </p>

            <div style="background: #f9fafb; padding: 15px; border-radius: 10px; border: 1px solid #d1d5db;">
                <p style="margin: 0; font-size: 14px; color: #111827;">
                <strong>Email:</strong> ${email}
                </p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #111827;">
                <strong>Password:</strong> ${password}
                </p>
            </div>

            <p style="font-size: 14px; color: #374151; margin-top: 20px;">
                Please log in and change your password immediately for security purposes.
            </p>

            <a href="${process.env.URL}"
                style="display: inline-block; margin-top: 20px; background: #111827; color: white; padding: 12px 18px;
                text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: bold;">
                Login Now
            </a>

            <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
                If you did not request this account, please ignore this email.
            </p>

            </div>
        </div>
        `;

        await brevo.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: "Your Distributor Account Information",
            htmlContent,
        });

    } catch (err: any) {
        console.error("Error sending email:", err);
        throw new Error("Failed to send email.");
    }
};