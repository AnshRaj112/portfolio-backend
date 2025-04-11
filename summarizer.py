import sys
import os
import requests
from bs4 import BeautifulSoup
import json
from dotenv import load_dotenv
import google.generativeai as genai
import openai  # Used for Groq fallback

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUMMARY_CACHE_FILE = "summary_cache.json"

# Load cache if exists
if os.path.exists(SUMMARY_CACHE_FILE):
    with open(SUMMARY_CACHE_FILE, "r") as f:
        summary_cache = json.load(f)
else:
    summary_cache = {}

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Configure Groq
openai.api_key = GROQ_API_KEY
openai.api_base = "https://api.groq.com/openai/v1"
openai.api_type = "openai"
openai.api_version = None

def fetch_article_text(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        paragraphs = soup.find_all("p")
        return "\n".join(p.get_text() for p in paragraphs if p.get_text().strip())[:10000]
    except Exception as e:
        print("❌ Failed to fetch article:", e)
        return ""

def summarize_with_gemini(text):
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = (
            "Summarize the blog post in a concise, engaging tone for an email newsletter. "
            "Keep key points short and formatted. Use **bold** and *italic* where helpful."
        )
        response = model.generate_content(f"{prompt}\n\n{text}")
        return response.text.strip()
    except Exception as e:
        print("⚠️ Gemini summarization failed:", e)
        return None

def summarize_with_groq(text):
    try:
        response = openai.ChatCompletion.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Summarize the blog post in a concise, newsletter-friendly way. "
                        "Use **bold** for key points and *italic* for emphasis. Markdown allowed."
                    ),
                },
                {"role": "user", "content": text},
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("❌ Groq fallback failed:", e)
        return "Summary unavailable."

def save_cache():
    with open(SUMMARY_CACHE_FILE, "w") as f:
        json.dump(summary_cache, f, indent=2)

def get_summary(url):
    if url in summary_cache:
        return summary_cache[url]

    article_text = fetch_article_text(url)
    if not article_text:
        return "Summary unavailable."

    summary = summarize_with_gemini(article_text)
    if not summary:
        summary = summarize_with_groq(article_text)

    summary_cache[url] = summary
    save_cache()
    return summary

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python summarizer.py <URL>")
        sys.exit(1)

    url = sys.argv[1]
    print(get_summary(url))
