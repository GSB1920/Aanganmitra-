"use client";

type Props = {
  collapsed: boolean;
  isAdmin: boolean;
  onToggle: () => void;
};

export default function Sidebar({ collapsed, isAdmin, onToggle }: Props) {
  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} bg-white border-r transition-all duration-200 hidden md:block`}>
      <div className="h-16 flex items-center justify-center border-b">
        <button className="px-2 py-1 text-gray-700" onClick={onToggle}>☰</button>
      </div>
      <nav className="p-3 space-y-2">
        <a href="/properties" className="block px-3 py-2 rounded hover:bg-gray-100">Properties</a>
        <a href="/profile" className="block px-3 py-2 rounded hover:bg-gray-100">Profile</a>
        {isAdmin && <a href="/pending-users" className="block px-3 py-2 rounded hover:bg-gray-100">Pending Users</a>}
        <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">Reports</a>
        <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">Settings</a>
      </nav>
    </aside>
  );
}
