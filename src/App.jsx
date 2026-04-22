import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

import {
  FiHome, FiUserPlus, FiCalendar, FiFileText, FiMenu, FiX, FiActivity,
} from "react-icons/fi";

import Dashboard from "./pages/Dashboard";
import PatientRegistration from "./pages/PatientRegistration";
import AppointmentBooking from "./pages/AppointmentBooking";
import MedicalReports from "./pages/MedicalReports";

import "./index.css";

const navItems = [
  { to: "/", icon: <FiHome />, label: "Dashboard" },
  { to: "/register", icon: <FiUserPlus />, label: "Patient Registration" },
  { to: "/appointments", icon: <FiCalendar />, label: "Appointments" },
  { to: "/reports", icon: <FiFileText />, label: "Medical Reports" },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app-layout">
        {/* Mobile toggle */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon"><FiActivity /></div>
            <div className="sidebar-brand-text">
              <h1>MedCare+</h1>
              <span>Patient Portal</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            © 2026 MedCare+ Healthcare
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<PatientRegistration />} />
            <Route path="/appointments" element={<AppointmentBooking />} />
            <Route path="/reports" element={<MedicalReports />} />
          </Routes>
        </main>

        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </div>
    </Router>
  );
}
