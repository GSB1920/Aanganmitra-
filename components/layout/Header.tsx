"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, User, LogOut, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  userPresent: boolean;
  isAdmin: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ userPresent, isAdmin, onToggleSidebar }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Generate breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href,
      isLast: index === pathSegments.length - 1
    };
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b h-16 transition-all">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          {userPresent && (
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md" 
              onClick={onToggleSidebar}
            >
              <Menu size={20} />
            </button>
          )}
          
          <Link href="/" className={cn("flex items-center gap-2", userPresent && "md:hidden")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
              Aangan<span className="text-primary">Mitra</span>
            </span>
          </Link>

          {/* Breadcrumbs & Search - Desktop Only */}
          {userPresent && (
            <div className="hidden md:flex items-center gap-6 flex-1 max-w-xl ml-4">
               {/* Breadcrumbs */}
              <nav className="flex items-center text-sm text-gray-500">
                <Link href="/properties" className="hover:text-gray-900 transition-colors">
                  Home
                </Link>
                {breadcrumbs.map((crumb) => (
                  <div key={crumb.href} className="flex items-center">
                    <ChevronRight size={14} className="mx-1 text-gray-400" />
                    <Link 
                      href={crumb.href}
                      className={cn(
                        "hover:text-gray-900 transition-colors capitalize",
                        crumb.isLast && "font-medium text-gray-900 pointer-events-none"
                      )}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Search Bar */}
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search properties, users..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!userPresent ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition hover:bg-primary/10 text-gray-600"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 md:gap-4">
              {isAdmin && (
                <Link 
                  href="/pending-users" 
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  Pending Approvals
                </Link>
              )}

              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-50 rounded-full border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-4 py-2 border-b mb-1">
                      <p className="text-sm font-medium text-gray-900">My Account</p>
                      <p className="text-xs text-gray-500 truncate">Manage your profile</p>
                    </div>
                    
                    {isAdmin && (
                      <Link 
                        href="/pending-users" 
                        className="flex md:hidden items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Pending Users
                      </Link>
                    )}

                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>

                    <div className="border-t my-1"></div>

                    <Link 
                      href="/logout" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log out
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
