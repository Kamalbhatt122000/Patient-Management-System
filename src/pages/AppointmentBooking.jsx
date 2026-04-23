import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import {
    FiCalendar, FiCheckCircle, FiArrowLeft, FiTrash2, FiClock, FiZap,
} from "react-icons/fi";
import {
    getPatients, getDoctors, bookAppointment,
    getAppointments, cancelAppointment,
} from "../services/api";

export default function AppointmentBooking() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [tab, setTab] = useState("book"); // "book" | "list"

    const [form, setForm] = useState({
        patient_id: "", doctor_sf_id: "", doctor_name: "", date: null, time: "", reason: "",
    });
    const [errors, setErrors] = useState({});
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const [pRes, dRes, aRes] = await Promise.all([
                    getPatients(), getDoctors(), getAppointments(),
                ]);
                setPatients(pRes.data.patients || []);
                setDoctors(dRes.data.doctors || []);
                setAppointments(aRes.data.appointments || []);
            } catch {
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // When doctor changes, update time slots from their availability
    const handleDoctorChange = (e) => {
        const doctorId = e.target.value;
        const doctor = doctors.find((d) => d.id === doctorId);

        if (doctor) {
            setSelectedDoctor(doctor);
            setTimeSlots(doctor.slots || []);
            setForm({
                ...form,
                doctor_sf_id: doctor.id,
                doctor_name: doctor.name,
                time: "", // reset time when doctor changes
            });
        } else {
            setSelectedDoctor(null);
            setTimeSlots([]);
            setForm({ ...form, doctor_sf_id: "", doctor_name: "", time: "" });
        }
        setErrors({ ...errors, doctor_sf_id: "" });
    };

    const validate = () => {
        const errs = {};
        if (!form.patient_id) errs.patient_id = "Select a patient";
        if (!form.doctor_sf_id) errs.doctor_sf_id = "Select a doctor";
        if (!form.date) errs.date = "Pick a date";
        if (!form.time) errs.time = "Select a time slot";
        if (!form.reason.trim()) errs.reason = "Enter visit reason";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSubmitting(true);
        try {
            const payload = {
                ...form,
                date: form.date.toISOString().split("T")[0],
            };
            const res = await bookAppointment(payload);
            setSuccess(res.data.appointment);
            setAppointments((prev) => [res.data.appointment, ...prev]);
            toast.success("Appointment booked & synced to Salesforce!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Booking failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm("Cancel this appointment?")) return;
        try {
            await cancelAppointment(id);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            toast.success("Appointment cancelled");
        } catch {
            toast.error("Failed to cancel");
        }
    };

    const resetForm = () => {
        setForm({ patient_id: "", doctor_sf_id: "", doctor_name: "", date: null, time: "", reason: "" });
        setSuccess(null);
        setErrors({});
        setSelectedDoctor(null);
        setTimeSlots([]);
    };

    if (loading) {
        return (
            <>
                <div className="page-header"><div><h2><FiCalendar /> Appointments</h2></div></div>
                <div className="page-content"><div className="loading-overlay"><div className="spinner" /> Loading...</div></div>
            </>
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h2><FiCalendar style={{ color: "var(--primary-500)" }} /> Appointments</h2>
                    <p className="page-header-subtitle">Book and manage patient appointments — <FiZap style={{ display: "inline", verticalAlign: "middle", color: "var(--accent-500)" }} /> Connected to Salesforce</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        className={`btn btn-sm ${tab === "book" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => { setTab("book"); setSuccess(null); }}
                    >Book New</button>
                    <button
                        className={`btn btn-sm ${tab === "list" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setTab("list")}
                    >All Appointments</button>
                </div>
            </div>

            <div className="page-content">
                {tab === "book" ? (
                    success ? (
                        <div className="card success-card">
                            <div className="success-icon"><FiCheckCircle /></div>
                            <h3 style={{ fontSize: 22, marginBottom: 8 }}>Appointment Booked!</h3>
                            <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
                                {success.patient_name} with {success.doctor} on {success.date} at {success.time}
                            </p>
                            {success.salesforce_id && (
                                <div className="sf-sync-badge" style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    background: "var(--accent-50)", color: "var(--accent-600)",
                                    padding: "6px 16px", borderRadius: "var(--radius-full)",
                                    fontSize: 13, fontWeight: 600, marginBottom: 20,
                                    border: "1px solid rgba(0, 189, 135, 0.2)",
                                }}>
                                    <FiZap /> Synced to Salesforce
                                </div>
                            )}
                            <div>
                                <button className="btn btn-primary" onClick={resetForm}>
                                    <FiArrowLeft /> Book Another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            {patients.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">👤</div>
                                    <h4>No Patients Found</h4>
                                    <p>Register a patient first before booking appointments.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        {/* Patient */}
                                        <div className="form-group">
                                            <label>Patient <span className="required">*</span></label>
                                            <select className={`form-control ${errors.patient_id ? "error" : ""}`}
                                                value={form.patient_id}
                                                onChange={(e) => { setForm({ ...form, patient_id: e.target.value }); setErrors({ ...errors, patient_id: "" }); }}>
                                                <option value="">Select patient</option>
                                                {patients.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.email}</option>
                                                ))}
                                            </select>
                                            {errors.patient_id && <span className="form-error">{errors.patient_id}</span>}
                                        </div>

                                        {/* Doctor (from Salesforce) */}
                                        <div className="form-group">
                                            <label>Doctor <span className="required">*</span> <span style={{ fontSize: 11, color: "var(--accent-500)", fontWeight: 400 }}>⚡ Salesforce</span></label>
                                            <select className={`form-control ${errors.doctor_sf_id ? "error" : ""}`}
                                                value={form.doctor_sf_id}
                                                onChange={handleDoctorChange}>
                                                <option value="">Select doctor</option>
                                                {doctors.map((d) => (
                                                    <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                                                ))}
                                            </select>
                                            {errors.doctor_sf_id && <span className="form-error">{errors.doctor_sf_id}</span>}
                                        </div>

                                        {/* Doctor Availability Info */}
                                        {selectedDoctor && (
                                            <div className="form-group full-width">
                                                <div style={{
                                                    padding: "12px 16px",
                                                    background: "var(--accent-50)",
                                                    borderRadius: "var(--radius-md)",
                                                    border: "1px solid rgba(0, 189, 135, 0.15)",
                                                    fontSize: 13,
                                                    color: "var(--accent-700)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}>
                                                    <FiClock />
                                                    <strong>{selectedDoctor.name}</strong> is available from&nbsp;
                                                    <strong>{selectedDoctor.available_from?.split(".")[0] || "N/A"}</strong> to&nbsp;
                                                    <strong>{selectedDoctor.available_to?.split(".")[0] || "N/A"}</strong>
                                                    &nbsp;— {timeSlots.length} slots available
                                                </div>
                                            </div>
                                        )}

                                        {/* Date */}
                                        <div className="form-group">
                                            <label>Date <span className="required">*</span></label>
                                            <DatePicker
                                                selected={form.date}
                                                onChange={(d) => { setForm({ ...form, date: d }); setErrors({ ...errors, date: "" }); }}
                                                minDate={new Date()}
                                                placeholderText="Select date"
                                                dateFormat="yyyy-MM-dd"
                                                className={errors.date ? "error" : ""}
                                            />
                                            {errors.date && <span className="form-error">{errors.date}</span>}
                                        </div>

                                        {/* Time (dynamic from doctor availability) */}
                                        <div className="form-group">
                                            <label>Time Slot <span className="required">*</span></label>
                                            <select className={`form-control ${errors.time ? "error" : ""}`}
                                                value={form.time}
                                                onChange={(e) => { setForm({ ...form, time: e.target.value }); setErrors({ ...errors, time: "" }); }}
                                                disabled={timeSlots.length === 0}>
                                                <option value="">
                                                    {form.doctor_sf_id
                                                        ? timeSlots.length > 0 ? "Select time" : "No slots available"
                                                        : "Select a doctor first"}
                                                </option>
                                                {timeSlots.map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            {errors.time && <span className="form-error">{errors.time}</span>}
                                        </div>

                                        {/* Reason */}
                                        <div className="form-group full-width">
                                            <label>Reason for Visit <span className="required">*</span></label>
                                            <textarea className={`form-control ${errors.reason ? "error" : ""}`}
                                                value={form.reason}
                                                onChange={(e) => { setForm({ ...form, reason: e.target.value }); setErrors({ ...errors, reason: "" }); }}
                                                placeholder="Describe the reason for this visit..."
                                            />
                                            {errors.reason && <span className="form-error">{errors.reason}</span>}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 24 }}>
                                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                                            <FiCalendar /> {submitting ? "Booking..." : "Book Appointment"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )
                ) : (
                    /* Appointments list */
                    <div className="card">
                        {appointments.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon"><FiCalendar /></div>
                                <h4>No Appointments</h4>
                                <p>No appointments have been booked yet.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th>
                                            <th>Reason</th><th>Status</th><th>SF Sync</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((a) => (
                                            <tr key={a.id}>
                                                <td style={{ fontWeight: 600 }}>{a.patient_name}</td>
                                                <td>{a.doctor}</td>
                                                <td>{a.date}</td>
                                                <td><FiClock style={{ marginRight: 4 }} />{a.time}</td>
                                                <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {a.reason}
                                                </td>
                                                <td><span className="badge badge-status">{a.status}</span></td>
                                                <td>
                                                    {a.salesforce_id ? (
                                                        <span style={{
                                                            display: "inline-flex", alignItems: "center", gap: 4,
                                                            fontSize: 11, color: "var(--accent-600)", fontWeight: 600,
                                                        }}>
                                                            <FiZap /> Synced
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(a.id)}>
                                                        <FiTrash2 /> Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
