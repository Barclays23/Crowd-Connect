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
