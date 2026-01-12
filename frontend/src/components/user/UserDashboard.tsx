import React from 'react';



const UserDashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[--heading-primary]">Dashboard</h2>
      <p className="text-[--text-secondary]">
        Overview of your activity, statistics, and quick actions will appear here.
      </p>
      {/* Cards, stats, recent activity, etc. will come later */}
    </div>
  );
};

export default UserDashboard;