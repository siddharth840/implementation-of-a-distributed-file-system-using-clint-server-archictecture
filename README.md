# implementation-of-a-distributed-file-system-using-clint-server-archictecture
# NimbusFS - Distributed File System Dashboard

NimbusFS is a modern, high-performance distributed file system dashboard designed for seamless file management, real-time monitoring, and robust data replication.

![NimbusFS Screenshot](screen.png)

## 🚀 Features
- **Distributed Storage**: Simulates a multi-node storage environment.
- **Data Replication**: Automatically replicates files across multiple nodes to ensure data availability and fault tolerance.
- **File Locking**: Built-in concurrency control with file locking and unlocking mechanisms.
- **Real-time Dashboard**: Monitor system health, storage usage, active clients, and recent activities in real-time.
- **User Activity Logs**: Detailed tracking of all file operations (Upload, Download, Lock, Unlock, Delete).
- **Responsive UI**: A sleek, dark-themed dashboard built with React and Tailwind CSS.
- 
## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [SQLite](https://sqlite.org/) with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **Server**: [Uvicorn](https://www.uvicorn.org/)

### Frontend
- **Framework**: [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📥 Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm
- Docker (optional)

### Quick Start (Windows)
The easiest way to get started is to use the included batch script:
1. Clone the repository.
2. Run `run.bat` from the project root.
3. The dashboard will automatically open at `http://localhost:3000`.

### Manual Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs on [http://localhost:8000](http://localhost:8000).

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on [http://localhost:5173](http://localhost:5173).

### Running with Docker
```bash
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)

## 📂 Project Structure

- `/backend`: FastAPI application, database logic, and file storage simulation.
- `/frontend`: React dashboard application.
- `/docker-compose.yml`: Container orchestration for easy deployment.
- `run.bat`: One-click launcher for Windows environments.

## 🛡️ Verification
Each component features a `verify.py` script to ensure data integrity and system consistency. Check the dashboard logs for real-time validation status.

---
Built with ❤️ for Distributed Systems enthusiasts.
