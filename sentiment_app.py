from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import re
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def preprocess_text(text):
    """
    Clean and preprocess text for better sentiment analysis
    """
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Remove URLs
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    
    # Remove excessive punctuation (keep some for context)
    text = re.sub(r'[!]{2,}', '!', text)
    text = re.sub(r'[?]{2,}', '?', text)
    text = re.sub(r'[.]{3,}', '...', text)
    
    return text.strip()

def analyze_sentiment_textblob(text):
    """
    Perform sentiment analysis using TextBlob
    Returns sentiment label and confidence score
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    # Determine sentiment based on polarity
    if polarity > 0.1:
        sentiment = "Positive"
    elif polarity < -0.1:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    
    # Calculate confidence (normalize polarity to 0-1 range)
    confidence = abs(polarity)
    if confidence == 0:
        confidence = 0.5  # Neutral confidence for truly neutral text
    
    return sentiment, confidence

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """
    Endpoint to analyze sentiment of provided text
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'No text provided',
                'message': 'Please provide text in the request body'
            }), 400
        
        text = data['text']
        
        # Validate input
        if not text or not text.strip():
            return jsonify({
                'error': 'Empty text',
                'message': 'Please provide non-empty text'
            }), 400
        
        if len(text) > 5000:
            return jsonify({
                'error': 'Text too long',
                'message': 'Please provide text with less than 5000 characters'
            }), 400
        
        # Preprocess text
        processed_text = preprocess_text(text)
        
        # Analyze sentiment
        sentiment, confidence = analyze_sentiment_textblob(processed_text)
        
        # Log the analysis
        logger.info(f"Analyzed text: '{processed_text[:50]}...' -> {sentiment} ({confidence:.2f})")
        
        # Return results
        return jsonify({
            'text': text,
            'processed_text': processed_text,
            'sentiment': sentiment,
            'confidence': confidence,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        return jsonify({
            'error': 'Analysis failed',
            'message': 'An error occurred while analyzing the text'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'message': 'Sentiment Analysis API is running'
    })

@app.route('/', methods=['GET'])
def home():
    """
    Home endpoint with API information
    """
    return jsonify({
        'message': 'Sentiment Analysis API',
        'version': '1.0',
        'endpoints': {
            'analyze': 'POST /analyze - Analyze sentiment of text',
            'health': 'GET /health - Health check'
        },
        'usage': {
            'method': 'POST',
            'url': '/analyze',
            'body': {
                'text': 'Your text to analyze'
            }
        }
    })

if __name__ == '__main__':
    print("Starting Sentiment Analysis API...")
    print("Frontend should connect to: http://localhost:5000")
    print("Endpoints available:")
    print("  - POST /analyze - Analyze sentiment")
    print("  - GET /health - Health check")
    print("  - GET / - API information")
    
    app.run(
        host='localhost',
        port=5000,
        debug=True
    )