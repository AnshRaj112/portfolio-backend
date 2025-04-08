require("dotenv").config();
const express = require("express");
const cors = require("cors");
const contactRoute = require("./routes/contactRoute");
const educationRoutes = require("./routes/educationRoute.js");
const connectDB = require("./config/db");
const experienceRoutes = require("./routes/experience.js");
const projectRoutes = require("./routes/projectRoute.js");
const skillRoutes = require("./routes/skillRoutes.js");
const researchRoutes = require("./routes/researchRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");

const app = express();
connectDB();

app.use(express.json());  // ✅ Parses incoming JSON data
app.use(express.urlencoded({ extended: true }));  // ✅ Parses form data

// ✅ Load environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;

// ✅ Fix CORS issues: Use a single instance
app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);


// ✅ Ensure MONGO_URL exists
if (!MONGO_URL) {
  console.error("❌ MONGO_URL is missing in .env file");
  process.exit(1);
}

// ✅ Routes
app.use("/contact", contactRoute);
app.use("/education", educationRoutes);
app.use("/experience", experienceRoutes);
app.use("/projects", projectRoutes);
app.use("/skills", skillRoutes);
app.use("/research", researchRoutes);
app.use("/testimonials", testimonialRoutes);


app.get("/ping", (req, res) => {
  res.send("pong");
});


// ✅ Global error handling
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Redirect HTTP to HTTPS in Production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
  });
}

// ✅ Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}, allowing frontend from ${FRONTEND_URL}`)
);