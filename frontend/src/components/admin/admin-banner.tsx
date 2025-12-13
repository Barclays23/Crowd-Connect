import React from 'react';



interface AdminBannerProps {
    title: string;
    description: string;
    className?: string;
}

const AdminBanner: React.FC<AdminBannerProps> = ({ title, description, className }) => {

    return (
        <div className={`${className} bg-gradient-primary rounded-2xl p-8 text-white`}>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-lg opacity-90">
                {description}
            </p>
        </div>
    );
};

export default AdminBanner;