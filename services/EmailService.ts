import { brevo, sender } from "../config/brevo";

interface DistributorEmailParams {
    email: string;
    password: string;
    name: string;
}

export const sendDistributorAccountEmail = async ({
    email,
    password,
    name,
}: DistributorEmailParams) => {
    try {
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Welcome to Zhiyuan Distributor System, ${name}!</h2>
            <p>Your account has been created successfully.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please log in and change your password after your first login.</p>
            <br/>
            <p>Best regards,<br/>Zhiyuan Team</p>
        </div>
        `;

        await brevo.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: "Your Zhiyuan Distributor Account",
            htmlContent,
        });

        console.log(`Account email sent to ${email}`);
        return;
    } catch (err: any) {
        console.error("Error sending email:", err.message);
        throw new Error("Failed to send email.");
    }
};