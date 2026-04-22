import { useState } from "react";
import { toast } from "react-toastify";
import { FiUserPlus, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { registerPatient } from "../services/api";

const initialForm = {
    first_name: "", last_name: "", age: "", gender: "",
    email: "", phone: "", address: "", symptoms: "", duration_days: "",
};

export default function PatientRegistration() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        const errs = {};
        if (!form.first_name.trim()) errs.first_name = "First name is required";
        if (!form.last_name.trim()) errs.last_name = "Last name is required";
        if (!form.age || isNaN(form.age) || +form.age < 0 || +form.age > 150)
            errs.age = "Valid age (0-150) is required";
        if (!form.gender) errs.gender = "Gender is required";
        if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
            errs.email = "Valid email is required";
        if (!form.phone.trim()) errs.phone = "Phone is required";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            const payload = {
                ...form,
                age: parseInt(form.age, 10),
                duration_days: form.duration_days ? parseInt(form.duration_days, 10) : null,
            };
            const res = await registerPatient(payload);
            setSuccess(res.data.patient);
            toast.success("Patient registered successfully!");
        } catch (err) {
            const msg = err.response?.data?.error || "Registration failed";
            toast.error(msg);
            if (err.response?.data?.details) {
                const serverErrs = {};
                err.response.data.details.forEach((d) => {
                    const key = d.split(" ")[0];
                    serverErrs[key] = d;
                });
                setErrors(serverErrs);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => { setForm(initialForm); setSuccess(null); setErrors({}); };

    if (success) {
        return (
            <>
                <div className="page-header">
                    <div><h2><FiCheckCircle style={{ color: "var(--status-success)" }} /> Registration Complete</h2></div>
                </div>
                <div className="page-content">
                    <div className="card success-card">
                        <div className="success-icon"><FiCheckCircle /></div>
                        <h3 style={{ fontSize: 22, marginBottom: 8 }}>Patient Registered Successfully!</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                            {success.first_name} {success.last_name} has been added to the system.
                        </p>
                        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                            <span className={`badge badge-${success.priority?.toLowerCase()}`} style={{ fontSize: 14, padding: "6px 16px" }}>
                                Priority: {success.priority}
                            </span>
                        </div>
                        <div style={{ marginTop: 28 }}>
                            <button className="btn btn-primary" onClick={resetForm}>
                                <FiArrowLeft /> Register Another Patient
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h2><FiUserPlus style={{ color: "var(--primary-500)" }} /> Patient Registration</h2>
                    <p className="page-header-subtitle">Register a new patient in the system</p>
                </div>
            </div>
            <div className="page-content">
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {/* First Name */}
                            <div className="form-group">
                                <label>First Name <span className="required">*</span></label>
                                <input className={`form-control ${errors.first_name ? "error" : ""}`}
                                    name="first_name" value={form.first_name} onChange={handleChange}
                                    placeholder="John" />
                                {errors.first_name && <span className="form-error">{errors.first_name}</span>}
                            </div>

                            {/* Last Name */}
                            <div className="form-group">
                                <label>Last Name <span className="required">*</span></label>
                                <input className={`form-control ${errors.last_name ? "error" : ""}`}
                                    name="last_name" value={form.last_name} onChange={handleChange}
                                    placeholder="Doe" />
                                {errors.last_name && <span className="form-error">{errors.last_name}</span>}
                            </div>

                            {/* Age */}
                            <div className="form-group">
                                <label>Age <span className="required">*</span></label>
                                <input type="number" className={`form-control ${errors.age ? "error" : ""}`}
                                    name="age" value={form.age} onChange={handleChange}
                                    placeholder="30" min="0" max="150" />
                                {errors.age && <span className="form-error">{errors.age}</span>}
                            </div>

                            {/* Gender */}
                            <div className="form-group">
                                <label>Gender <span className="required">*</span></label>
                                <select className={`form-control ${errors.gender ? "error" : ""}`}
                                    name="gender" value={form.gender} onChange={handleChange}>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <span className="form-error">{errors.gender}</span>}
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label>Email <span className="required">*</span></label>
                                <input type="email" className={`form-control ${errors.email ? "error" : ""}`}
                                    name="email" value={form.email} onChange={handleChange}
                                    placeholder="john@example.com" />
                                {errors.email && <span className="form-error">{errors.email}</span>}
                            </div>

                            {/* Phone */}
                            <div className="form-group">
                                <label>Phone <span className="required">*</span></label>
                                <input className={`form-control ${errors.phone ? "error" : ""}`}
                                    name="phone" value={form.phone} onChange={handleChange}
                                    placeholder="+1 234 567 8900" />
                                {errors.phone && <span className="form-error">{errors.phone}</span>}
                            </div>

                            {/* Address */}
                            <div className="form-group full-width">
                                <label>Address</label>
                                <input className="form-control"
                                    name="address" value={form.address} onChange={handleChange}
                                    placeholder="123 Main St, City, State" />
                            </div>

                            {/* Symptoms */}
                            <div className="form-group full-width">
                                <label>Symptoms</label>
                                <textarea className="form-control"
                                    name="symptoms" value={form.symptoms} onChange={handleChange}
                                    placeholder="Describe current symptoms (e.g., chest pain, headache, fever)..." />
                            </div>

                            {/* Duration */}
                            <div className="form-group">
                                <label>Symptom Duration (days)</label>
                                <input type="number" className="form-control"
                                    name="duration_days" value={form.duration_days} onChange={handleChange}
                                    placeholder="e.g. 5" min="0" />
                            </div>
                        </div>

                        {/* Triage info */}
                        <div style={{
                            marginTop: 20, padding: "14px 18px",
                            background: "var(--status-info-bg)", borderRadius: "var(--radius-md)",
                            fontSize: 13, color: "var(--status-info)",
                            border: "1px solid rgba(59,130,246,0.15)",
                        }}>
                            <strong>Triage:</strong> Priority is auto-calculated — <em>chest pain → HIGH</em>,
                            duration &gt; 3 days → MEDIUM, else LOW.
                        </div>

                        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? "Registering..." : "Register Patient"}
                            </button>
                            <button type="button" className="btn btn-secondary btn-lg" onClick={resetForm}>Reset</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
