
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOPWORDS = {"buy", "sell", "sale", "purchase", "deal", "price", "original", "condition", "new", "used"}

def preprocess(text):
    text = str(text or "").lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join([w for w in text.split() if w not in STOPWORDS])

base = "iPhone 13 128GB Mint condition Blue Original screen"
candidates = [
    "Samsung Galaxy S21 Ultra 5G camera 128GB storage",
    "OnePlus 9 Pro 5G display 12GB RAM 256GB charger",
    "Apple iPhone 12 Clean FaceID 64GB cheaper",
    "Mountain Bike Giant TCR road bike Carbon frame",
    "Apple 13 pro max 256GB"
]

texts = [preprocess(base)] + [preprocess(c) for c in candidates]
vectorizer = TfidfVectorizer().fit_transform(texts)
sims = cosine_similarity(vectorizer[0:1], vectorizer[1:]).flatten()

names = ["Samsung S21", "OnePlus 9", "iPhone 12", "Mountain Bike", "Apple 13 pro max"]
for name, score in zip(names, sims):
    print(f"{name}:{score:.4f}")
