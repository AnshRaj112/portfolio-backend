const Subscriber = require("../model/Subscriber");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const sendWelcomeEmail = (email) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "🎉 Thanks for Subscribing!",
    html: `
      <h2>Welcome to the Newsletter!</h2>
      <p>Thanks for signing up. You'll now get updates when new posts go live on Medium!</p>
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error("❌ Email error:", err);
    else console.log("✅ Welcome email sent:", info.response);
  });
};

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(200).json({ message: "Already subscribed." });

    const subscriber = new Subscriber({ email });
    await subscriber.save();
    sendWelcomeEmail(email);

    res.status(201).json({ message: "Subscribed successfully!" });
  } catch (err) {
    console.error("❌ Subscription error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
