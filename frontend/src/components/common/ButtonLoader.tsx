import { Loader2, Loader2Icon, LucideLoader2 } from "lucide-react";

interface ButtonLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function ButtonLoader({ loading, children, loadingText }: ButtonLoaderProps) {
    if (!loading) return <>{children}</>;

    return (
        <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {/* <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" /> */}
            <span>{loadingText || "Please wait..."}</span>
        </div>
    );
}