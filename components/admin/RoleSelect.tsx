"use client";

import { useState } from "react";
import { updateUserRole } from "@/app/action/admin/userManagement";
import { Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoleSelectProps {
  userId: string;
  currentRole: string;
}

export default function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    setRole(newRole);
    setLoading(true);
    setSuccess(false);

    const res = await updateUserRole(userId, newRole);

    if (res.error) {
      alert(res.error);
      setRole(currentRole); // Revert
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      router.refresh();
    }
    setLoading(false);
  }

  // Define valid roles for selection. 
  // Note: We exclude 'banned' here as that is handled by the Ban button.
  // We exclude 'user' and 'agent' as options to select, but if the current role is 'user'/'agent', 
  // it will be shown until changed.
  
  const options = [
    { value: "internal", label: "Internal User" },
    { value: "broker", label: "Broker Agent" },
    { value: "admin", label: "Admin" },
  ];

  // If current role is not in options (e.g. 'user', 'agent'), add it temporarily so it shows up
  const isLegacyRole = !options.find(o => o.value === role) && role !== 'banned';
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={role}
          onChange={handleChange}
          disabled={loading || role === 'banned'}
          className={`block w-full max-w-[140px] pl-2 pr-8 py-1 text-xs border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary appearance-none
            ${loading ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-700'}
            ${role === 'admin' ? 'border-purple-200 bg-purple-50 text-purple-900' : 
              role === 'internal' ? 'border-blue-200 bg-blue-50 text-blue-900' :
              role === 'broker' ? 'border-green-200 bg-green-50 text-green-900' :
              'border-gray-200'}
          `}
        >
          {isLegacyRole && <option value={role}>{role} (Legacy)</option>}
          {role === 'banned' && <option value="banned">Banned</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
          </div>
        )}
        {success && !loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Check className="w-3 h-3 text-green-600" />
          </div>
        )}
      </div>
    </div>
  );
}
