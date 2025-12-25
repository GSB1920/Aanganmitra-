// app/page.tsx
import Link from 'next/link';
import { Building2, CheckCircle2, Shield, Zap, ArrowRight, LayoutDashboard, Users, BarChart3, Search, Key, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default async function HomePage() {

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1600596542815-2495db98cbb4?q=80&w=2574&auto=format&fit=crop"
            alt="Modern luxury home"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white mb-8 backdrop-blur-md animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></span>
              The Future of Property Management
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 drop-shadow-lg">
              Find Your <br/> <span className="text-primary relative inline-block">
                Dream Home
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl leading-relaxed font-light drop-shadow-md">
              Streamline your property operations, enhance tenant relationships, and maximize returns with Aangan Mitra's comprehensive management solution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
              <Link 
                href="/signup" 
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-secondary transition-all duration-300 bg-primary rounded-xl hover:bg-primary/90 hover:scale-105 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40 shadow-sm backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>

            {/* Quick Stats/Trust Indicators */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-white/10 pt-8 w-full max-w-4xl">
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">1k+</p>
                <p className="text-sm text-gray-300 uppercase tracking-wider">Properties</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">500+</p>
                <p className="text-sm text-gray-300 uppercase tracking-wider">Owners</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">98%</p>
                <p className="text-sm text-gray-300 uppercase tracking-wider">Satisfaction</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">24/7</p>
                <p className="text-sm text-gray-300 uppercase tracking-wider">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Feature Section - "Our Expertise" */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
               <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                 <Image 
                   src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
                   alt="Modern home exterior"
                   width={800}
                   height={600}
                   className="w-full h-auto object-cover"
                 />
                 {/* Floating Card */}
                 <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-xs border border-gray-100 hidden md:block">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-green-100 rounded-full text-green-600">
                       <CheckCircle2 className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="font-bold text-gray-900">Verified Listing</p>
                       <p className="text-xs text-gray-500">Inspected & Approved</p>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                     <div className="h-2 bg-gray-100 rounded-full w-3/4"></div>
                   </div>
                 </div>
               </div>
               {/* Decorative Element */}
               <div className="absolute -z-10 top-12 -right-12 w-full h-full border-2 border-primary/20 rounded-3xl hidden lg:block"></div>
            </div>
            
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Key className="w-4 h-4 mr-2" />
                Why Choose Us
              </div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                We Help You Manage Your <br/>
                <span className="text-primary">Real Estate Assets</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're a property owner, real estate agent, or tenant, our platform provides the tools you need to succeed. From listing management to secure payments, we've got you covered.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Smart Property Tracking", desc: "Real-time updates on all your property statuses." },
                  { title: "Seamless Communication", desc: "Direct channel between owners and tenants." },
                  { title: "Automated Workflows", desc: "Save time with automated rent reminders and more." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/properties" className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors mt-4">
                Explore Properties <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to manage properties</h2>
            <p className="text-lg text-gray-600">Powerful tools designed for modern property managers and owners.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: LayoutDashboard,
                title: "Centralized Dashboard",
                description: "Get a bird's eye view of all your properties, tenants, and financial metrics in one place."
              },
              {
                icon: Users,
                title: "Tenant Management",
                description: "Streamline tenant onboarding, communication, and request handling effortlessly."
              },
              {
                icon: BarChart3,
                title: "Financial Analytics",
                description: "Track revenue, expenses, and growth with detailed reports and visualizations."
              },
              {
                icon: Shield,
                title: "Secure Data",
                description: "Enterprise-grade security ensures your sensitive property data remains protected."
              },
              {
                icon: Zap,
                title: "Automation",
                description: "Automate recurring tasks like rent reminders and maintenance schedules."
              },
              {
                icon: CheckCircle2,
                title: "Compliance Ready",
                description: "Stay compliant with local property laws and regulations with built-in tools."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Social Media Section - Instagram Feed */}
      <div className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600 mb-6">
              <Instagram className="w-4 h-4 mr-2" />
              Follow us on Instagram
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-lg text-gray-600">
              Stay updated with the latest property trends, tips, and featured listings on our Instagram.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
            {[
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop"
            ].map((src, i) => (
              <a 
                key={i} 
                href="https://www.instagram.com/aangan_mitra/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              >
                <Image 
                  src={src} 
                  alt={`Instagram post ${i+1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" />
                </div>
              </a>
            ))}
          </div>
          
          <div className="text-center">
            <a 
              href="https://www.instagram.com/aangan_mitra/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-pink-500/25 transition-all hover:scale-105"
            >
              <Instagram className="w-5 h-5 mr-2" />
              @aangan_mitra
            </a>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-secondary rounded-3xl p-12 relative overflow-hidden text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to transform your property management?</h2>
              <p className="text-xl text-gray-300 mb-10">Join thousands of property owners who trust Aangan Mitra for their real estate needs.</p>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-secondary bg-primary rounded-xl hover:bg-primary/90 hover:scale-105 shadow-xl transition-all"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
