const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD
    }
});

exports.sendContactEmail = (req, res) => {
    const { name, email, message } = req.body;

    console.log("Contact data received:", { name, email, message });

    const mailOptions = {
        from: email,
        to: process.env.FROM_EMAIL,
        subject: `New message from ${name}`,
        text: `You have a new message from:
        Name: ${name}
        Email: ${email}
        Message: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Email error:", error);
            return res.status(500).json({ message: "Error sending email" });
        }
        console.log("Email sent:", info.response);
        res.status(200).json({ message: "Email sent successfully" });
    });
};