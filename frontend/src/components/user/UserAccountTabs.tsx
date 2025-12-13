import { useState } from "react";
import { User, LayoutDashboard, Calendar, BookOpen, Heart, Wallet } from "lucide-react";



const tabs = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "events", label: "My Events", icon: Calendar },
  { id: "bookings", label: "My Bookings", icon: BookOpen },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "wallet", label: "Wallet", icon: Wallet },
];



const UserAccountTabs = () => {
  const [activeTab, setActiveTab] = useState("profile");

   const renderContent = () => {
      switch (activeTab) {
         case "profile":
         return (
            <div className="space-y-6">
               <h2 className="text-xl font-semibold text-[var(--heading-primary)]">My Profile</h2>
               <div className="grid gap-4 max-w-md">
               <div>
                  <label className="text-sm text-[var(--text-secondary)]">Name</label>
                  <p className="mt-1 px-4 py-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]">John Doe</p>
               </div>
               <div>
                  <label className="text-sm text-[var(--text-secondary)]">Email</label>
                  <p className="mt-1 px-4 py-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]">john.doe@example.com</p>
               </div>
               <div>
                  <label className="text-sm text-[var(--text-secondary)]">Mobile</label>
                  <p className="mt-1 px-4 py-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]">+1 234 567 8900</p>
               </div>
               </div>
            </div>
         );
         case "dashboard":
         return (
            <div className="space-y-4">
               <h2 className="text-xl font-semibold text-[var(--heading-primary)]">Dashboard</h2>
               <p className="text-[var(--text-secondary)]">Your dashboard overview will appear here.</p>
            </div>
         );
         case "events":
         return (
            <div className="space-y-4">
               <h2 className="text-xl font-semibold text-[var(--heading-primary)]">My Events</h2>
               <p className="text-[var(--text-secondary)]">Your events will appear here.</p>
            </div>
         );
         case "bookings":
         return (
            <div className="space-y-4">
               <h2 className="text-xl font-semibold text-[var(--heading-primary)]">My Bookings</h2>
               <p className="text-[var(--text-secondary)]">Your bookings will appear here.</p>
            </div>
         );
         case "wishlist":
         return (
            <div className="space-y-4">
               <h2 className="text-xl font-semibold text-[var(--heading-primary)]">Wishlist</h2>
               <p className="text-[var(--text-secondary)]">Your wishlist items will appear here.</p>
            </div>
         );
         case "wallet":
         return (
            <div className="space-y-4">
               <h2 className="text-xl font-semibold text-[var(--heading-primary)]">Wallet</h2>
               <p className="text-[var(--text-secondary)]">Your wallet balance and transactions will appear here.</p>
            </div>
         );
         default:
         return null;
      }
   };

   return (
      <div className="w-full max-w-5xl mx-auto">
         {/* Tab Navigation */}
         <div className="rounded-full p-1.5 flex bg-[var(--bg-secondary)]">
         {tabs.map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
               activeTab === tab.id
                  ? "bg-[var(--brand-primary)] text-[var(--btn-primary-text)] hover:bg-[var(--brand-primary-hover)]"
                  : "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
               }`}
            >
               {tab.label}
            </button>
         ))}
         </div>

         {/* Tab Content */}
         <div className="mt-8 p-6 rounded-2xl min-h-[300px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)]">
         {renderContent()}
         </div>
      </div>
   );
};

export default UserAccountTabs;

