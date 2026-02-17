# U2INVEST 🚀

**Your path, Your Choice, Your Future, You to Invest.**

**Enterprise-grade financial platform featuring a RAG-enabled AI Agent (DeepSeek-V3 + LangGraph), interactive Trading Lab, and Knowledge Academy. Orchestrated with Flask, LangChain 1.1, and AkShare.**

<img src="static/images/LOGO_final.png" width="280" alt="U2INVEST Logo">

## ✨ Key Features

### 🤖 U2CHAT (AI Agent)
*   **Powered by DeepSeek-V3:** Utilizes state-of-the-art LLM reasoning for financial queries.
*   **LangGraph & RAG Architecture:** Orchestrates complex workflows and retrieves knowledge from local investment guides (PDFs).
*   **Real-time Data:** Integrated with **AkShare** to fetch live Chinese A-share market data.
*   **Visual Analysis:** Generates interactive ECharts for price trends and K-line data.
*   **Session Management:** Supports multiple chat sessions with persistent history (SQLite).

### 🧪 Trading Lab
*   **Real-time Simulation:** Trade popular stocks (Moutai, CATL, BYD) with virtual cash ($100k starting balance).
*   **Professional Dashboard:** Includes K-line charts (60/120/250 days), portfolio tracking, and trade history.
*   **Beginner Guide:** A step-by-step interactive tutorial on ownership and risk.

### 🎓 Knowledge Academy
*   **50+ Modules:** Covers everything from "Time Value of Money" to "Options Trading".
*   **Interactive Learning:** Video lessons, key takeaways, and outcomes.
*   **Learning Roadmap:** Visual d3.js roadmap to track progress (Foundation → Advanced → Professional).

## 🛠️ Tech Stack

*   **Backend:** Python 3.13+, Flask
*   **AI & Logic:** LangChain 1.1, LangGraph, ChromaDB (Vector Store)
*   **Data:** AkShare (Financial Data), SQLite (Persistence)
*   **Frontend:** HTML5, TailwindCSS, ECharts, D3.js

## 🏗️ Architecture

The system uses a **LangGraph** workflow to manage state and tool execution.

*   **State Management:** `AgentState` tracks conversation history and tool outputs.
*   **Persistence:** SQLite checkpoints ensure chat sessions persist across restarts.
*   **RAG Pipeline:** ChromaDB indexes financial PDFs for semantic retrieval.

![Architecture Diagram](static/images/stock_agent_arch.png)

## 🚀 Getting Started

### Prerequisites
*   Python 3.10+
*   An API Key for DeepSeek (or compatible OpenAI-format provider).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/u2invest-portfolio.git
    cd u2invest-portfolio
    ```

2.  **Create and activate a virtual environment**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment**
    Copy the example environment file and add your API keys.
    ```bash
    cp .env.example .env
    ```
    Open `.env` and set your `DEEPSEEK_API_KEY`.

5.  **Initialize Knowledge Base (Optional)**
    Place your financial PDF documents in the `knowledge/` folder. The system will automatically vectorize them on the first run.

### Running the Application

Start the Flask server:
```bash
python web_app.py
```

Visit `http://localhost:5000` in your browser.

## 📂 Project Structure

*   `web_app.py`: Main Flask application entry point & API routes.
*   `agent_graph.py`: LangGraph definition for the AI agent's logic.
*   `tools.py`: Custom tools for stock data (AkShare) and RAG.
*   `vector_store.py`: Logic for parsing PDFs and building the ChromaDB index.
*   `templates/`: HTML frontend files.
*   `static/`: CSS, Images, and JS assets.

## 💼 Portfolio & License

**Copyright © 2026 U2INVEST. All Rights Reserved.**

This project is a **Portfolio Showcase** designed to demonstrate full-stack engineering, AI agent architecture, and financial data analysis capabilities.

*   **For Recruiters:** You are welcome to review the code structure, architecture patterns, and implementation details.
*   **For Others:** This code is proprietary. Copying, distributing, or using this codebase for commercial purposes is strictly prohibited without explicit permission.
