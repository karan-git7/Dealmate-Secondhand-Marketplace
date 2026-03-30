import React, { useEffect, useState } from 'react';
import api from "../../utils/api";
import { Flag, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import "../../styles/profile.css";

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedReport, setExpandedReport] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const { data } = await api.get('/reports/my-reports');
                setReports(data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
                setError("Failed to load your reports. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'resolved': return <CheckCircle size={16} />;
            case 'dismissed': return <XCircle size={16} />;
            case 'reviewed': return <AlertCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="reports-loading">
                <div className="spinner"></div>
                <span>Loading your reports...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reports-error">
                <AlertCircle size={40} />
                <p>{error}</p>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="empty-reports">
                <Flag size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>You haven't submitted any reports yet.</p>
            </div>
        );
    }

    return (
        <div className="my-reports-container">
            <div className="reports-header">
                <h2><Flag size={20} /> Your Submitted Reports</h2>
                <p>Track the status of your complaints against users or products.</p>
            </div>

            <div className="reports-list">
                {reports.map(report => (
                    <div 
                        key={report._id} 
                        className={`report-card ${expandedReport === report._id ? 'expanded' : ''}`}
                        onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                    >
                        <div className="report-card-header">
                            <div className="report-main-info">
                                <span className={`report-status-badge status-${report.status}`}>
                                    {getStatusIcon(report.status)}
                                    {report.status.replace('_', ' ')}
                                </span>
                                <h3 className="report-reason">{report.reason}</h3>
                            </div>
                            <div className="report-meta">
                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                {expandedReport === report._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </div>

                        <div className="report-card-body">
                            <div className="report-description-box">
                                <strong>{report.reportType} Details:</strong>
                                <p>{report.description}</p>
                            </div>

                            {report.adminComment && (
                                <div className="admin-response-box">
                                    <div className="admin-response-header">
                                        <strong>Admin Response:</strong>
                                    </div>
                                    <p>{report.adminComment}</p>
                                </div>
                            )}

                            <div className="report-details-grid">
                                <div className="detail-item">
                                    <span>Report ID:</span>
                                    <code>{report._id.substring(report._id.length - 8)}</code>
                                </div>
                                <div className="detail-item">
                                    <span>Type:</span>
                                    <span>{report.reportType}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyReports;
