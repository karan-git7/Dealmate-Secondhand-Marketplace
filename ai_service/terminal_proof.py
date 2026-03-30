
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- EXACT LOGIC FROM YOUR recommend.py ---
STOPWORDS = {
    "buy", "sell", "sale", "selling", "purchase", "deal", "offer", "offers", 
    "price", "priced", "cost", "rate", "charge", "available", "availability", 
    "stock", "urgent", "quick", "good", "great", "best", "excellent", "nice", 
    "perfect", "genuine", "original", "real", "top", "quality", "high", "premium",
    "product", "item", "thing", "stuff", "piece", "set", "condition", "new", 
    "used", "brand", "contact", "call", "message", "whatsapp", "dm", "inbox",
    "interested", "serious", "buyer", "seller", "dealmate", "marketplace"
}

def preprocess_text(text: str) -> str:
    text = str(text or "").lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = [w for w in text.split() if len(w) > 1 and w not in STOPWORDS]
    return " ".join(tokens)

def build_text(item: dict) -> str:
    title = preprocess_text(item.get("title") or "")
    description = preprocess_text(item.get("description") or "")
    return f"{title} {title} {description}"

# --- LIVE TEST DATA ---
base_product = {
    "id": 101,
    "title": "Apple iPhone 13 128GB",
    "description": "Mint condition iPhone 13 in Blue. Original screen, never repaired. Battery health 89%."
}
candidates = [
    {   "id": 201, "title": "Samsung Galaxy S21 Ultra",
        "description": "Powerful 5G phone with amazing camera. 128GB storage, minor scratches on back."
    },
    {  "id": 202,   "title": "OnePlus 9 Pro 5G",
        "description": "Smooth 120Hz display, 12GB RAM, 256GB storage. Includes original charger."
    },
    { "id": 203, "title": "Apple iPhone 12",
        "description": "Clean iPhone 12. FaceID working, 64GB storage."
    },
    {   "id": 204, "title": "Mountain Bike - Giant TCR",
        "description": "Professional road bike for sale. Carbon frame, shimano gears."
    },
    { "id": 205, "title": "Apple 13 pro max 256GB",
        "description": "Iphone 13 pro max 256GB in excellent condition. Battery health 90%."
    }
]

def run_real_test():
    print("\n" + "="*70)
    print("      DEALMATE AI: LIVE RECOMMENDATION TERMINAL PROOF")
    print("="*70)
    print(f"TARGET ITEM: {base_product['title']}")
    print("-" * 70)

    # 1. Processing
    texts = [build_text(base_product)] + [build_text(c) for c in candidates]
    
    # 2. Vectorization
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
    matrix = vectorizer.fit_transform(texts)
    
    # 3. Calculation
    similarities = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    
    # 4. Results
    print(f"{'RECOMMENDED ITEM':<30} | {'SIMILARITY':<12} | {'RANK'}")
    print("-" * 70)
    
    indexed = list(enumerate(similarities))
    indexed.sort(key=lambda x: x[1], reverse=True)
    
    for rank, (idx, score) in enumerate(indexed, 1):
        item = candidates[idx]
        status = "✅ MATCH" if score > 0.1 else "❌ LOW"
        print(f"{rank}. {item['title']:<30} | Score: {score:.4f} | {status}")
    
    print("-" * 75)
    best_item = candidates[indexed[0][0]]['title']
    print(f"CONCLUSION: Item '{best_item}' is the top recommendation.")
    print("Logic: Based on TF-IDF Vectorization of Title + Description.")
    print("="*75 + "\n")

if __name__ == "__main__":
    run_real_test()
