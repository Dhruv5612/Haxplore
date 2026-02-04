# HaxExplore - Field Activity Tracking System

HaxExplore is a specialized field management platform designed to streamline tracking and reporting for field workers operating in rural or remote areas. It provides a robust solution for attendance logging, meeting management, and sales tracking with built-in offline synchronization and GPS verification.

## 🚀 Problem Statement

Field operations often suffer from a "visibility gap" where management lacks real-time or verified data on field activities. Common challenges include:
- **Connectivity Issues**: Rural areas often have poor internet, making standard cloud apps unreliable.
- **Verification**: Ensuring that reported meetings and sales actually happened at the specified locations.
- **Data Fragmentation**: Manual logs are difficult to aggregate and analyze for performance insights.

HaxExplore solves this by providing an **offline-first** mobile-web experience that captures GPS coordinates and photographic evidence, syncing data automatically when a connection is restored.

## 🛠️ Tech Stack

### Frontend
- **React 19 (Vite)**: Modern, high-performance UI framework.
- **React Router 7**: For seamless client-side navigation.
- **Recharts**: Interactive data visualization for activity summaries.
- **idb (IndexedDB)**: Core for offline-first capabilities, allowing data storage during disconnected periods.
- **Axios**: Promised-based HTTP client for API communication.

### Backend
- **Node.js & Express 5**: Scalable server-side environment.
- **MongoDB & Mongoose**: Flexible NoSQL database for structured activity logs.
- **JWT (JSON Web Tokens)**: Secure, stateless authentication.
- **bcryptjs**: Industry-standard password hashing.
- **Multer**: Handling multi-part form data for photo uploads.

## 🏃 How to Run the Project

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or an Atlas connection string)

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
Run the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## ✨ Key Features
- **Start/End Day**: GPS-verified attendance logging with total distance calculation.
- **Meeting Logs**: Capture attendee details, village location, and up to 5 verification photos.
- **Sample Distribution**: Track product samples given to potential clients.
- **Sales Tracking**: Log product sales directly from the field.
- **Admin Dashboard**: Comprehensive overview of user performance and field metrics.
- **Offline Sync**: Automatic data synchronization once connectivity is detected.
