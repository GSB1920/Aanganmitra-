"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Main from "./Main";

export default function AppShell({ children, userPresent, isAdmin }: { children: React.ReactNode; userPresent: boolean; isAdmin: boolean; }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar collapsed={collapsed} isAdmin={isAdmin} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex-1">
        <Header userPresent={userPresent} isAdmin={isAdmin} onToggleSidebar={() => setCollapsed((c) => !c)} />
        <Main collapsed={collapsed}>{children}</Main>
      </div>
    </div>
  );
}
