// frontend/src/constants/app.constants.ts

const FRONTEND_BASE_URL=import.meta.env.VITE_FRONTEND_BASE_URL;
// remove this in production if using window.location.origin


// from public folder
const LOGO_PATH = '/logos/crowdconnect-logo-1.png'


export const APP_CONFIG = {
    APP_NAME: "CrowdConnect",
    LOGO_URL: 'https://img.magnific.com/free-vector/business-logo-template-minimal-branding-design-vector_53876-136229.jpg',
    // LOGO_URL: `${window.location.origin}/logos/logo.png`,
    // LOGO_URL: `${FRONTEND_BASE_URL}${LOGO_PATH}`,
    // Assuming you have a 'logo.png' inside your frontend 'public' folder.
    // In development it will be 'http://localhost:5173/logo.png'
    // In production it will be 'https://your-live-domain.com/logo.png'
} as const;




export const getAppBrandColor = (): string => {
   if (typeof window === "undefined") return "#ff6b6b"; // Fallback to Coral Red
   const color = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
   return color || "#ff6b6b";
};