const Parser = require("rss-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cron = require("node-cron");
const mongoose = require("mongoose");
const Subscriber = require("./model/Subscriber");
require("dotenv").config();

const parser = new Parser();
const FEED_URL = process.env.MEDIUM_FEED;
const SENT_CACHE_FILE = "./sentPosts.json";

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// Connect to Mongo
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected for Medium watcher"))
  .catch((err) => console.error("MongoDB error:", err));

// Load sent posts
let sentPosts = [];
if (fs.existsSync(SENT_CACHE_FILE)) {
  sentPosts = JSON.parse(fs.readFileSync(SENT_CACHE_FILE, "utf-8"));
}

async function sendNewsletter(post) {
  const subscribers = await Subscriber.find({});
  if (subscribers.length === 0) return console.log("⚠️ No subscribers");

  const html = `
    <h2>🆕 New Medium Post: ${post.title}</h2>
    <p>${post.contentSnippet}</p>
    <p><a href="${post.link}">Read the full article →</a></p>
  `;

  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];

    const mailOptions = {
      from: `"Ansh Raj" <${process.env.FROM_EMAIL}>`,
      to: sub.email,
      subject: `📰 New Blog: ${post.title}`,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent to ${sub.email} (${i + 1}/${subscribers.length})`);
    } catch (err) {
      console.error(`❌ Email failed to ${sub.email}`, err);
    }

    // Wait 5 minutes between each send, unless it's the last one
    if (i < subscribers.length - 1) {
      console.log("⏳ Waiting 5 minutes before next email...");
      await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000)); // 5 minutes
    }
  }
}

async function checkMediumFeed() {
  const feed = await parser.parseURL(FEED_URL);
  const latestPost = feed.items[0];

  if (!sentPosts.includes(latestPost.guid)) {
    await sendNewsletter(latestPost);
    sentPosts.push(latestPost.guid);
    fs.writeFileSync(SENT_CACHE_FILE, JSON.stringify(sentPosts));
  } else {
    console.log("📭 No new Medium post.");
  }
}

// Schedule every 15 mins
cron.schedule("*/15 * * * *", () => {
  console.log("🔍 Checking Medium feed...");
  checkMediumFeed();
});
