import React, { useState, useEffect } from 'react';
import './CRMPage.css';
import { getCustomers, getPromotions, getVouchers } from '../../services/crm.service';

const CRMPage = () => {
    const [activeTab, setActiveTab] = useState('customers');
    const [loading, setLoading] = useState(false);

    // Data states
    const [customers, setCustomers] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [vouchers, setVouchers] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'customers') {
                const res = await getCustomers({ limit: 100 });
                setCustomers(res.data);
            } else if (activeTab === 'promotions') {
                const res = await getPromotions();
                setPromotions(res.data.data);
            } else if (activeTab === 'vouchers') {
                const res = await getVouchers();
                setVouchers(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crm-container">
            <header className="crm-header">
                <h1 className="crm-title">Marketing & Loyalty</h1>
                <div className="actions">
                    <button className="btn-primary">
                        <i className="bi bi-plus-lg"></i> Create New
                    </button>
                </div>
            </header>

            <div className="crm-tabs">
                <button
                    className={`crm-tab ${activeTab === 'customers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('customers')}
                >
                    Customers
                </button>
                <button
                    className={`crm-tab ${activeTab === 'promotions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('promotions')}
                >
                    Promotions
                </button>
                <button
                    className={`crm-tab ${activeTab === 'vouchers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vouchers')}
                >
                    Vouchers
                </button>
            </div>

            <main className="crm-content">
                {activeTab === 'customers' && (
                    <div className="glass-panel">
                        <div className="toolbar" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <input type="text" className="search-input" placeholder="Search customers..." />
                        </div>
                        <div className="crm-table-container">
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Loyalty Points</th>
                                        <th>Total Spending</th>
                                        <th>Status</th>
                                        <th>Joined At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', opacity: 0.5 }}>No customers found</td></tr>
                                    ) : (
                                        customers.map(c => (
                                            <tr key={c.id}>
                                                <td style={{ fontWeight: 500 }}>{c.name}</td>
                                                <td>{c.phone}</td>
                                                <td style={{ color: '#fbbf24', fontWeight: 'bold' }}>{c.loyaltyPoints} pts</td>
                                                <td>{c.totalSpending.toLocaleString()} đ</td>
                                                <td>
                                                    <span className={`status-badge ${c.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'promotions' && (
                    <div className="promo-grid">
                        {promotions.length === 0 ? <p style={{ opacity: 0.5 }}>No promotions active</p> : promotions.map(p => (
                            <div className="promo-card" key={p.id}>
                                <h3 className="promo-title">{p.name}</h3>
                                <div className="promo-value">
                                    {p.type === 'Percent' ? `${p.value}% OFF` : `-${p.value.toLocaleString()} đ`}
                                </div>
                                <div className="promo-meta">
                                    <span>Type: {p.type}</span>
                                    <span className={p.status === 'Active' ? 'status-active' : 'status-inactive'}>{p.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'vouchers' && (
                    <div className="promo-grid">
                        {vouchers.map(v => (
                            <div className="promo-card" key={v.id} style={{ borderStyle: 'dashed' }}>
                                <h3 className="promo-title" style={{ fontFamily: 'monospace' }}>{v.code}</h3>
                                <div className="promo-value">
                                    {v.value.toLocaleString()} đ
                                </div>
                                <div className="promo-meta">
                                    <span>Expires: {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : 'Never'}</span>
                                    <span>{v.currentUsage} / {v.maxUsage} used</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CRMPage;
