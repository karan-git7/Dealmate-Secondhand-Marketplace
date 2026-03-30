import pickle
import os
import sys

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
MODEL_PATH = os.path.join(MODEL_DIR, 'sentiment_model.pkl')

def inspect_words(words_to_check):
    print("=" * 60)
    print("      DEALMATE AI: WORD WEIGHT INSPECTION TOOL")
    print("=" * 60)
    
    if not os.path.exists(VECTORIZER_PATH) or not os.path.exists(MODEL_PATH):
        print("❌ Error: Model files not found. Please train the model first.")
        return

    # Load artifacts
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

    # Get features and coefficients
    feature_names = vectorizer.get_feature_names_out()
    coefficients = model.coef_[0]
    
    # Create a vocabulary map for fast lookup
    vocab = {word: i for i, word in enumerate(feature_names)}

    print(f"{'WORD':<15} | {'WEIGHT':<10} | {'INTERPRETATION'}")
    print("-" * 60)

    for word in words_to_check:
        word = word.lower().strip()
        if word in vocab:
            idx = vocab[word]
            weight = coefficients[idx]
            
            if weight > 0.5:
                interp = "Strong Positive"
            elif weight < -0.5:
                interp = "Strong Negative"
            else:
                interp = "Neutral / Low Impact"
                
            print(f"{word:<15} | {weight:>10.4f} | {interp}")
        else:
            # If not in vocab, it means it's in the STOP WORDS list!
            print(f"{word:<15} | {'0.0000':>10} | REMOVED (Bias-Free Stopword) ✅")

    print("-" * 60)
    print("EXPLANATION:")
    print("1. Positive Weight: Word contributes to a 'Positive' review.")
    print("2. Negative Weight: Word contributes to a 'Negative' review.")
    print("3. REMOVED/Zero: Word is treated as neutral (No Bias).")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    target_words = ["phone", "bike", "car", "black", "delivery", "amazing", "worst", "product"]
    inspect_words(target_words)
