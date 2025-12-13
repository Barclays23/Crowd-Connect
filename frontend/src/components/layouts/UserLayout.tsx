import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";


const UserLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
