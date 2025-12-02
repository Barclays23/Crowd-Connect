import { User } from "lucide-react";


const UserAvatar = ({ name }: { name?: string }) => {
   const fallback = name
      ? name
           .split(" ")
           .map((n) => n[0])
           .join("")
           .toUpperCase()
           .slice(0, 2)
      : null;

   return (
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--brand-primary)] text-white text-sm font-semibold">
         {fallback ? (
            fallback
         ) : (
            <User className="w-5 h-5" />
         )}
      </div>
   );
};

export default UserAvatar;
