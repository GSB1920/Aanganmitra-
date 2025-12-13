// app/properties/add/page.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function validateStep(currentStep: number) {
    const fd = formRef.current ? new FormData(formRef.current) : undefined;
    if (!fd) return "Form not ready";
    if (currentStep === 1) {
      const title = String(fd.get("title") || "").trim();
      const city = String(fd.get("city") || "").trim();
      if (!title || !city) return "Please fill required fields: Title and City.";
      return "";
    }
    if (currentStep === 2) {
      const zoning = String(fd.get("zoning") || "").trim();
      const type = String(fd.get("property_type") || "").trim();
      if (!zoning || !type) return "Please select Zoning and Property Type.";
      return "";
    }
    if (currentStep === 3) {
      const price = String(fd.get("asking_price") || "").trim();
      if (!price || isNaN(Number(price))) return "Please provide a valid Asking Price.";
      return "";
    }
    return "";
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert("Property added successfully!");
        router.push('/properties');
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      setMessage("Failed to add property");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Add New Property</h1>
        
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              <span className="text-sm mt-2 text-black">
                {stepNum === 1 && 'Basic Info'}
                {stepNum === 2 && 'Details'}
                {stepNum === 3 && 'Owner Info'}
              </span>
            </div>
          ))}
        </div>

        <form action={handleSubmit} ref={formRef}>
          {/* Step 1: Basic Information */}
          <div className={step === 1 ? "space-y-4" : "space-y-4 hidden"}>
              <h2 className="text-lg font-semibold mb-4 text-black">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title *
                </label>
                <input
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="e.g., Commercial Plot in City Center"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    name="city"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    name="area"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Andheri West"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <textarea
                  name="address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Complete property address"
                />
              </div>
          </div>

          {/* Step 2: Property Details */}
          <div className={step === 2 ? "space-y-4" : "space-y-4 hidden"}>
              <h2 className="text-lg font-semibold mb-4 text-black">Property Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-black">
                    Zoning Type *
                  </label>
                  <select
                    name="zoning"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">Select Zoning</option>
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="agriculture">Agriculture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    name="property_type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">Select Type</option>
                    <option value="land">Land</option>
                    <option value="house">House</option>
                    <option value="shop">Shop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area (sq. ft.)
                  </label>
                  <input
                    name="area_sqft"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate per sq. ft.
                  </label>
                  <input
                    name="rate_per_sqft"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rera"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  RERA Registered
                </label>
              </div>
          </div>

          {/* Step 3: Owner & Pricing */}
          <div className={step === 3 ? "space-y-4" : "space-y-4 hidden"}>
              <h2 className="text-lg font-semibold mb-4 text-black">Owner & Pricing</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-black">
                    Owner Name
                  </label>
                  <input
                    name="owner_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Phone
                  </label>
                  <input
                    name="owner_phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Address
                </label>
                <textarea
                  name="owner_address"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Owner's contact address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asking Price (₹) *
                  </label>
                  <input
                    name="asking_price"
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="7500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Final Price (₹)
                  </label>
                  <input
                    name="final_price"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="7000000"
                  />
                </div>
              </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  const err = validateStep(step);
                  if (err) {
                    setMessage(err);
                  } else {
                    setMessage("");
                    setStep(step + 1);
                  }
                }}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Adding Property...' : 'Add Property'}
              </button>
            )}
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
