const Parser = require("rss-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cron = require("node-cron");
const mongoose = require("mongoose");
const { execSync } = require("child_process");
const Subscriber = require("./model/Subscriber");
require("dotenv").config();
const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");
const marked = require("marked");
const EMAIL_TEMPLATE_PATH = "./template/emailTemplate.html";
const emailTemplateContent = fs.readFileSync(EMAIL_TEMPLATE_PATH, "utf-8");

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

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

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

// Call Python script to get summary with fallback support
function getSummary(url) {
  const commands = [
    `py summarizer.py "${url}"`,
    `python summarizer.py "${url}"`,
    `python3 summarizer.py "${url}"`,
  ];

  for (let cmd of commands) {
    try {
      console.log(`🔁 Trying command: ${cmd}`);
      const output = execSync(cmd, { encoding: "utf-8" });
      console.log("✅ Summary generated using:", cmd.split(" ")[0]);
      return output.trim();
    } catch (err) {
      console.warn(`⚠️ Failed using ${cmd.split(" ")[0]}:`, err.message);
    }
  }

  console.error("❌ All summary methods failed.");
  return "Summary not available.";
}

// Load and render email template
function loadEmailTemplate(post, summaryMarkdown) {
  const summaryHTML = marked.parse(summaryMarkdown);
  const cleanHTML = DOMPurify.sanitize(summaryHTML); 
  return emailTemplateContent
    .replace("{{title}}", post.title)
    .replace("{{summary}}", cleanHTML)
    .replace("{{link}}", post.link);
}

async function sendNewsletter(post) {
  const postKey = `${post.title}-${post.link}`;
  let subscribers = await Subscriber.find({});
  if (subscribers.length === 0) return console.log("⚠️ No subscribers");

  const summary = getSummary(post.link);
  const html = loadEmailTemplate(post, summary);

  const sentEmails = new Set();
  const startIndex = sendProgress?.postId === postKey ? sendProgress.lastIndex + 1 : 0;

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
      sentEmails.add(sub.email);
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ postId: postKey, lastIndex: i }));
    } catch (err) {
      console.error(`❌ Email failed to ${sub.email}`, err);
    }

    if (i < subscribers.length - 1) {
      console.log("⏳ Waiting 5 minutes before next email...");
      await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
    }
  }

  // Check for new subscribers after original run
  const finalSubs = await Subscriber.find({});
  const finalEmails = finalSubs.map((s) => s.email);

  const missedEmails = finalEmails.filter(email => !sentEmails.has(email));
  if (missedEmails.length) {
    console.log(`🔁 Sending missed emails to ${missedEmails.length} new/missed subscriber(s)...`);
    for (let email of missedEmails) {
      const mailOptions = {
        from: `"Ansh Raj" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: `📰 New Blog: ${post.title}`,
        html,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Sent to missed/new: ${email}`);
      } catch (err) {
        console.error(`❌ Retry failed for ${email}`, err);
      }

      if (email !== missedEmails[missedEmails.length - 1]) {
        console.log("⏳ Waiting 5 minutes before next retry...");
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
      }
    }
  }

  sentPosts.push(postKey);
  fs.writeFileSync(SENT_CACHE_FILE, JSON.stringify(sentPosts));
  if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
}

async function checkMediumFeed() {
  if (isProcessing) return console.log("⏳ Already sending emails, skipping this cycle...");
  isProcessing = true;

  try {
    const feed = await parser.parseURL(FEED_URL);
    const latestPost = feed.items[0];
    const postKey = `${latestPost.title}-${latestPost.link}`;

    if (!sentPosts.includes(postKey) || (sendProgress && sendProgress.postId === postKey)) {
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
