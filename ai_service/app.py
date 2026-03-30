# ai_service/app.py
#
# DealMate AI Service — entry point documentation
#
# This package contains two independent Flask microservices:
#
#   • sentiment.py  — Sentiment analysis (port 5001)
#       Endpoint: POST /analyze_sentiment
#       Uses: scikit-learn TF-IDF + Logistic Regression (pre-trained, models/)
#
#   • recommend.py  — Content-based product recommendation (port 5002)
#       Endpoint: POST /content_recommend
#       Endpoint: GET  /health
#       Uses: TF-IDF + cosine similarity (computed per request, no stored model)
#
# To run both services locally:
#   python sentiment.py    # starts on :5001
#   python recommend.py    # starts on :5002
#
# On Render, each service is deployed as a separate Python web service.
# See render.yaml at the project root for deployment configuration.
