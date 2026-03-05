# One time script that loads the Kaggle jobs CSV dataset into PostgreSQL. 
# Cleans and normalizes the data, extracts required skills from job descriptions using the LLM, 
# and inserts all records into the jobs table.