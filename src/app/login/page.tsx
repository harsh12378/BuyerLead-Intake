"use client"
import '../globals.css';
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Metadata } from "next";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(false);
   async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    setMsg("");
    setLoading(true);
    const {error}=await supabase.auth.signInWithOtp({email});
    setLoading(false);
    if(error){
      setMsg(error.message);
    }else{
      setMsg("check your email for login link(check spam)");
    }
   }
return (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-6 p-10 border border-slate-200/60 rounded-2xl bg-white/80 backdrop-blur-sm min-w-[400px] shadow-2xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all duration-300"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Welcome Back
        </h2>
        <p className="text-slate-600 text-sm">Sign in to your account</p>
      </div>

      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="font-semibold text-slate-700 text-sm tracking-wide flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 border border-slate-300/60 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white/80"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending magic link...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Send magic link
          </>
        )}
      </button>

      {msg && (
        <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <p role="status" className="text-sm text-slate-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {msg}
          </p>
        </div>
      )}
    </form>
  </div>
);
}
