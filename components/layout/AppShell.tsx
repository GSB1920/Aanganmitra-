"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Main from "./Main";

export default function AppShell({ children, userPresent, isAdmin }: { children: React.ReactNode; userPresent: boolean; isAdmin: boolean; }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {userPresent && (
        <Sidebar 
          collapsed={collapsed} 
          mobileOpen={mobileOpen}
          isAdmin={isAdmin} 
          onToggle={() => setCollapsed((c) => !c)}
          onMobileClose={() => setMobileOpen(false)}
        />
      )}
      <div className="flex-1 w-full">
        <Header 
          userPresent={userPresent} 
          isAdmin={isAdmin} 
          onToggleSidebar={() => setMobileOpen((c) => !c)} 
        />
        <Main>{children}</Main>
      </div>
    </div>
  );
}
