// app/properties/add/page.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, Home, Info, IndianRupee, MapPin, CheckCircle2 } from "lucide-react";
import LocationPicker from "@/components/ui/location-picker";

export default function AddPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  
  // Form State
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");

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
      const listingType = String(fd.get("listing_type") || "").trim();
      if (!zoning || !type || !listingType) return "Please select Zoning, Property Type and Listing Type.";
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
        // alert("Property added successfully!"); // Removed alert for better UX
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
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details to list a new property</p>
        </div>
        
        {/* Progress Steps */}
        <div className="px-8 py-6">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />
            
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step >= stepNum 
                    ? 'bg-primary border-primary text-white shadow-md' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step > stepNum ? <CheckCircle2 className="w-6 h-6" /> : stepNum}
                </div>
                <span className={`text-xs font-medium mt-2 ${step >= stepNum ? 'text-primary' : 'text-gray-500'}`}>
                  {stepNum === 1 && 'Basic Info'}
                  {stepNum === 2 && 'Details'}
                  {stepNum === 3 && 'Owner Info'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 pb-8">
          <form action={handleSubmit} ref={formRef}>
            {/* Step 1: Basic Information */}
            <div className={step === 1 ? "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 transition-all"
                    placeholder="e.g., Commercial Plot in City Center"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        name="city"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                        placeholder="Mumbai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area / Locality
                    </label>
                    <input
                      name="area"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 resize-none"
                    placeholder="Complete property address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pin Location on Map
                  </label>
                  <input type="hidden" name="latitude" value={coords.lat || ""} />
                  <input type="hidden" name="longitude" value={coords.lng || ""} />
                  <LocationPicker
                    latitude={coords.lat}
                    longitude={coords.lng}
                    onChange={(lat, lng) => setCoords({ lat, lng })}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Click on the map to mark the exact location of the property.
                  </p>
                </div>
            </div>

            {/* Step 2: Property Details */}
            <div className={step === 2 ? "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Listing Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                        <input type="radio" name="listing_type" value="sale" defaultChecked className="w-4 h-4 text-primary focus:ring-primary" />
                        <span className="ml-2 text-gray-700">For Sale</span>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                        <input type="radio" name="listing_type" value="rental" className="w-4 h-4 text-primary focus:ring-primary" />
                        <span className="ml-2 text-gray-700">For Rent</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zoning Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="zoning"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                    >
                      <option value="">Select Zoning</option>
                      <option value="commercial">Commercial</option>
                      <option value="residential">Residential</option>
                      <option value="agriculture">Agriculture</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="property_type"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                    >
                      <option value="">Select Type</option>
                      <option value="land">Land</option>
                      <option value="house">House</option>
                      <option value="shop">Shop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (sq. ft.)
                    </label>
                    <input
                      name="area_sqft"
                      type="number"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    id="rera"
                    name="rera"
                    defaultChecked
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="rera" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                    RERA Registered Property
                  </label>
                </div>
            </div>

            {/* Step 3: Owner & Pricing */}
            <div className={step === 3 ? "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">Owner & Pricing</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name
                    </label>
                    <input
                      name="owner_name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Phone
                    </label>
                    <input
                      name="owner_phone"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 resize-none"
                    placeholder="Owner's contact address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asking Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        name="asking_price"
                        type="number"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 font-medium"
                        placeholder="7500000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Price (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        name="final_price"
                        type="number"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                        placeholder="7000000"
                      />
                    </div>
                  </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </button>
              ) : (
                <div /> /* Spacer */
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
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center font-medium shadow-sm transition-colors"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-sm transition-colors"
                >
                  {loading ? (
                    'Adding Property...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Add Property
                    </>
                  )}
                </button>
              )}
            </div>

            {message && (
              <div className={`mt-6 p-4 rounded-lg flex items-center ${
                message.includes('success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                <Info className={`w-5 h-5 mr-2 flex-shrink-0 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`} />
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
