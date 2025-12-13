"use client";

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-4">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <div className="text-sm text-gray-700">{children}</div>
        <div className="mt-4 text-right">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
