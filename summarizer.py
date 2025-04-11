import sys
import os
import requests
from bs4 import BeautifulSoup
import json
from dotenv import load_dotenv
import google.generativeai as genai
import openai  # Groq fallback

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUMMARY_CACHE_FILE = "summary_cache.json"

# Load summary cache
summary_cache = {}
if os.path.exists(SUMMARY_CACHE_FILE):
    try:
        with open(SUMMARY_CACHE_FILE, "r") as f:
            summary_cache = json.load(f)
    except json.JSONDecodeError:
        print("⚠️ Summary cache is corrupted. Starting fresh.")

# Gemini config
genai.configure(api_key=GEMINI_API_KEY)

# Groq config
openai.api_key = GROQ_API_KEY
openai.api_base = "https://api.groq.com/openai/v1"
openai.api_type = "openai"
openai.api_version = None

# Prompt used for both summarizers
SUMMARY_PROMPT = (
    "Write a concise and engaging summary of the blog post suitable for an email newsletter. "
    "Begin with a short friendly greeting. Highlight the main ideas and key points clearly using brief paragraphs or bullet points. "
    "Use **bold** for emphasis and *italic* where appropriate to improve readability. "
    "The tone should be professional yet approachable, and the summary should be informative without including any call to action or subject line."
)

def fetch_article_text(url):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; NewsletterBot/1.0)"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        paragraphs = soup.find_all("p")
        return "\n".join(p.get_text() for p in paragraphs if p.get_text().strip())[:10000]
    except Exception as e:
        print("❌ Failed to fetch article:", e)
        return ""

def summarize_with_gemini(text):
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(f"{SUMMARY_PROMPT}\n\n{text}")
        return getattr(response, "text", "").strip()
    except Exception as e:
        print("⚠️ Gemini summarization failed:", e)
        return None

def summarize_with_groq(text):
    try:
        response = openai.ChatCompletion.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": SUMMARY_PROMPT},
                {"role": "user", "content": text},
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("❌ Groq fallback failed:", e)
        return "Summary unavailable."

def save_cache():
    try:
        with open(SUMMARY_CACHE_FILE, "w") as f:
            json.dump(summary_cache, f, indent=2)
    except Exception as e:
        print("⚠️ Could not save summary cache:", e)

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
