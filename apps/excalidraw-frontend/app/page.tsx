"use client";

import isUser from "@/auth/isUser";
import Logout from "@/components/Logout";
import { Pencil, Users, Zap, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const userExits = isUser(token);
    if (userExits) {
      const setLoggedIn = () => setIsLoggedIn(true);
      setLoggedIn();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Pencil className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">DrawBoard</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </a>
              {isLoggedIn && <Logout />}
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main>
        <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Sketch Your Ideas
              <br />
              <span className="text-blue-600">Collaborate in Real-Time</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              A powerful, intuitive drawing tool for brainstorming, wireframing,
              and visual collaboration. Create beautiful diagrams and sketches
              with ease.
            </p>
            <div className="flex justify-center">
              {isLoggedIn ? (
                <div>
                  <Link href={"/room"}>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      Go to Room Page
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href={"/signup"}>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      Sign up
                    </button>
                  </Link>
                  <Link href={"/signin"}>
                    <button className="px-8 py-4 bg-white text-gray-900 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all font-semibold text-lg flex items-center gap-2">
                      Sign in
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Pencil className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Canvas Preview Area</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to make your drawing experience
                seamless and enjoyable
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Real-Time Collaboration
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Work together with your team in real-time. See cursors, edits,
                  and changes as they happen.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Built for performance. Smooth drawing experience even with
                  complex diagrams and many elements.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Export Anywhere
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Export your drawings as PNG, SVG, or JSON. Share your work in
                  any format you need.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Built for Creators
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              DrawBoard is designed for designers, developers, and teams who
              need a simple yet powerful tool for visual communication. Whether
              you&apos;re sketching a quick idea, creating detailed wireframes,
              or collaborating on a complex diagram, we&apos;ve got you covered.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Free & Open Source
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                No Account Required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                Privacy Focused
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Pencil className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-gray-900">DrawBoard</span>
            </div>
            <div className="flex gap-8 text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Twitter
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 DrawBoard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
