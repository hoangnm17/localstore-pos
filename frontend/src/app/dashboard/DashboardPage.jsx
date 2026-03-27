import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Search, Bell, User, ChevronRight, Users, List, Wallet
} from 'lucide-react';
import api from '../../services/axiosInstance';

const DashboardPage = () => {
    const navigate = useNavigate();

    // States cho dữ liệu thật 
    const [summary, setSummary] = useState(null);
    const [categoryStock, setCategoryStock] = useState([]); // State cho tồn kho theo danh mục
    const [totalSelling, setTotalSelling] = useState(0); // State cho sản phẩm đang kinh doanh
    const [currentShiftCash, setCurrentShiftCash] = useState(null); // State cho tiền mặt ca hiện tại
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await api.get('/dashboard/summary');
            const result = res.data || res;

            if (result.success) {
                setSummary(result.data);
            } else {
                setErrorMsg(`Lỗi Server: ${result.message || 'Hành động không được phép'}`);
            }
        } catch (error) {
            const status = error.response ? error.response.status : 'Network Error';
            const msg = error.response?.data?.message || error.message;
            setErrorMsg(`Không thể kết nối (${status}): ${msg}`);
            console.error('Lỗi lấy dữ liệu dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventoryData = async () => {
        try {
            const res = await api.get('/inventory/categories?limit=5'); 
            if (res.data.success) {
                setCategoryStock(res.data.data.categories || []);
            }
        } catch (error) {
            console.error("Lỗi lấy tồn kho:", error);
        }
    };

    const fetchSellingProducts = async () => {
        try {
            const res = await api.get('/products/pos'); 
            if (res.data.success) {
                setTotalSelling(res.data.data.length || 0);
            }
        } catch (error) {
            console.error("Lỗi lấy sản phẩm kinh doanh:", error);
        }
    };

    // Hàm lấy tiền mặt ca làm việc hiện tại
    const fetchCurrentShiftCash = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            // 1. Lấy danh sách ca cần chốt để tìm ca hiện tại
            const shiftRes = await api.get(`/cashier/handover/pending?workDate=${today}`);
            if (shiftRes.data.success && shiftRes.data.data.length > 0) {
                const currentShift = shiftRes.data.data[0]; // Lấy ca đầu tiên phát hiện được
                // 2. Lấy tiền mặt hệ thống của ca đó
                const cashRes = await api.get(`/cashier/handover/system-cash?scheduleId=${currentShift.scheduleId}`);
                if (cashRes.data.success) {
                    setCurrentShiftCash({
                        amount: cashRes.data.data.systemCash,
                        shiftName: currentShift.shiftName
                    });
                }
            }
        } catch (error) {
            console.error("Lỗi lấy tiền mặt ca hiện tại:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchInventoryData();
        fetchSellingProducts();
        fetchCurrentShiftCash();
    }, []);

    // Fallback data dùng cho UI rỗng hoặc chưa load xong
    const data = summary || {
        summary: { totalStaff: 0, staffOnLeave: 0, totalCategories: 0, totalProducts: 0, totalVouchers: 0, usedVouchers: 0, totalPromotions: 0 },
        revenue: { todayRevenue: 0, weekRevenue: 0, monthRevenue: 0 },
        payments: { total: 0, bank_transfer: 0, cash: 0 },
        inventory: { lowStock: 0, newPO: 0, newAdjustments: 0 },
        chartData: [{ time: '08:00', amount: 0 }]
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Đang tải dữ liệu...</p></div>;
    }

    return (
        <div className="dashboard-layout">
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
                        <div className="user-profile" onClick={() => navigate('/staff')}>
                            <User size={24} />
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="filter-section">
                        <button className="filter-chip active" onClick={() => { fetchDashboardData(); fetchInventoryData(); fetchSellingProducts(); fetchCurrentShiftCash(); }}>
                            Làm mới dữ liệu <ChevronRight size={14} />
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="error-banner" style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                            ⚠️ <strong>Thông báo:</strong> {errorMsg} (Vui lòng thử đăng xuất và đăng nhập lại)
                        </div>
                    )}

                    <div className="dashboard-grid">
                        {/* Left Column */}
                        <div className="dashboard-left">
                            <div className="top-stats">
                                <div className="stat-card blue-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Tổng số nhân viên:</span>
                                        <span className="stat-value">{data.summary.totalStaff}</span>
                                        <span className="stat-sub">Nhân viên nghỉ phép: {data.summary.staffOnLeave}</span>
                                    </div>
                                    <Users className="stat-icon" size={32} />
                                </div>

                                <div className="stat-card green-card">
                                    <div className="stat-info">
                                        <span className="stat-label">Danh mục: {data.summary.totalCategories}</span>
                                        <span className="stat-value">{totalSelling}</span>
                                        <span className="stat-sub">Sản phẩm đang kinh doanh (POS)</span>
                                    </div>
                                    <List className="stat-icon" size={32} />
                                </div>
                            </div>

                            <div className="revenue-section">
                                <div className="section-header">
                                    <h3>Doanh thu theo giờ (Hôm nay)</h3>
                                    <ChevronRight size={20} />
                                </div>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={data.chartData}>
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
                                <h4>Báo cáo bán hàng hôm nay:</h4>
                                <div className="info-item">
                                    <span>Số hóa đơn:</span>
                                    <span className="fw-bold">{data.payments.total}</span>
                                </div>
                                <div className="info-item">
                                    <span>Chuyển khoản:</span>
                                    <span className="fw-bold text-success">{formatMoney(data.payments.bank_transfer)}</span>
                                </div>
                                <div className="info-item">
                                    <span>Tiền mặt (Toàn ngày):</span>
                                    <span className="fw-bold text-warning">{formatMoney(data.payments.cash)}</span>
                                </div>
                                
                                {currentShiftCash && (
                                    <div className="info-item" style={{ marginTop: 8, padding: 8, background: 'rgba(255,255,255,0.4)', borderRadius: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#be185d' }}>
                                            <Wallet size={14} />
                                            <span>Tiền mặt trong két ({currentShiftCash.shiftName}):</span>
                                        </div>
                                        <span className="fw-bold" style={{ fontSize: 15, color: '#be185d' }}>{formatMoney(currentShiftCash.amount)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tồn kho theo danh mục dùng API mới */}
                            <div className="info-card red-card">
                                <h4>Tồn kho theo danh mục</h4>
                                {categoryStock.map(cat => (
                                    <div className="info-item" key={cat.categoryId}>
                                        <span>{cat.categoryName}:</span>
                                        <span className="fw-bold">{cat.totalProducts} SP</span>
                                    </div>
                                ))}
                                <button className="card-action-btn" onClick={() => navigate('/inventory/categories')}>
                                    Xem chi tiết kho <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="info-card gray-card" onClick={() => navigate('/crm')}>
                                <h4>Marketing & Loyalty</h4>
                                <div className="info-item">
                                    <span>Voucher đang hiệu lực:</span>
                                    <span className="fw-bold text-primary">{data.summary.totalVouchers}</span>
                                </div>
                                <div className="info-item">
                                    <span>Tổng Voucher đã dùng:</span>
                                    <span className="fw-bold">{data.summary.usedVouchers}</span>
                                </div>
                                <div className="info-item">
                                    <span>KM đang chạy:</span>
                                    <span className="fw-bold text-danger">{data.summary.totalPromotions}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Revenue Stats */}
                    <div className="bottom-revenue-grid">
                        <div className="revenue-summary-card blue-light">
                            <span className="label">Tổng thu ngày:</span>
                            <span className="value">{formatMoney(data.revenue.todayRevenue)}</span>
                        </div>
                        <div className="revenue-summary-card blue-light">
                            <span className="label">Doanh thu tuần:</span>
                            <span className="value">{formatMoney(data.revenue.weekRevenue)}</span>
                        </div>
                        <div className="revenue-summary-card blue-light">
                            <span className="label">Doanh thu tháng (30 ngày):</span>
                            <span className="value">{formatMoney(data.revenue.monthRevenue)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
