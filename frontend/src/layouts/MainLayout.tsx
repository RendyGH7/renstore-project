import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-900/[0.02] text-slate-900 flex flex-col font-sans relative selection:bg-blue-600 selection:text-white">
      {/* 3D Dynamic Ambient Glowing Mesh Background with GPU Acceleration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transform-gpu will-change-transform">
        {/* Subtle Tech Dot Matrix / Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.4] [background-size:28px_28px]"
          style={{
            backgroundImage: `radial-gradient(rgba(59, 130, 246, 0.18) 1px, transparent 1px)`
          }}
        />

        {/* Ambient 3D Glowing Gradient Orbs (Aurora Effect) */}
        {/* Top-Left Cyber Blue & Cyan Orb */}
        <div className="absolute -top-24 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-blue-500/25 via-cyan-400/20 to-transparent rounded-full blur-[100px] animate-float-slow transform-gpu" />

        {/* Top-Right Neon Purple & Violet Orb */}
        <div className="absolute top-10 -right-28 w-[650px] h-[650px] bg-gradient-to-bl from-purple-500/20 via-indigo-400/20 to-transparent rounded-full blur-[110px] animate-pulse-glow transform-gpu" />

        {/* Center Dynamic Indigo Flare */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-r from-blue-400/10 via-indigo-500/15 to-purple-400/10 rounded-full blur-[120px] animate-float-slow transform-gpu" />

        {/* Bottom Ambient Glows */}
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-400/15 via-blue-500/15 to-transparent rounded-full blur-[110px] animate-pulse-glow transform-gpu" />
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-indigo-500/20 via-purple-400/15 to-transparent rounded-full blur-[100px] animate-float-slow transform-gpu" />

        {/* Subtle Decorative Floating 3D Geometric Glass Rings */}
        <div className="absolute top-28 right-[12%] w-24 h-24 rounded-full border border-blue-400/20 bg-blue-500/5 backdrop-blur-xs animate-float-slow hidden md:block" />
        <div className="absolute top-[48%] left-[6%] w-32 h-32 rounded-3xl rotate-12 border border-purple-400/20 bg-purple-500/5 backdrop-blur-xs animate-float-slow hidden md:block" />
        <div className="absolute top-[75%] right-[8%] w-20 h-20 rounded-2xl -rotate-12 border border-cyan-400/20 bg-cyan-500/5 backdrop-blur-xs animate-float-slow hidden md:block" />
      </div>

      {/* Reusable Clean Glassmorphic Floating Navbar */}
      <Navbar />

      {/* Main Page Content Container (with safe bottom padding for mobile navigation) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20 lg:pb-12 relative z-10">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      {/* Reusable Clean Footer */}
      <Footer />

      {/* Mobile Native Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
