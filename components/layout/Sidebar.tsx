"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  User, 
  Users, 
  Settings, 
  FileText, 
  Menu,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  role: string | null;
  onToggle: () => void;
  onMobileClose: () => void;
};

export default function Sidebar({ collapsed, mobileOpen, role, onToggle, onMobileClose }: Props) {
  const pathname = usePathname();
  const isAdmin = role === "admin";
  const isInternal = role === "internal";
  const isBroker = role === "broker" || role === "user"; // 'user' is default before approval/assignment

  const navItems = [
    { label: "Properties", href: "/properties", icon: Building2 },
    ...(isAdmin ? [
      { label: "Pending Users", href: "/pending-users", icon: Users },
      { label: "All Users", href: "/users", icon: User },
      { label: "Settings", href: "/settings", icon: Settings }
    ] : []),
    // Hide Reports for Brokers
    ...(!isBroker ? [
      { label: "Reports", href: "#", icon: FileText }
    ] : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r transition-all duration-300 ease-in-out flex flex-col",
          "fixed inset-y-0 left-0 z-50 h-full shadow-xl md:shadow-none", // Mobile base styles
          "md:relative md:translate-x-0", // Desktop reset
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0", // Mobile toggle
          collapsed ? "md:w-16" : "md:w-64" // Desktop width
        )}
      >
        <div className={cn("h-16 flex items-center border-b", collapsed ? "md:justify-center justify-between px-4" : "justify-between px-4")}>
          <span className={cn("text-xl font-bold text-gray-800 truncate", collapsed && "md:hidden")}>
            Aangan<span className="text-primary">Mitra</span>
          </span>
          
          <button 
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors hidden md:block"
          >
            <Menu size={20} />
          </button>

          <button 
            onClick={onMobileClose}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && item.href !== "#";
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onMobileClose()} // Close on navigation (mobile)
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group relative",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700")} />
                
                <span className={cn("truncate", collapsed && "md:hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t text-xs text-gray-400 text-center">
          <span className={cn(collapsed && "md:hidden")}>© 2025 Aangan Mitra</span>
        </div>
      </aside>
    </>
  );
}
