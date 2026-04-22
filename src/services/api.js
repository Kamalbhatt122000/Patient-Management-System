/**
 * API service layer – centralizes all backend HTTP calls.
 */
import axios from "axios";

const API = axios.create({
    baseURL: "https://patient-management-system-backend-f6rr.onrender.com/api",
    headers: { "Content-Type": "application/json" },
});

// ─── Patients ────────────────────────────────────────
export const registerPatient = (data) => API.post("/patients", data);
export const getPatients = () => API.get("/patients");
export const getPatient = (id) => API.get(`/patients/${id}`);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);

// ─── Appointments ────────────────────────────────────
export const getDoctors = () => API.get("/appointments/doctors");
export const getTimeSlots = () => API.get("/appointments/time-slots");
export const bookAppointment = (data) => API.post("/appointments", data);
export const getAppointments = (patientId) =>
    API.get("/appointments", { params: patientId ? { patient_id: patientId } : {} });
export const cancelAppointment = (id) => API.delete(`/appointments/${id}`);

// ─── Reports ─────────────────────────────────────────
export const uploadReport = (formData) =>
    API.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const getReports = (patientId) =>
    API.get("/reports", { params: patientId ? { patient_id: patientId } : {} });
export const deleteReport = (id) => API.delete(`/reports/${id}`);

export const getReportFileUrl = (filename) =>
    `https://patient-management-system-backend-f6rr.onrender.com/api/reports/file/${filename}`;

export default API;
