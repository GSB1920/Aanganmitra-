// app/page.tsx
import Link from 'next/link';

export default async function HomePage() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Aangan Mitra
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Property Management System
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">Manage properties efficiently once logged in.</p>
            <p className="text-sm text-gray-400 mt-2">Create an account to get started.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
