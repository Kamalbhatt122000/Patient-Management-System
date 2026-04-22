import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
    FiFileText, FiUploadCloud, FiTrash2, FiDownload, FiFile, FiImage,
} from "react-icons/fi";
import {
    getPatients, uploadReport, getReports, deleteReport, getReportFileUrl,
} from "../services/api";

export default function MedicalReports() {
    const [patients, setPatients] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [reportName, setReportName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        async function load() {
            try {
                const [pRes, rRes] = await Promise.all([getPatients(), getReports()]);
                setPatients(pRes.data.patients || []);
                setReports(rRes.data.reports || []);
            } catch {
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredReports = selectedPatient
        ? reports.filter((r) => r.patient_id === selectedPatient)
        : reports;

    const handleFileSelect = (file) => {
        if (!file) return;
        const allowed = ["pdf", "png", "jpg", "jpeg", "gif", "bmp", "webp"];
        const ext = file.name.split(".").pop().toLowerCase();
        if (!allowed.includes(ext)) {
            toast.error("Unsupported file type");
            return;
        }
        setSelectedFile(file);
        if (!reportName) setReportName(file.name);
    };

    const handleUpload = async () => {
        if (!selectedPatient) { toast.error("Select a patient first"); return; }
        if (!selectedFile) { toast.error("Select a file to upload"); return; }

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("patient_id", selectedPatient);
            fd.append("file", selectedFile);
            fd.append("report_name", reportName || selectedFile.name);
            const res = await uploadReport(fd);
            setReports((prev) => [res.data.report, ...prev]);
            setSelectedFile(null);
            setReportName("");
            if (fileRef.current) fileRef.current.value = "";
            toast.success("Report uploaded!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this report?")) return;
        try {
            await deleteReport(id);
            setReports((prev) => prev.filter((r) => r.id !== id));
            toast.success("Report deleted");
        } catch {
            toast.error("Delete failed");
        }
    };

    const isImage = (type) => ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(type);

    if (loading) {
        return (
            <>
                <div className="page-header"><div><h2><FiFileText /> Medical Reports</h2></div></div>
                <div className="page-content"><div className="loading-overlay"><div className="spinner" /> Loading...</div></div>
            </>
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h2><FiFileText style={{ color: "var(--primary-500)" }} /> Medical Reports</h2>
                    <p className="page-header-subtitle">Upload and view patient medical reports</p>
                </div>
            </div>

            <div className="page-content">
                {/* Patient selector */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="form-grid" style={{ gridTemplateColumns: "1fr auto" }}>
                        <div className="form-group">
                            <label>Select Patient</label>
                            <select className="form-control" value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}>
                                <option value="">All patients</option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Upload area */}
                {selectedPatient && (
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header">
                            <h3><FiUploadCloud /> Upload Report</h3>
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label>Report Name</label>
                            <input className="form-control" value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                                placeholder="e.g. Blood Test Results" />
                        </div>

                        <div
                            className={`file-drop-zone ${dragOver ? "dragover" : ""}`}
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                        >
                            <div className="drop-icon"><FiUploadCloud /></div>
                            {selectedFile ? (
                                <p><strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
                            ) : (
                                <p>Drag & drop a file here or <span className="browse-link">browse</span></p>
                            )}
                            <p style={{ fontSize: 12, marginTop: 8, color: "var(--text-tertiary)" }}>
                                Supported: PDF, PNG, JPG, JPEG, GIF, BMP, WEBP (max 16 MB)
                            </p>
                            <input ref={fileRef} type="file" hidden
                                accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                                onChange={(e) => handleFileSelect(e.target.files[0])} />
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !selectedFile}>
                                <FiUploadCloud /> {uploading ? "Uploading..." : "Upload Report"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Reports list */}
                <div className="card">
                    <div className="card-header">
                        <h3><FiFileText /> Reports ({filteredReports.length})</h3>
                    </div>

                    {filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><FiFileText /></div>
                            <h4>No Reports Found</h4>
                            <p>{selectedPatient ? "This patient has no reports yet." : "No reports have been uploaded."}</p>
                        </div>
                    ) : (
                        <div className="report-list">
                            {filteredReports.map((r) => (
                                <div key={r.id} className="report-item">
                                    <div className={`report-icon ${isImage(r.file_type) ? "image" : "pdf"}`}>
                                        {isImage(r.file_type) ? <FiImage /> : <FiFile />}
                                    </div>
                                    <div className="report-info">
                                        <h4>{r.report_name || r.original_filename}</h4>
                                        <p>
                                            {new Date(r.upload_date).toLocaleDateString("en-US", {
                                                year: "numeric", month: "short", day: "numeric",
                                            })} • {r.file_type.toUpperCase()}
                                            {patients.length > 0 && (() => {
                                                const pt = patients.find((p) => p.id === r.patient_id);
                                                return pt ? ` • ${pt.first_name} ${pt.last_name}` : "";
                                            })()}
                                        </p>
                                    </div>
                                    <div className="report-actions">
                                        <a className="btn btn-sm btn-secondary"
                                            href={getReportFileUrl(r.file_path)}
                                            target="_blank" rel="noopener noreferrer">
                                            <FiDownload />
                                        </a>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
