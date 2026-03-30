import pandas as pd
import pickle
import os
import re
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODEL_DIR = os.path.join(BASE_DIR, 'models')
TRAIN_DATA_PATH = os.path.join(DATA_DIR, 'train.csv')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
MODEL_PATH = os.path.join(MODEL_DIR, 'sentiment_model.pkl')

def simple_preprocess(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^a-z\s]', '', text)
    return text.strip()

def generate_matrix():
    print("Loading model and data for matrix generation...")
    
    if not os.path.exists(TRAIN_DATA_PATH):
        print("Error: train.csv not found.")
        return

    # Load artifacts
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

    # Load a sample for evaluation 
    # Using 400k samples to match the exact count mentioned in the report
    print("Reading 400,000 reviews...")
    df = pd.read_csv(TRAIN_DATA_PATH, header=None, names=['label', 'title', 'text'], nrows=400000)
    
    df['clean_text'] = df['text'].apply(simple_preprocess)
    df['target'] = df['label'].apply(lambda x: 0 if x == 1 else 1)
    
    X_test_vec = vectorizer.transform(df['clean_text'])
    y_test = df['target']
    
    # Predict
    print("Generating predictions...")
    y_pred = model.predict(X_test_vec)
    
    # Create Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    
    # Plotting
    plt.figure(figsize=(8, 6))
    
    # Customizing the look for a professional presentation
    display = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['Negative', 'Positive'])
    display.plot(cmap='Blues', values_format='d')
    
    plt.title('Sentiment Analysis: Confusion Matrix (DealMate)', fontsize=14, pad=20)
    plt.xlabel('Predicted Sentiment', fontsize=12)
    plt.ylabel('Actual Sentiment', fontsize=12)
    
    # Save the file
    save_path = os.path.join(BASE_DIR, "confusion_matrix.png")
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    print("-" * 60)
    print(f"✅ SUCCESS: Confusion Matrix saved to: {save_path}")
    print("You can now insert this image into your Slide 10 or Slide 13!")
    print("-" * 60)

if __name__ == "__main__":
    generate_matrix()
