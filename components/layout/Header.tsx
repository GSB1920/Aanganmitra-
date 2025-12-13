"use client";

import { useState } from "react";
import LoadingButton from "@/components/ui/loading-button";

type Props = {
  userPresent: boolean;
  isAdmin: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ userPresent, isAdmin, onToggleSidebar }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <button className="md:hidden px-2 py-1 border rounded" onClick={onToggleSidebar}>☰</button>
          <a href="/" className="text-xl font-bold text-blue-600">Aangan Mitra</a>
        </div>
        <div className="flex items-center gap-3">
          {!userPresent && (
            <>
              <LoadingButton href="/login" variant="ghost">Login</LoadingButton>
              <LoadingButton href="/signup" variant="primary">Sign Up</LoadingButton>
            </>
          )}
          {userPresent && (
            <div className="relative">
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <LoadingButton href="/pending-users" variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">Pending Users</LoadingButton>
                )}
                <button onClick={() => setProfileOpen((o) => !o)} className="inline-flex items-center justify-center rounded px-3 py-2 text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Profile ▾
                </button>
              </div>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
                  <div className="p-2">
                    <LoadingButton href="/profile" variant="secondary" className="w-full justify-start">View Profile</LoadingButton>
                  </div>
                  <div className="px-2 pb-2">
                    <LoadingButton href="/logout" variant="danger" className="w-full justify-start">Logout</LoadingButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
