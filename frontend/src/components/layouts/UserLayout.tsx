import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
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
