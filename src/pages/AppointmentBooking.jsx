import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import {
    FiCalendar, FiCheckCircle, FiArrowLeft, FiTrash2, FiClock,
} from "react-icons/fi";
import {
    getPatients, getDoctors, getTimeSlots, bookAppointment,
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
        patient_id: "", doctor: "", date: null, time: "", reason: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function load() {
            try {
                const [pRes, dRes, tRes, aRes] = await Promise.all([
                    getPatients(), getDoctors(), getTimeSlots(), getAppointments(),
                ]);
                setPatients(pRes.data.patients || []);
                setDoctors(dRes.data.doctors || []);
                setTimeSlots(tRes.data.time_slots || []);
                setAppointments(aRes.data.appointments || []);
            } catch {
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const validate = () => {
        const errs = {};
        if (!form.patient_id) errs.patient_id = "Select a patient";
        if (!form.doctor) errs.doctor = "Select a doctor";
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
            toast.success("Appointment booked!");
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
        setForm({ patient_id: "", doctor: "", date: null, time: "", reason: "" });
        setSuccess(null);
        setErrors({});
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
                    <p className="page-header-subtitle">Book and manage patient appointments</p>
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
                            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
                                {success.patient_name} with {success.doctor} on {success.date} at {success.time}
                            </p>
                            <button className="btn btn-primary" onClick={resetForm}>
                                <FiArrowLeft /> Book Another
                            </button>
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

                                        {/* Doctor */}
                                        <div className="form-group">
                                            <label>Doctor <span className="required">*</span></label>
                                            <select className={`form-control ${errors.doctor ? "error" : ""}`}
                                                value={form.doctor}
                                                onChange={(e) => { setForm({ ...form, doctor: e.target.value }); setErrors({ ...errors, doctor: "" }); }}>
                                                <option value="">Select doctor</option>
                                                {doctors.map((d) => (
                                                    <option key={d.id} value={d.name}>{d.name} — {d.specialty}</option>
                                                ))}
                                            </select>
                                            {errors.doctor && <span className="form-error">{errors.doctor}</span>}
                                        </div>

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

                                        {/* Time */}
                                        <div className="form-group">
                                            <label>Time Slot <span className="required">*</span></label>
                                            <select className={`form-control ${errors.time ? "error" : ""}`}
                                                value={form.time}
                                                onChange={(e) => { setForm({ ...form, time: e.target.value }); setErrors({ ...errors, time: "" }); }}>
                                                <option value="">Select time</option>
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
                                            <th>Reason</th><th>Status</th><th>Actions</th>
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
