# U2INVEST User Guide 📘

**Your path, Your Choice, Your Future, You to Invest.**

Welcome to the complete walkthrough of the U2INVEST platform. This guide demonstrates every feature of our comprehensive financial education and analysis system.

---

##  1. Landing Page & Navigation
Your gateway to financial literacy. The clean interface allows you to jump straight into one of our three core pillars.

![Front Page](static/screenshots/Front%20Page.png)

*   **Academy:** For structured learning.
*   **Lab:** For risk-free practice.
*   **U2CHAT:** For AI-assisted analysis.

---

##  2. Knowledge Academy
The Academy is designed to take you from novice to pro through structured coursework.

![Knowledge Academy](static/screenshots/Knowledge%20Academy.png)

### 2.1 Core Features
The main dashboard offers two views: **Course Modules** (Grid View) and **Learning Roadmap** (Tree View). You can track your progress and difficulty levels at a glance.

![Feature of Academy](static/screenshots/Feature%20of%20Academy.png)

### 2.2 Learning Roadmap (Visual Progression)
We use a D3.js interactive tree to visualize your learning path.
*   **Standard Mode:** Follow our curated path from "Foundations" (Blue) to "Advanced" (Dark Blue) to "Professional" (Purple).
    ![Learning Roadmap](static/screenshots/Learning%20Roadmap.png)

*   **Design By Yourself Mode:** Switch to "You to Design" to create your own mental map.
    ![Design By Yourself Roadmap](static/screenshots/Design%20By%20Yourself%20Roadmap.png)
    *   **Add Concepts:** Create custom nodes for topics you want to study.
        ![Add Concept](static/screenshots/Add%20Concept.png)
    *   **Link Nodes:** Connect ideas to build your own knowledge graph.
        ![Link Node](static/screenshots/Link%20Node.png)

### 2.3 Module Interface
Clicking any topic opens the learning module.
*   **Video Lessons:** High-quality content curated from top financial educators.
    ![Module Video](static/screenshots/Module%20Video.png)
*   **Community:** Discuss topics with other learners.
    ![Comments](static/screenshots/comments.png)
*   **Progress Tracking:** Mark lessons as complete to earn your badge.
    ![After Completed Module](static/screenshots/After%20Completed%20Module.png)
*   **Share:** Share your progress on social media.
    ![Share Progress](static/screenshots/Share%20Progress.png)

---

##  3. Trading Lab
Before risking real money, master the market here with **$100,000 virtual cash**.

![Lab Options](static/screenshots/Lab%20Options.png)

### 3.1 Beginner Guide (Investment 101)
New to stocks? Our interactive guide walks you through the basics before you trade.
*   **Step 1: Ownership:** Understand what a stock actually is.
    ![Step 1](static/screenshots/Step%201.png)
*   **Step 2: Risk:** Learn about diversification.
    ![Step 2](static/screenshots/Step%202.png)
*   **Step 3: Execution:** How to read the dashboard.
    ![Step 3](static/screenshots/Step%203.png)
*   **Buy/Sell Guide:** Clear instructions on placing orders.
    ![Buy and Sell Guide](static/screenshots/Buy%20and%20Sell%20Guide.png)

### 3.2 Professional Dashboard (The Lab)
For advanced users, the Lab offers a professional trading interface.
*   **Real-time Data:** Live prices for A-share stocks (Moutai, CATL, etc.).
*   **Interactive Charts:** Zoomable K-Line charts (60/120/250 days).
*   **Order Entry:** Buy and Sell instantly.
*   **Portfolio Tracking:** Monitor your Cash, Holdings, and Returns in real-time.

![Trading Lab](static/screenshots/Trading%20Lab.png)

---

##  4. U2CHAT (AI Agent)
Your 24/7 Financial Analyst, powered by **DeepSeek-V3** and **LangGraph**.

![U2Chat](static/screenshots/U2Chat.png)

### 4.1 Advanced Reasoning
Unlike basic bots, U2CHAT "thinks" before it answers. It breaks down complex queries into logical steps.
![U2Chat Think](static/screenshots/U2Chat%20Think.png)

### 4.2 Market Analysis
Ask about any stock (e.g., "Analyze Moutai"). The agent fetches real-time data and provides a professional breakdown.
![U2Chat Analysis](static/screenshots/U2Chat%20Analysis.png)

### 4.3 Data Visualization
The agent doesn't just talk; it draws. It generates interactive price charts right in the chat window.
![U2Chat Data Visualization](static/screenshots/U2Chat%20Data%20Visualization.png)

### 4.4 Strategic Suggestions
It can combine real-time data with its internal knowledge base (RAG) to offer investment strategies.
![U2Chat Suggestion](static/screenshots/U2Chat%20Suggestion.png)

---

##  Architecture
For the tech-savvy, here is how U2INVEST works under the hood:

![Architecture](static/images/stock_agent_arch.png)
