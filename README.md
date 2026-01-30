# 🚀 NexusAI - Next-Gen Intelligent Assistant

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![AI Model](https://img.shields.io/badge/Model-Llama3.2-orange)
![Stack](https://img.shields.io/badge/Stack-FullStack-blueviolet)

**NexusAI** is a modern, containerized **Full-Stack AI Assistant** capable of **Hybrid Search**. It seamlessly combines **Long-Term Memory (RAG)** with **Real-Time Web Access** to provide accurate, context-aware, and up-to-date responses.

Built with a microservices-inspired architecture, it orchestrates communication between a Java Backend, a Python AI Engine, and a React Frontend.

---

## 🏗️ Architecture & Tech Stack

The project is structured into distinct, containerized services:

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (Vite + TypeScript) | Modern, responsive chat interface. |
| **Orchestrator** | Java (Spring Boot) | Acts as the API Gateway and handles business logic. |
| **AI Engine** | Python (FastAPI + LangChain) | The "Brain". Manages RAG pipeline and Web Search. |
| **LLM** | Ollama (Llama 3.2) | Locally hosted Large Language Model. |
| **Memory** | Qdrant (Vector DB) | Stores documents for semantic search (RAG). |
| **Web Search** | Tavily API | AI-optimized search engine for real-time data. |
| **Database** | PostgreSQL | Relational DB for user and chat history management. |
| **DevOps** | Docker & Docker Compose | Containerization and orchestration of all services. |

---

## 🔥 Key Features

* **⚡ Smart Pipeline Architecture:** Replaced slow "Agent Loops" with a direct, optimized execution pipeline. Responses are generated in seconds, not minutes.
* **🌍 Hybrid Search:** Simultaneously queries the **Vector Database (Memory)** and the **Internet (Tavily)** to synthesize the best possible answer.
* **🧠 Context & Time Awareness:** The model is aware of the current date and time, allowing it to interpret temporal queries correctly (e.g., "What is the stock price *today*?").
* **🚀 Docker Optimization:** Python builds are optimized using `Layer Caching` and `CPU-Only Torch`, reducing build times by **90%**.
* **💬 Modern UI:** A clean, dark-themed chat interface built with React and Tailwind/CSS.

---

## 🛠️ Installation & Setup

Follow these steps to run NexusAI locally.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop) installed.
* [Ollama](https://ollama.com/) installed and running (`ollama run llama3.2`).
* A [Tavily API Key](https://tavily.com/) (Free).

### 1. Clone the Repository
```bash
git clone [https://github.com/BKaanKesmez/Nexus-Ai-Engine.git](https://github.com/BKaanKesmez/Nexus-Ai-Engine.git)
cd NexusAI

2. Configure Environment Variables
Open docker-compose.yml and update the TAVILY_API_KEY under the ai-engine service:

YAML
services:
  ai-engine:
    environment:
      - TAVILY_API_KEY=tvly-YourSecretKeyHere

3. Build and Run
Launch the entire system with a single command:

Bash
docker-compose up --build
(The first build might take a few minutes. Subsequent starts will be instant due to caching.)

🖥️ Usage
Once the containers are up, access the services via:

Frontend (User Interface): http://localhost:5173

Java Backend API: http://localhost:9090

AI Engine Docs (Swagger): http://localhost:8000/docs

Qdrant Dashboard: http://localhost:6333/dashboard

📂 Project Structure
NexusAI/
├── frontend/           # React App (Vite + TS)
├── platform/           # Java Spring Boot Backend (Orchestrator)
├── python-engine/      # Python AI Service (FastAPI)
│   ├── api.py          # Main Pipeline & Endpoints
│   ├── qdrant_db/      # Persistent Vector Storage
│   ├── requirements.txt
│   └── Dockerfile      # Optimized Production Image
├── docker-compose.yml  # Orchestration Config
└── README.md           # Documentation
🔮 Roadmap
[x] Smart Pipeline Optimization (Completed)

[x] Web Search Integration (Completed)

[x] React Frontend Migration (Completed)

[x] Text-to-SQL Capability (Querying structured DBs via natural language)

[ ] Email Automation Tool

[ ] CI/CD Pipeline (GitHub Actions)

👨‍💻 Author
Buğra Kaan Software Engineering Student @ Sakarya University 
      