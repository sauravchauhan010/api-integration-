import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { SearchResults } from './pages/SearchResults';
import { TourDetailView } from './pages/TourDetail';
import { MyBookings } from './pages/MyBookings';

export default function App() {
  return (
    <div className="font-sans text-gray-900 selection:bg-[#f27d26]/30 bg-white min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results" element={<SearchResults />} />
        <Route path="/detail/:tourId" element={<TourDetailView />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>

      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-yellow-400 text-black px-2 py-6 rounded-r-lg font-bold text-xs [writing-mode:vertical-rl] rotate-180 cursor-pointer shadow-lg">
          Feedback
        </div>
      </div>
    </div>
  );
}
