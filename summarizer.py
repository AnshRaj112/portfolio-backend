import sys
import os
import requests
from bs4 import BeautifulSoup
import json
from dotenv import load_dotenv
import google.generativeai as genai
import openai  # Used only for Groq wrapper

load_dotenv()

# Setup keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUMMARY_CACHE_FILE = "summary_cache.json"

# Load cache
if os.path.exists(SUMMARY_CACHE_FILE):
    with open(SUMMARY_CACHE_FILE, "r") as f:
        summary_cache = json.load(f)
else:
    summary_cache = {}

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Configure OpenAI wrapper for Groq
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
        print("❌ Failed to fetch content:", e)
        return ""  # Prevent crashing server

def summarize_with_gemini(text):
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        res = model.generate_content(f"Summarize this blog post in a concise, engaging style:\n{text}")
        return res.text.strip()
    except Exception as e:
        print("⚠️ Gemini failed:", e)
        return None

def summarize_with_groq(text):
    try:
        response = openai.ChatCompletion.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "Summarize the following blog post in a concise, engaging style for an email newsletter."},
                {"role": "user", "content": text}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("❌ Groq fallback also failed:", e)
        return "Summary unavailable."

def save_cache():
    with open(SUMMARY_CACHE_FILE, "w") as f:
        json.dump(summary_cache, f, indent=2)

def get_summary(url):
    if url in summary_cache:
        return summary_cache[url]

    article = fetch_article_text(url)
    if not article.strip():
        return "Summary unavailable."

    summary = summarize_with_gemini(article)
    if not summary:
        summary = summarize_with_groq(article)

    summary_cache[url] = summary
    save_cache()
    return summary

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python summarizer.py <URL>")
        sys.exit(1)

    url = sys.argv[1]
    print(get_summary(url))