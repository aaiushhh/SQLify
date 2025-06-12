from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_huggingface import HuggingFaceEndpoint
import pandas as pd
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

# Initialize the Hugging Face model
model_id = "mistralai/Mistral-7B-Instruct-v0.3"
conv_model = HuggingFaceEndpoint(
    huggingfacehub_api_token="",
    repo_id=model_id,
    temperature=0.1,
    max_new_tokens=150,
)

# Global variable to store the dynamic schema
schema = ""
tablename= ""

# Function to update the schema dynamically from the CSV
def update_schema(dataframe):
    global schema
  
    column_types = {col: str(dataframe[col].dtype) for col in dataframe.columns}
   
    sql_types = {
        "int64": "INT",
        "float64": "FLOAT",
        "object": "VARCHAR(255)",  
        "bool": "BOOLEAN",
        "datetime64[ns]": "DATETIME"
    }
    # Wrap column names in backticks to handle spaces and special characters
    schema = ", ".join([f"`{col}` {sql_types.get(dtype, 'TEXT')}" for col, dtype in column_types.items()])



template = '''
You are an AI specialized in generating SQL queries based on user input. You must only respond with the SQL query, without any explanation or self-referencing. Do not repeat previous responses.
Schema: {schema}

User Query: {input}

Table Name: {tablename}

SQL Query (no other output):
'''

prompt = PromptTemplate(
    input_variables=["input", "schema"],
    template=template,
)

# Create the LLM Chain
conv_chain = LLMChain(
    llm=conv_model,
    prompt=prompt,
)

# MySQL Connection Function
def mysql_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="meow99",
        database="sqlify"
    )

def execute_sql_query(sql_query):
    conn = mysql_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(sql_query)
        if sql_query.strip().lower().startswith("select"):
            result = cursor.fetchall()
        else:
            conn.commit()
            result = "Query executed successfully"
    except Exception as e:
        result = str(e) 
    finally:
        cursor.close()
        conn.close()
    
    return result


def get_response(query):
    global schema

    sql_query = conv_chain.invoke({"input": query, "tablename":tablename, "schema": schema})["text"].strip()

    if sql_query.startswith("SQL Query:"):
        sql_query = sql_query.replace("SQL Query:", "").strip()

    if sql_query.startswith("```sql"):
        sql_query = sql_query.replace("```sql", "").strip()
    sql_query = sql_query.replace("```", "").strip()

    return sql_query

@app.route("/getQuery", methods=['POST'])
def get_query():
    data = request.get_json()
    user_query = data.get("userQuery") 
    sql_query = get_response(user_query)
    result = execute_sql_query(sql_query)

    return jsonify({"query": sql_query, "result": result})



@app.route('/loadData', methods=['POST'])
def load_data():
    global schema
    global tablename

    # Check if the file part is present in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    print(file.filename)

    # Check if the file is a CSV file
    if file and file.filename.endswith('.csv'):
        # Save the file locally if needed
        file_path = os.path.join(file.filename)
        # file.save(file_path)

        # Load the CSV data
        data = pd.read_csv(file_path)
        update_schema(data)

        conn = mysql_connection()
        cursor = conn.cursor()

        # Create the table schema dynamically, wrapping columns with backticks
        tablename = os.path.splitext(file.filename)[0]
        columns = ", ".join([f"{col}" for col in schema.split(", ")])

        # Check if the table already exists
        cursor.execute(f"SHOW TABLES LIKE '{tablename}'")
        result = cursor.fetchone()

        if not result:  # If table does not exist, create it
            cursor.execute(f"CREATE TABLE IF NOT EXISTS {tablename} ({columns})")

            # Insert data into the table dynamically
            for _, row in data.iterrows():
                placeholders = ', '.join(['%s'] * len(row))
                insert_query = f"INSERT INTO {tablename} VALUES ({placeholders})"
                cursor.execute(insert_query, tuple(row))

            conn.commit()
            message = "Table created and data loaded successfully."
        else:
            message = "Table already exists. Skipping data insertion."

        cursor.close()
        conn.close()

        return jsonify({"message": message, "schema": schema}), 200
    else:
        return jsonify({"error": "Invalid file format. Please upload a CSV file."}), 400


app.route('/logout',methods=['POST'])
def logout():
    schema=''
    return jsonify({"message": "Logged out successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)
