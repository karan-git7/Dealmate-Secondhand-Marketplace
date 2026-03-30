import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { MessageSquare, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import "../../styles/profile.css";

const MySupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedTicket, setExpandedTicket] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const { data } = await api.get('/support/my-tickets');
                setTickets(data);
            } catch (err) {
                console.error("Failed to fetch support tickets:", err);
                setError("Failed to load your support tickets. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <Clock size={16} />;
            case 'in_progress': return <Clock size={16} />;
            case 'waiting': return <AlertCircle size={16} />;
            case 'closed': return <CheckCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Open';
            case 'in_progress': return 'In Progress';
            case 'waiting': return 'Waiting for User';
            case 'closed': return 'Resolved';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="reports-loading">
                <div className="spinner"></div>
                <span>Loading your support tickets...</span>
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

    if (tickets.length === 0) {
        return (
            <div className="empty-reports">
                <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>You haven't submitted any support tickets yet.</p>
                <a href="/support" className="btn btn-primary" style={{ marginTop: '16px' }}>Contact Support</a>
            </div>
        );
    }

    return (
        <div className="my-reports-container">
            <div className="reports-header">
                <h2><MessageSquare size={20} /> Your Support Tickets</h2>
                <p>Track the status of your help requests and admin responses.</p>
            </div>

            <div className="reports-list">
                {tickets.map((ticket) => (
                    <div 
                        key={ticket._id} 
                        className={`report-card ${expandedTicket === ticket._id ? 'expanded' : ''}`}
                        onClick={() => setExpandedTicket(expandedTicket === ticket._id ? null : ticket._id)}
                    >
                        <div className="report-card-header">
                            <div className="report-main-info">
                                <span className={`report-status-badge status-${ticket.status}`}>
                                    {getStatusIcon(ticket.status)}
                                    {getStatusLabel(ticket.status)}
                                </span>
                                <h3 className="report-reason">{ticket.subject}</h3>
                            </div>
                            <div className="report-meta">
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                {expandedTicket === ticket._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </div>

                        <div className="report-card-body">
                            <div className="report-description-box">
                                <strong>Your Message:</strong>
                                <p>{ticket.message}</p>
                            </div>

                            {ticket.adminComment && (
                                <div className="admin-response-box">
                                    <div className="admin-response-header">
                                        <strong>Admin Response:</strong>
                                    </div>
                                    <p>{ticket.adminComment}</p>
                                </div>
                            )}

                            <div className="report-details-grid">
                                <div className="detail-item">
                                    <span>Ticket ID:</span>
                                    <code>{ticket._id.substring(ticket._id.length - 8)}</code>
                                </div>
                                {ticket.phoneNumber && (
                                    <div className="detail-item">
                                        <span>Phone Provided:</span>
                                        <span>{ticket.phoneNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MySupportTickets;
