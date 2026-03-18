
const isDev = import.meta.env.DEV;  // no need manually set the DEV in .env (Vite sets this to true when running 'npm run dev')



if (isDev) console.log("🛠️ Frontend is in Dev Mode");
else console.log("🛠️ Frontend is NOT in Dev Mode");




export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log("%c[INFO]", "color: #007acc; font-weight: bold;", ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn("%c[WARN]", "color: #fbbf24; font-weight: bold;", ...args);
  },
  error: (...args: unknown[]) => {
    // Errors stay visible in production for troubleshooting!
    console.error("%c[ERROR]", "color: #f43f5e; font-weight: bold;", ...args);
  },
};





// USAGE IN FRONTEND FILES (INSTEAD OF CONSOLE LOGS) ✅ ✅ ✅ ✅ 

// export const loginUser = async (credentials: any) => {
//   logger.info("Attempting login for:", credentials.email); // ✅ Using info
  
//   try {
//     const response = await api.post('/auth/login', credentials);
//     logger.info("Login successful!", response.data);
//     return response.data;
//   } catch (error) {
//     logger.error("Login API Error:", error); // ✅ Using error (shows in Prod too)
//     throw error;
//   }
// };