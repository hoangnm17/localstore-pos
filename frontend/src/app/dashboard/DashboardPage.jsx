import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    Search, Bell, User, ChevronRight, Users, Box, List, FileText,
    CreditCard, Banknote, AlertTriangle, Package, History, Ticket, Activity, LogOut
} from 'lucide-react';

const DashboardPage = () => {
    const navigate = useNavigate();
    const revenueData = [
        { time: '13:00', amount: 120000 },
        { time: '17:00', amount: 190000 },
        { time: '18:00', amount: 680000 },
        { time: '19:00', amount: 170000 },
        { time: '22:00', amount: 450000 },
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                {/* Top Header */}
                <header className="dashboard-header">
                    <div className="search-bar-container">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Tìm kiếm" className="dashboard-search" />
                    </div>
                    <div className="header-actions">
                        <div className="notification-btn">
                            <Bell size={20} />
                            <span className="notify-dot"></span>
                        </div>
                        <div className="user-profile">
                            <User size={24} />
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="filter-section">
                        <button className="filter-chip active">
                            Hôm nay <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="dashboard-grid">
                        {/* Left Column */}
                        <div className="dashboard-left">
                            <div className="top-stats">
                                <div className="stat-card blue-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Tổng số nhân viên:</span>
                                        <span className="stat-value">14</span>
                                        <span className="stat-sub">Nhân viên nghỉ phép: 2</span>
                                    </div>
                                    <Users className="stat-icon" size={32} />
                                </div>

                                <div className="stat-card green-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Tổng số danh mục: 30</span>
                                        <span className="stat-sub">Tổng số mặt hàng: 178</span>
                                    </div>
                                    <List className="stat-icon" size={32} />
                                </div>
                            </div>

                            <div className="revenue-section">
                                <div className="section-header">
                                    <h3>Doanh thu</h3>
                                    <ChevronRight size={20} />
                                </div>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                tickFormatter={(value) => `${value / 1000}k`}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="dashboard-right">
                            <div className="info-card pink-card">
                                <h4>Báo cáo kinh doanh:</h4>
                                <div className="info-item">
                                    <span>Số hóa đơn:</span>
                                    <span className="fw-bold">36</span>
                                </div>
                                <div className="info-item">
                                    <span>Chuyển khoản:</span>
                                    <span className="fw-bold">30</span>
                                </div>
                                <div className="info-item">
                                    <span>Tiền mặt:</span>
                                    <span className="fw-bold">6</span>
                                </div>
                            </div>

                            <div className="info-card red-card">
                                <div className="info-item">
                                    <span>Số mặt hàng sắp hết hàng:</span>
                                    <span className="fw-bold">8</span>
                                </div>
                                <div className="info-item">
                                    <span>Số đơn nhập hàng mới:</span>
                                    <span className="fw-bold">2</span>
                                </div>
                                <div className="info-item">
                                    <span>Số đơn chỉnh tồn kho mới:</span>
                                    <span className="fw-bold">1</span>
                                </div>
                                <button className="card-action-btn">
                                    Đi tới bảng kê kho hàng <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="info-card gray-card" onClick={() => navigate('/crm')}>
                                <h4>Hoạt động Khuyến Mãi</h4>
                                <div className="info-item">
                                    <span>Voucher đang phát hành:</span>
                                    <span className="fw-bold">5</span>
                                </div>
                                <div className="info-item">
                                    <span>Voucher đã dùng:</span>
                                    <span className="fw-bold">120</span>
                                </div>
                                <div className="info-item">
                                    <span>Chiến dịch Active:</span>
                                    <span className="fw-bold text-success">Mùa Hè Xanh</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Revenue Stats */}
                    <div className="bottom-revenue-grid">
                        <div className="revenue-summary-card blue-light">
                            <span className="label">Tổng thu ngày:</span>
                            <span className="value">7.590.000 VND</span>
                        </div>
                        <div className="revenue-summary-card blue-light">
                            <span className="label">Tổng thu tuần:</span>
                            <span className="value">68.192.050 VND</span>
                        </div>
                        <div className="revenue-summary-card blue-light">
                            <span className="label">Tổng thu tháng:</span>
                            <span className="value">187.040.750 VND</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
