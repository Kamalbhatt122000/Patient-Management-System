/**
 * API service layer – centralizes all backend HTTP calls.
 * Connected to Flask backend with Salesforce integration.
 */
import axios from "axios";

const BASE_URL = "https://patient-management-system-backend-3.onrender.com/api";

const API = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// ─── Patients ────────────────────────────────────────
export const registerPatient = (data) => API.post("/patients", data);
export const getPatients = () => API.get("/patients");
export const getPatient = (id) => API.get(`/patients/${id}`);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);

// ─── Doctors (from Salesforce) ───────────────────────
export const getDoctors = () => API.get("/appointments/doctors");
export const getDoctorSlots = (doctorId) => API.get(`/doctors/${doctorId}/slots`);

// ─── Appointments ────────────────────────────────────
export const getTimeSlots = (doctorId) =>
    API.get("/appointments/time-slots", { params: doctorId ? { doctor_id: doctorId } : {} });
export const bookAppointment = (data) => API.post("/appointments", data);
export const getAppointments = (patientId) =>
    API.get("/appointments", { params: patientId ? { patient_id: patientId } : {} });
export const cancelAppointment = (id) => API.delete(`/appointments/${id}`);

// ─── Reports (bidirectional Salesforce sync) ─────────
export const uploadReport = (formData) =>
    API.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const getReports = (patientId) =>
    API.get("/reports", { params: patientId ? { patient_id: patientId } : {} });
export const deleteReport = (id) => API.delete(`/reports/${id}`);

/**
 * Get the download URL for a report file.
 * Handles both local files and Salesforce-hosted files.
 */
export const getReportFileUrl = (report) => {
    // If called with a string (legacy), treat as local filename
    if (typeof report === "string") {
        return `${BASE_URL}/reports/file/${report}`;
    }
    // Salesforce-only file: proxy through backend
    if (report.source === "salesforce" && report.content_version_id) {
        return `${BASE_URL}/reports/sf-file/${report.content_version_id}`;
    }
    // Local file with SF sync: use local path
    if (report.file_path) {
        return `${BASE_URL}/reports/file/${report.file_path}`;
    }
    // Fallback
    return "#";
};

export default API;
