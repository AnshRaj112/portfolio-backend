# Portfolio Backend

A robust backend service for the portfolio website, featuring blog content management, email notifications, and AI-powered content summarization.

## 🚀 Features

- **Blog Content Management**: Automatically fetches and processes blog posts from Medium
- **AI-Powered Summarization**: Uses Google's Generative AI and OpenAI to create concise summaries
- **Email Notifications**: Sends email updates about new blog posts
- **RESTful API**: Provides endpoints for frontend integration
- **MongoDB Integration**: Efficient data storage and retrieval
- **Scheduled Tasks**: Automated content updates using node-cron
- **Content Caching**: Optimized performance with caching mechanisms

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Task Scheduling**: node-cron
- **Email Service**: Nodemailer
- **RSS Processing**: rss-parser

### AI & Content Processing
- **Python Scripts**: For content summarization
- **AI Services**: 
  - Google Generative AI
  - OpenAI
- **Web Scraping**: BeautifulSoup4
- **HTTP Requests**: Requests library

## 📦 Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd portfolio-backend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_api_key
```

## 🚀 Development

Run the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000` (or your specified port)

## 📝 Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm test`: Run tests (currently not implemented)

## 📁 Project Structure

```
portfolio-backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── model/         # Database models
├── routes/        # API routes
├── template/      # Email templates
├── index.js       # Main application file
├── mediumWatcher.js # Medium blog watcher
├── summarizer.py  # AI content summarizer
└── .env           # Environment variables
```

## 🔄 Automated Tasks

- **Blog Monitoring**: Watches for new Medium posts
- **Content Summarization**: Generates AI-powered summaries
- **Email Notifications**: Sends updates about new content

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any questions or suggestions, please open an issue in the repository.