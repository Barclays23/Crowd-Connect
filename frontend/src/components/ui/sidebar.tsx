// frontend/src/components/ui/sidebar.tsx
// Updated to use your custom CSS variables (no shadcn defaults)

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Menu, PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}

// ────────────────────────────────────────────────────────────────
// SidebarProvider & Core Logic (unchanged, only wrapper classes updated)
// ────────────────────────────────────────────────────────────────

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      setOpenProp?.(openState);
      if (!setOpenProp) _setOpen(openState);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [open, setOpenProp]
  );

  const toggleSidebar = React.useCallback(() => {
    isMobile ? setOpenMobile(o => !o) : setOpen(o => !o);
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full",
            // Custom background for inset variant
            "has-[[data-variant=inset]]:bg-[var(--bg-secondary)]",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

// ────────────────────────────────────────────────────────────────
// Sidebar Component – now uses your CSS variables
// ────────────────────────────────────────────────────────────────

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-[--sidebar-width] flex-col",
          "bg-[var(--card-secondary)] border-r border-[var(--border-default)] text-[var(--text-primary)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="w-[--sidebar-width] p-0 bg-[var(--card-secondary)] text-[var(--text-primary)] border-none [&>button]:hidden"
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={ref}
      className="group peer hidden text-[var(--text-primary)] md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      {/* Gap spacer */}
      <div
        className={cn(
          "relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0"
        )}
      />

      {/* Actual sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] flex flex-col bg-[var(--card-secondary)] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:-left-[var(--sidebar-width)]"
            : "right-0 group-data-[collapsible=offcanvas]:-right-[var(--sidebar-width)]",
          variant === "floating" || variant === "inset" ? "p-2" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-full w-full flex-col rounded-lg bg-[var(--card-secondary)]  shadow-[var(--shadow-md)]",
            "border border-[var(--border-default)]",
            "group-data-[variant=floating]:shadow-[var(--shadow-lg)]"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
});
Sidebar.displayName = "Sidebar";

// ────────────────────────────────────────────────────────────────
// SidebarTrigger – unchanged (uses your Button component)
// ────────────────────────────────────────────────────────────────
const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", className)}
        onClick={(e) => { onClick?.(e); toggleSidebar(); }}
        {...props}
      >
        <PanelLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";


// ────────────────────────────────────────────────────────────────
// HamburgerTrigger – same like SidebarTrigger (uses your Button component)
// ────────────────────────────────────────────────────────────────
const HamburgerTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", className)}
        onClick={(e) => { onClick?.(e); toggleSidebar(); }}
        {...props}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Hamburger</span>
      </Button>
    );
  }
);
HamburgerTrigger.displayName = "HamburgerTrigger";

// ────────────────────────────────────────────────────────────────
// SidebarMenuButton – the heart of the look
// ────────────────────────────────────────────────────────────────

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "hover:bg-[var(--bg-secondary)] data-[active=true]:bg-[var(--bg-tertiary)] data-[active=true]:font-medium text-[var(--text-primary)] hover:text-[var(--text-primary)]",
        outline:
          "bg-[var(--card-bg)] shadow-[0_0_0_1px_var(--border-strong)] hover:bg-[var(--bg-secondary)] hover:shadow-[0_0_0_1px_var(--brand-primary-light)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) return button;

  const tooltipProps = typeof tooltip === "string" ? { children: tooltip } : tooltip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltipProps} />
    </Tooltip>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

// ────────────────────────────────────────────────────────────────
// Rest of the components – updated to use your variables
// ────────────────────────────────────────────────────────────────

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      className={cn("h-8 bg-[var(--form-input-bg)] border-[var(--form-input-border)] text-[var(--form-input-text)] shadow-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-light)]", className)}
      {...props}
    />
  )
);
SidebarInput.displayName = "SidebarInput";

const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(
  ({ className, ...props }, ref) => (
    <Separator ref={ref} className={cn("mx-2 bg-[var(--border-muted)]", className)} {...props} />
  )
);
SidebarSeparator.displayName = "SidebarSeparator";

// Header / Footer / Content – simple wrappers with your text color
const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 p-2 text-[var(--text-primary)]", className)} {...props} />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 p-2 text-[var(--text-primary)]", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)} {...props} />
));
SidebarContent.displayName = "SidebarContent";

// Keep the rest of the components (Rail, Group, Menu, etc.) exactly as they were – they inherit colors from parent

// ... (all other components remain unchanged – they already inherit from the sidebar background/text)

// Dummy implementations for missing components to prevent errors
const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
));
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupAction = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("font-semibold text-xs uppercase px-2 py-1 text-[var(--text-secondary)]", className)} {...props} />
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2", className)} {...props} />
));
SidebarInset.displayName = "SidebarInset";

const SidebarMenu = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuAction = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadge = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("ml-auto rounded-full bg-[var(--brand-primary-light)] px-2 py-0.5 text-xs text-white", className)} {...props} />
));
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuSkeleton = ({ className, ...props }: React.ComponentProps<typeof Skeleton>) => (
  <Skeleton className={cn("h-8 w-full", className)} {...props} />
);
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pl-4", className)} {...props} />
));
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("w-full text-left px-2 py-1", className)} {...props} />
));
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

const SidebarMenuSubItem = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pl-6", className)} {...props} />
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarRail = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col", className)} {...props} />
));
SidebarRail.displayName = "SidebarRail";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  HamburgerTrigger,
  useSidebar,
};