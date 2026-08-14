// frontend/src/components/layout/UserLayout.tsx
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FAQChatbot } from "@/components/chat/FAQChatbot";


const UserLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <FAQChatbot/>
      <Footer />
    </div>
  );
};

export default UserLayout;
