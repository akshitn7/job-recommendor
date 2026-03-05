# Defines the single POST /api/recommend endpoint. Receives the uploaded resume file, calls parser, 
# skill_extractor, queries, and matcher services in order, and returns the final JSON response.