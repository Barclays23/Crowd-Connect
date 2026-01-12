import React from 'react';




const UserProfile = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-(--heading-primary)">My Profile</h2>

      <div className="grid gap-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-(--text-secondary) mb-1">
            Full Name
          </label>
          <div className="px-4 py-3 rounded-lg bg-(--bg-secondary) text-(--text-primary) border border-(--card-border)">
            John Doe
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-(--text-secondary) mb-1">
            Email Address
          </label>
          <div className="px-4 py-3 rounded-lg bg-(--bg-secondary) text-(--text-primary) border border-(--card-border)">
            john.doe@example.com
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-(--text-secondary) mb-1">
            Mobile Number
          </label>
          <div className="px-4 py-3 rounded-lg bg-(--bg-secondary) text-(--text-primary) border border-(--card-border)">
            +91 98765 43210
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button className="px-6 py-2.5 bg-(--brand-primary) text-(--btn-primary-text) rounded-lg hover:bg-(--brand-primary-hover) transition-colors">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfile;