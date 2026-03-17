# 🛒 Local Store POS

## 📖 Introduction

**Local Store POS** is a web-based sales management system designed to help small businesses manage daily operations efficiently, including invoices, inventory, payments, and returns.

The system supports **real-time updates**, **multi-order payments**, and integrates **QR bank payment (VietQR / Sepay)** to provide a modern checkout experience.

---

## 🚀 Key Features

* 🧾 Invoice management (create, update, checkout)
* 📦 Product & inventory management (real-time stock updates)
* 🔄 Return & refund handling
* 💳 Multiple payment methods (cash, bank transfer)
* 📱 QR Code payment integration (VietQR / Sepay)
* ⚡ Real-time payment status (SSE / WebSocket)
* 🎯 Loyalty points & voucher system
* 📊 Basic dashboard & reporting

---

## 🛠️ Tech Stack

### Frontend

* ReactJS
* Axios
* Bootstrap / TailwindCSS

### Backend

* Node.js (ExpressJS)

### Database

* SQL Server

---

## 🧠 Architecture

The project follows a structured architecture similar to MVC:

* **Controller**: Handle HTTP requests & responses
* **Service**: Business logic processing
* **DTO**: Data transfer between layers
* **View**: Frontend UI (React)

---

## 📂 Project Structure

```
project-root/
│── frontend/        # React application
│── backend/         # Express API
│── database/        # SQL scripts
```

---

## ⚙️ Installation & Setup

### 1. Clone project

```bash
git clone https://github.com/hoangnm17/localstore-pos.git
cd localstore-pos
```

### 2. Setup Backend

```bash
cd backend
npm install
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔗 Demo

* 🌐 Live Demo: (update if deployed)
* 📂 GitHub: https://github.com/hoangnm17/localstore-pos

---


## 📌 Notes

* The latest development is in the `dev` branch.
* Please switch branch to view the newest features if they are not available in `main`.
