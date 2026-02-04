import nodemailer from "nodemailer";

export async function sendOtpEmail(email: string, otp: string) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // The App Password
            },
        });

        const mailOptions = {
            from: '"TradeX" <joelbiju300@gmail.com>', // Sender address
            to: email,                                 // Receiver (can be anyone now)
            subject: "Your Verification Code",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to TradeX!</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #16a34a; letter-spacing: 2px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", email);

    } catch (error) {
        console.error("Error sending email:", error);
    }
}