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
=======
# About CrowdConnect
CrowdConnect is a comprehensive full-stack web application designed for creating, discovering, and attending both online and offline events. The platform serves as an end-to-end solution where hosts can manage events, set ticket prices, and track attendance, while attendees can easily search for events based on location, book tickets, and manage their wallets.
# Core Features:
> # Advanced Ticketing & Entry:
Utilizes a secure QR code system with signed JWT tokens validated live against event time windows, supporting partial group entry for offline events.
> # Native Online Video Streaming: 
Integrates in-app WebRTC video conferencing for online events, powered by LiveKit's SFU architecture with role-based token gating.   
> # AI Integrations: 
Features "Generate First, Submit Later" AI poster generation for event hosts and an FAQ chatbot using Retrieval Augment Generation (RAG).   
> # Robust Financial System: 
End-to-end Razorpay integration supporting split payments, automated tiered refunds, major-change grace periods, and internal user/host wallets.   
> # Real-Time Capabilities: 
Implements multi-channel notifications (Twilio SMS/WhatsApp, Firebase Push, Email) and live socket connections for real-time attendance tracking.   
# Architecture & Engineering Standards:
The backend is strictly built upon a four-layer Clean Architecture (Routes → Controller → Service → Repository) to ensure high maintainability. It heavily utilizes TypeScript for data flow contracts (DTOs) and strictly adheres to SOLID design principles, including the Repository Pattern for decoupled database operations
