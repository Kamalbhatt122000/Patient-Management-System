import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiCalendar, FiFileText, FiAlertTriangle, FiArrowRight, FiZap, FiCloud } from "react-icons/fi";
import { getPatients, getAppointments, getReports } from "../services/api";

export default function Dashboard() {
    const [stats, setStats] = useState({ patients: 0, appointments: 0, reports: 0, highPriority: 0, sfSynced: 0, sfFiles: 0 });
    const [recentPatients, setRecentPatients] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [pRes, aRes, rRes] = await Promise.all([
                    getPatients(),
                    getAppointments(),
                    getReports(),
                ]);
                const patients = pRes.data.patients || [];
                const appointments = aRes.data.appointments || [];
                const reports = rRes.data.reports || [];

                setStats({
                    patients: patients.length,
                    appointments: appointments.length,
                    reports: reports.length,
                    highPriority: patients.filter((p) => p.priority === "HIGH").length,
                    sfSynced: patients.filter((p) => p.salesforce_id).length,
                    sfFiles: rRes.data.sf_count || 0,
                });
                setRecentPatients(patients.slice(-5).reverse());
                setRecentAppointments(appointments.slice(-5).reverse());
            } catch {
                // silently handle — dashboard still renders
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <>
            <div className="page-header">
                <div>
                    <h2><FiUsers style={{ color: "var(--primary-500)" }} /> Dashboard</h2>
                    <p className="page-header-subtitle">Welcome to MedCare+ Patient Management System — <FiZap style={{ display: "inline", verticalAlign: "middle", color: "var(--accent-500)" }} /> Connected to Salesforce</p>
                </div>
            </div>

            <div className="page-content">
                {loading ? (
                    <div className="loading-overlay"><div className="spinner" /> Loading...</div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue"><FiUsers /></div>
                                <div className="stat-info"><h3>{stats.patients}</h3><p>Total Patients</p></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green"><FiCalendar /></div>
                                <div className="stat-info"><h3>{stats.appointments}</h3><p>Appointments</p></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon orange"><FiFileText /></div>
                                <div className="stat-info"><h3>{stats.reports}</h3><p>Medical Reports</p></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon red"><FiAlertTriangle /></div>
                                <div className="stat-info"><h3>{stats.highPriority}</h3><p>High Priority</p></div>
                            </div>
                        </div>

                        {/* Salesforce Sync Summary */}
                        <div style={{
                            display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap",
                        }}>
                            <div style={{
                                flex: 1, minWidth: 240,
                                padding: "16px 20px", borderRadius: "var(--radius-lg)",
                                background: "linear-gradient(135deg, var(--accent-50), #e0f2fe)",
                                border: "1px solid rgba(0, 189, 135, 0.15)",
                                display: "flex", alignItems: "center", gap: 14,
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: "var(--radius-md)",
                                    background: "var(--accent-100)", color: "var(--accent-600)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 20,
                                }}>
                                    <FiZap />
                                </div>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-700)" }}>
                                        {stats.sfSynced}
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--accent-600)" }}>
                                        Patients Synced to Salesforce
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                flex: 1, minWidth: 240,
                                padding: "16px 20px", borderRadius: "var(--radius-lg)",
                                background: "linear-gradient(135deg, #e0f2fe, var(--primary-50))",
                                border: "1px solid rgba(13, 124, 208, 0.15)",
                                display: "flex", alignItems: "center", gap: 14,
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: "var(--radius-md)",
                                    background: "var(--primary-100)", color: "var(--primary-600)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 20,
                                }}>
                                    <FiCloud />
                                </div>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary-700)" }}>
                                        {stats.sfFiles}
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--primary-600)" }}>
                                        Files from Salesforce
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
                            {/* Recent Patients */}
                            <div className="card">
                                <div className="card-header">
                                    <h3><FiUsers /> Recent Patients</h3>
                                    <Link to="/register" className="btn btn-sm btn-secondary">View All <FiArrowRight /></Link>
                                </div>
                                {recentPatients.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No patients registered yet.</p>
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead><tr><th>Name</th><th>Email</th><th>Priority</th><th>SF</th></tr></thead>
                                            <tbody>
                                                {recentPatients.map((p) => (
                                                    <tr key={p.id}>
                                                        <td style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</td>
                                                        <td>{p.email}</td>
                                                        <td>
                                                            <span className={`badge badge-${p.priority?.toLowerCase()}`}>
                                                                {p.priority}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {p.salesforce_id ? (
                                                                <FiZap style={{ color: "var(--accent-500)" }} title="Synced to Salesforce" />
                                                            ) : (
                                                                <span style={{ color: "var(--text-tertiary)" }}>—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Recent Appointments */}
                            <div className="card">
                                <div className="card-header">
                                    <h3><FiCalendar /> Upcoming Appointments</h3>
                                    <Link to="/appointments" className="btn btn-sm btn-secondary">View All <FiArrowRight /></Link>
                                </div>
                                {recentAppointments.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No appointments booked yet.</p>
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>SF</th></tr></thead>
                                            <tbody>
                                                {recentAppointments.map((a) => (
                                                    <tr key={a.id}>
                                                        <td style={{ fontWeight: 600 }}>{a.patient_name}</td>
                                                        <td>{a.doctor}</td>
                                                        <td>{a.date}</td>
                                                        <td>{a.time}</td>
                                                        <td>
                                                            {a.salesforce_id ? (
                                                                <FiZap style={{ color: "var(--accent-500)" }} title="Synced to Salesforce" />
                                                            ) : (
                                                                <span style={{ color: "var(--text-tertiary)" }}>—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
