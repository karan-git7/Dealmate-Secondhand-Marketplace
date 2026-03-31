import React, { useEffect, useState } from 'react';
import api from "../../utils/api";
import { Mail, MessageSquare, Clock, CheckCircle, Trash2, Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from "../common/Loader";

const AdminSupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [adminComment, setAdminComment] = useState("");

    const fetchTickets = async () => {
        try {
            const { data } = await api.get('/admin/support');
            setTickets(data);
        } catch (error) {
            toast.error("Failed to load support tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/admin/support/${id}`, { status: newStatus, adminComment });
            toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`);
            setAdminComment(""); // Clear comment
            fetchTickets();
            if (selectedTicket && selectedTicket._id === id) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        } catch (error) {
            toast.error("Failed to update ticket status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;
        try {
            await api.delete(`/admin/support/${id}`);
            toast.success("Ticket deleted");
            setSelectedTicket(null);
            setAdminComment("");
            fetchTickets();
        } catch (error) {
            toast.error("Failed to delete ticket");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <span className="badge-v2 badge-warning">Open</span>;
            case 'in_progress':
                return <span className="badge-v2 badge-info">In Progress</span>;
            case 'waiting':
                return <span className="badge-v2 badge-warning">Waiting</span>;
            case 'closed':
                return <span className="badge-v2 badge-success">Closed</span>;
            default:
                return <span className="badge-v2">{status}</span>;
        }
    };

    if (loading) return <Loader text="Fetching support tickets..." />;

    return (
        <div className="admin-page">
            {selectedTicket && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'white', padding: '24px', borderRadius: '12px',
                        width: '90%', maxWidth: '600px', position: 'relative',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <button
                            onClick={() => { setSelectedTicket(null); setAdminComment(""); }}
                            style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                            <X size={24} color="#666" />
                        </button>

                        <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: '700', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                            Support Request Details
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                                <span style={{ fontWeight: '600', color: '#4b5563' }}>Status:</span>
                                <div>{getStatusBadge(selectedTicket.status)}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                                <span style={{ fontWeight: '600', color: '#4b5563' }}>From:</span>
                                <div>
                                     <div style={{ fontWeight: '500' }}>{selectedTicket.user?.name || 'Guest'}</div>
                                     <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Email: {selectedTicket.email}</div>
                                     {selectedTicket.phoneNumber && (
                                         <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Phone: {selectedTicket.phoneNumber}</div>
                                     )}
                                 </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                                <span style={{ fontWeight: '600', color: '#4b5563' }}>Subject:</span>
                                <span style={{ fontWeight: '600', color: '#111827' }}>{selectedTicket.subject}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                <span style={{ fontWeight: '600', color: '#4b5563' }}>Message:</span>
                                <div style={{
                                    background: '#f9fafb', padding: '16px', borderRadius: '8px',
                                    border: '1px solid #e5e7eb', minHeight: '120px', whiteSpace: 'pre-wrap',
                                    lineHeight: '1.5'
                                }}>
                                    {selectedTicket.message}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '0.9rem', color: '#6b7280', marginTop: '10px' }}>
                                <span>Submitted On:</span>
                                <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Admin Comment / Reply</label>
                            <textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                placeholder="Add a comment or internal note..."
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '8px',
                                    border: '1px solid #e2e8f0', minHeight: '80px', fontSize: '0.9rem'
                                }}
                            ></textarea>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                This comment will be sent to the user in their notification.
                            </p>
                        </div>

                        <div style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-outline"
                                style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                                onClick={() => handleDelete(selectedTicket._id)}
                            >
                                <Trash2 size={16} style={{ marginRight: '6px' }} /> Delete
                            </button>

                            {selectedTicket.status !== 'closed' && (
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleStatusUpdate(selectedTicket._id, 'closed')}
                                >
                                    <CheckCircle size={16} style={{ marginRight: '6px' }} /> Mark Resolved
                                </button>
                            )}

                            {selectedTicket.status === 'open' && (
                                <button
                                    className="btn btn-info"
                                    onClick={() => handleStatusUpdate(selectedTicket._id, 'in_progress')}
                                >
                                    <Clock size={16} style={{ marginRight: '6px' }} /> Mark In Progress
                                </button>
                            )}

                            {selectedTicket.status !== 'waiting' && selectedTicket.status !== 'closed' && (
                                <button
                                    className="btn btn-outline"
                                    style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                                    onClick={() => handleStatusUpdate(selectedTicket._id, 'waiting')}
                                >
                                    <Clock size={16} style={{ marginRight: '6px' }} /> Mark Waiting
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <h2 className="page-title">Support Tickets</h2>
                <div className="badge badge-info">{tickets.length} Tickets</div>
            </div>

            <div className="admin-table-container card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User / Email</th>
                            <th>Subject</th>
                            <th>Message Preview</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length > 0 ? tickets.map(ticket => (
                            <tr key={ticket._id}>
                                 <td>
                                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                                         <span style={{ fontWeight: '600', color: '#374151' }}>{ticket.user?.name || 'Guest'}</span>
                                         <span style={{ fontSize: '12px', color: '#6b7280' }}>{ticket.email}</span>
                                         {ticket.phoneNumber && (
                                             <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '500' }}>{ticket.phoneNumber}</span>
                                         )}
                                     </div>
                                 </td>
                                <td>
                                    <span style={{ fontWeight: '500' }}>{ticket.subject}</span>
                                </td>
                                <td style={{ maxWidth: '250px' }}>
                                    <div style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: '13px',
                                        color: '#6b7280'
                                    }}>
                                        {ticket.message}
                                    </div>
                                </td>
                                <td>
                                    {getStatusBadge(ticket.status)}
                                </td>
                                <td style={{ fontSize: '13px' }}>
                                    {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </td>
                                <td>
                                    <div className="admin-product-buttons">
                                        <button className="btn btn-outline btn-sm" title="View Details" onClick={() => setSelectedTicket(ticket)}>
                                            <Eye size={14} />
                                        </button>
                                        <button className="btn btn-danger btn-sm" title="Delete" onClick={() => handleDelete(ticket._id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No support tickets found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSupportTickets;
