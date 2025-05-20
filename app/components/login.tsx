// "use client";
// import { useState } from "react";
// import { supabase } from "@/utils/supabase/client";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     setLoading(true);
//     const { error } = await supabase.auth.signInWithOtp({ email });
//     setLoading(false);
//     if (error) alert(error.message);
//     else alert("Check your email for the login link!");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
//       <div className="w-full max-w-md">
//         {/* Card Container */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
//           {/* Logo and Header */}
//           <div className="bg-indigo-600 dark:bg-indigo-700 p-6 text-center">
//             <h1 className="text-3xl font-bold text-white">Founder GPT</h1>
//             <p className="text-indigo-200 mt-2">Empowering startups to succeed</p>
//           </div>
          
//           {/* Login Form */}
//           <div className="p-8">
//             <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Log in to your account</h2>
            
//             <div className="space-y-6">
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Email address
//                 </label>
//                 <input 
//                   id="email"
//                   type="email" 
//                   placeholder="you@example.com" 
//                   value={email} 
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white transition"
//                 />
//               </div>
              
//               <button 
//                 onClick={handleLogin} 
//                 disabled={loading}
//                 className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-white font-medium rounded-lg px-5 py-3 transition duration-200 ease-in-out disabled:opacity-70"
//               >
//                 {loading ? 
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Loading...
//                   </span> : 
//                   "Send Magic Link"
//                 }
//               </button>
//             </div>
            
//             <div className="mt-8 text-center">
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 No account yet?{" "}
//                 <a href="#" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
//                   Sign up for free
//                 </a>
//               </p>
//             </div>
//           </div>
//         </div>
        
//         {/* Footer */}
//         <div className="mt-8 text-center">
//           <p className="text-xs text-gray-500 dark:text-gray-400">
//             © {new Date().getFullYear()} Founder GPT. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }