# Tree-View Pro: Full-Stack Organizational Visualizer

Tree-View Pro is a modern, interactive tree-structure renderer designed for visualizing and managing hierarchical data (such as company org charts). It features a sleek dark-themed interface built with React and a robust persistence layer powered by Python/Flask.

## 🚀 Features

- **Dynamic Layout Engine**: Uses the Dagre algorithm to automatically position nodes without overlap, ensuring parents are perfectly centered above their children.
- **Interactive CRUD**:
  - **Add Child**: Click the `+` icon on any node to add a subordinate.
  - **Edit Details**: Update names and roles via a clean modal interface.
  - **Delete Node**: Remove a person and their entire reporting structure with one click.
- **Dynamic Re-parenting**: Drag connections (edges) between nodes to re-organize the hierarchy in real-time.
- **Persistent Storage**: All changes are saved to a Flask backend and stored in a JSON database on the server.
- **Subtree Management**: Expand and collapse branches to manage visual clutter.
- **Premium Aesthetics**: Dark mode, glassmorphism effects, and custom-styled React Flow controls.

## 🛠️ Tech Stack

- **Frontend**: React, React Flow (Visualization), Dagre (Layout Logic), Lucide-React (Icons), Vite (Build Tool).
- **Backend**: Python, Flask, Flask-CORS.
- **Storage**: JSON-based flat-file persistence.

## 📥 Prerequisites

- **Node.js** (v18+)
- **Python** (v3.8+)
- **pip** (Python package manager)

## ⚙️ Setup Instructions

### 1. Backend Setup (Python/Flask)

Open a terminal and navigate to the backend directory:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will start on `http://localhost:5000`.

### 2. Frontend Setup (React/Vite)

Open a **second** terminal and navigate to the frontend directory:

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (or `5174`).
