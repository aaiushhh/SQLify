
# SQLify

**SQLify** is an AI-powered tool that bridges natural language and SQL queries. Built with Google PaLM and LangChain, it enables users to pose queries in plain English, which are then transformed into executable SQL statements against relational databases.

---

## 🔍 Overview

- **Natural Language Interface**: Users simply ask questions like _“How much revenue did our store generate after discounts?”_  
- **Semantic Search**: Examples are embedded using Hugging Face and stored in ChromaDB. Incoming questions are matched semantically to guide the LLM.  
- **LLM‑powered SQL Generation**: Google PaLM 2 generates SQL queries based on few-shot examples and database schema.  
- **Execution & Results**: The generated SQL is run against a SQL database (e.g., PostgreSQL), and results are returned via a Streamlit frontend.

---

## 🏗 Architecture & Workflow

1. **User Input**  
2. **Embedding & Retrieval** – Hugging Face + ChromaDB  
3. **Prompt Generation** – LangChain's `SQLDatabaseChain` + `FewShotPromptTemplate`  
4. **SQL Generation** – Google PaLM 2  
5. **Database Execution** – MySQL/PostgreSQL  
6. **Output** – Streamlit app displays answers

---

## ⚙️ Technologies Used

| Component             | Description |
|----------------------|-------------|
| LLM                  | Google PaLM |
| Embeddings           | Hugging Face |
| Vector Store         | ChromaDB |
| Orchestration        | LangChain |
| UI                   | Streamlit |
| Database             | PostgreSQL/MySQL |
| Few‑Shot Examples    | FewShots.py |

---

## 🚀 Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/aaiushhh/SQLify.git
   cd SQLify
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure `.env`:
   ```
   GOOGLE_API_KEY="YOUR_GOOGLE_PALM_API_KEY"
   ```
4. Set up the database:
   ```sql
   -- Run in PostgreSQL:
   \i DataBase_Creation.sql
   ```

---

## 💡 Usage

1. Run the Streamlit app:
   ```bash
   streamlit run SQLify_Frontend.py
   ```
2. In your browser, ask questions like:
   - _How many T-shirts are left in stock?_
   - _Total inventory value for all S-size T-shirts?_
   - _What’s the total sales for Nike XS white T-shirts?_

---

## 🗂 Project Structure

```
├── DataBase_Creation.sql     # Database schema
├── db_specifications.py      # Schema definitions
├── FewShots.py               # Few-shot examples
├── SQLify_Backend.py         # Query generation logic
├── SQLify_Frontend.py        # Streamlit app
├── FewShots.py               # Prompt examples
└── requirements.txt          # Python dependencies
```

---

## 💪 Advantages

- No SQL knowledge required for users
- Semantic search improves query accuracy
- Easy-to-extend modular architecture
- Few-shot grounding enhances LLM output quality

---

## 📧 Contact / About

Built by [aaiushhh](https://github.com/aaiushhh).  
For questions or contributions, feel free to open an issue or pull request.

---

## 📝 License

This project is licensed under MIT.

---

Enjoy using SQLify—turn natural language into SQL effortlessly!
