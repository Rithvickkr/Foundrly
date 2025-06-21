"use client"
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        // Redirect to landing page immediately
        router.push("/home");
      } else {
        setLoading(false);
        setShowWelcome(true);
        
        // Navigate to home after 2 seconds
        setTimeout(() => {
          router.push("/appdash");
        }, 5000);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
        <div className="text-center">
          {/* Main spinner with pulsing background */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 border-r-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-2 border-transparent border-l-blue-400 border-b-indigo-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          
          {/* Loading text with gradient */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-pulse">
            Loading
          </h2>
          
          {/* Animated dots */}
          <div className="flex space-x-2 justify-center mb-8">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          {/* Progress bar with gradient */}
          <div className="w-80 mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full animate-pulse-progress relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60"></div>
            <div className="absolute top-1/3 right-1/5 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-50" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-70" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-float opacity-60" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            33% { transform: translateY(-15px) translateX(10px); }
            66% { transform: translateY(5px) translateX(-5px); }
          }
          @keyframes pulse-progress {
            0%, 100% { width: 30%; }
            50% { width: 70%; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          .animate-pulse-progress {
            animation: pulse-progress 2s ease-in-out infinite;
          }
          .animate-shimmer {
            animation: shimmer 2s ease-in-out infinite;
          }
          .animate-reverse {
            animation: reverse 1.5s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900 transition-all duration-2000 ease-in-out animate-fadeOut">
        <div className="text-center animate-slideUp">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-pulse">
            Welcome!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 animate-fadeIn">
            Get ready for something amazing...
          </p>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-purple-400 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-pink-400 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            0%, 70% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-slideUp {
            animation: slideUp 1s ease-out;
          }
          .animate-fadeIn {
            animation: fadeIn 1.5s ease-in;
          }
          .animate-fadeOut {
            animation: fadeOut 2s ease-in-out forwards;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
