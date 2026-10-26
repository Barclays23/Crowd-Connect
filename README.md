# CrowdConnect: Public Event Hosting & Booking Platform

## 📖 Description
A comprehensive full-stack application for hosting public events, managing bookings, and enabling live community interactions. Features include RAG-based AI FAQs, QR code scanning, WebRTC video streaming, and live notifications.

## 🚀 Features
- **Video Calling:** Integrated WebRTC with LiveKit for seamless live event hosting.
- **AI Integration:** RAG-based FAQ chat and AI event poster generation.
- **Real-Time Notifications:** Live updates via Socket.io.
- **Payments:** Secure ticket booking with Razorpay and webhook handling.
- **Background Jobs:** Managed queues using Redis and BullMQ.

## 💻 Technologies Used
- **Frontend:** React, TypeScript, Tailwind CSS, HTML
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT, Google OAuth
- **DevOps:** Docker, AWS, CI/CD (GitHub Actions), Doppler

## 🛠️ Setup Instructions
1. Clone the repository: `git clone https://github.com/Barclays23/Crowd-Connect.git`
2. Install dependencies: `npm install`
3. Configure environment variables (add `.env.example` file for reference).
4. Start the development server: `npm run dev`