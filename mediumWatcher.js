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
const PROGRESS_FILE = "./sendProgress.json";

let isProcessing = false;

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
let sentPosts = fs.existsSync(SENT_CACHE_FILE)
  ? JSON.parse(fs.readFileSync(SENT_CACHE_FILE, "utf-8"))
  : [];

// Load send progress
let sendProgress = fs.existsSync(PROGRESS_FILE)
  ? JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"))
  : null;

async function sendNewsletter(post) {
  const subscribers = await Subscriber.find({});
  if (subscribers.length === 0) return console.log("⚠️ No subscribers");

  const html = `
    <h2>🆕 New Medium Post: ${post.title}</h2>
    <p>${post.contentSnippet}</p>
    <p><a href="${post.link}">Read the full article →</a></p>
  `;

  const startIndex = sendProgress?.postId === post.guid ? sendProgress.lastIndex + 1 : 0;

  for (let i = startIndex; i < subscribers.length; i++) {
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

      // Save progress
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ postId: post.guid, lastIndex: i }));
    } catch (err) {
      console.error(`❌ Email failed to ${sub.email}`, err);
    }

    if (i < subscribers.length - 1) {
      console.log("⏳ Waiting 5 minutes before next email...");
      await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000)); // 5 mins
    }
  }

  // Clean up after finishing
  sentPosts.push(post.guid);
  fs.writeFileSync(SENT_CACHE_FILE, JSON.stringify(sentPosts));
  fs.unlinkSync(PROGRESS_FILE); // Remove progress file
}

async function checkMediumFeed() {
  if (isProcessing) return console.log("⏳ Already sending emails, skipping this cycle...");
  isProcessing = true;

  try {
    const feed = await parser.parseURL(FEED_URL);
    const latestPost = feed.items[0];

    if (!sentPosts.includes(latestPost.guid) || (sendProgress && sendProgress.postId === latestPost.guid)) {
      await sendNewsletter(latestPost);
    } else {
      console.log("📭 No new Medium post.");
    }
  } catch (err) {
    console.error("❌ Error checking Medium feed:", err);
  }

  isProcessing = false;
}

// Schedule every 15 minutes
cron.schedule("*/15 * * * *", () => {
  console.log("🔍 Checking Medium feed...");
  checkMediumFeed();
});
