import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { logout } from '../../services/Auth/auth.service';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);

    let currentUser = null;
    try {
        const userString = localStorage.getItem('user');
        currentUser = userString ? JSON.parse(userString) : null;
    } catch (e) {
        console.error("Lỗi đọc thông tin user:", e);
    }
    const roleName = currentUser?.roleName || '';

    const toggleSubMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const allMenuItems = [
        {
            title: 'Tổng Quan', icon: 'bi-grid-1x2-fill', path: '/dashboard',
            roles: ['Manager']
        },
        {
            title: 'Bán Hàng', icon: 'bi-cart-plus-fill', path: '/sales',
            roles: ['Manager', 'Cashier']
        },
        {
            title: 'Đơn Hàng', icon: 'bi-receipt', id: 'orders',
            roles: ['Manager', 'Cashier'],
            children: [
                { title: 'Danh sách đơn hàng', path: '/invoices' },
                { title: 'Danh sách hoàn hàng', path: '/returns' }
            ]
        },
        {
            title: 'Kho Hàng', icon: 'bi-box-seam-fill', id: 'inventory',
            roles: ['Manager', 'Warehouse'],
            children: [
                { title: 'Quản lý kho', path: '/inventory/menu' },
                { title: 'Nhập kho hàng hoàn trả', path: '/return-items' }
            ]
        },
        {
            title: 'Sản phẩm', icon: 'bi-box-fill', id: 'products',
            roles: ['Manager', 'Warehouse'],
            children: [
                { title: 'Danh mục sản phẩm', path: '/categories/list' },
                { title: 'Danh sách sản phẩm', path: '/products/list' }
            ]
        },
        {
            title: 'Khuyến Mãi', icon: 'bi-ticket-perforated-fill', path: '/crm',
            roles: ['Manager']
        },
        {
            title: 'Nhân Sự', icon: 'bi-people-fill', id: 'staff',
            roles: ['Manager'],
            children: [{ title: 'Danh sách nhân viên', path: '/staff' }]
        },
        {
            title: 'Quản lý ca', icon: 'bi-clock-fill', id: 'shifts',
            roles: ['Manager'],
            children: [
                { title: 'Danh sách ca', path: '/shifts' },
                { title: 'Phân công lịch', path: '/schedule' }
            ]
        },
        {
            title: 'Báo Cáo', icon: 'bi-bar-chart-line-fill', id: 'reports',
            roles: ['Manager'],
            children: [{ title: 'Báo cáo lương', path: '/salary' },
            { title: 'Báo cáo bàn giao tiền', path: '/handover-report' },
            ]
        },
        {
            title: 'Lịch Của Tôi', icon: 'bi-calendar-week-fill', path: '/my-schedule',
            roles: ['Cashier', 'Manager']
        },
        {
            title: 'Hồ Sơ Của Tôi', 
            icon: 'bi-person-badge-fill', 
            path: '/my-profile',
            roles: ['Manager', 'Cashier', 'Warehouse'] 
        }
    ];

    const menuItems = allMenuItems.filter(item =>
        !item.roles || item.roles.includes(roleName)
    );

    return (
        <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && <span className="logo-brand">LOCAL STORE</span>}
                <div className="toggle-btn-wrapper" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <i className={`bi ${isCollapsed ? 'bi-caret-right-square-fill' : 'bi-caret-left-square-fill'}`}></i>
                </div>
            </div>

            {!isCollapsed && (
                <div style={{
                    padding: '10px 16px',
                    margin: '0 12px 12px',
                    background: roleName === 'Manager' ? 'rgba(81, 204, 237, 1)'
                        : roleName === 'Cashier' ? 'rgba(34,197,94,1)'
                            : 'rgba(251,146,60,1)',
                    borderRadius: '10px',
                    color: '#fff'
                }}>
                    <div className="fw-bold" style={{ fontSize: '0.85rem' }}>
                        <i className={`bi ${roleName === 'Manager' ? 'bi-shield-check' : 'bi-person-badge'} me-2`} />
                        {roleName || 'Không xác định'}
                    </div>
                    {currentUser?.fullName && (
                        <div className="text-truncate mt-1" style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                            {currentUser.fullName}
                        </div>
                    )}
                </div>
            )}

            <div className="sidebar-content">
                {menuItems.map((item) => (
                    <div key={item.title}>
                        <div
                            className={`menu-item ${(item.path && location.pathname.includes(item.path)) || (item.children && item.children.some(c => location.pathname.includes(c.path))) ? 'active' : ''}`}
                            onClick={() => item.children ? toggleSubMenu(item.id) : navigate(item.path)}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            {!isCollapsed && (
                                <>
                                    <span className="menu-title">{item.title}</span>
                                    {item.children && (
                                        <i className={`bi bi-chevron-down arrow-icon ${openMenus[item.id] ? 'rotate-180' : ''}`}></i>
                                    )}
                                </>
                            )}
                        </div>

                        {!isCollapsed && item.children && openMenus[item.id] && (
                            <div className="sub-menu-list">
                                {item.children.map(child => (
                                    <div
                                        key={child.title}
                                        className={`sub-item ${location.pathname.includes(child.path) ? 'active-sub' : ''}`}
                                        onClick={() => navigate(child.path)}
                                        style={location.pathname.includes(child.path) ? { color: '#0d6efd', fontWeight: 'bold' } : {}}
                                    >
                                        • {child.title}
                                    </div>
                                ))}
                            </div>
                        )}


                    </div>
                ))}
            </div>

            {/* Logout Footer */}
            <>
                <div className="sidebar-footer" onClick={() => setShowModal(true)}>
                    <i className="bi bi-box-arrow-right fs-4"></i>
                    {!isCollapsed && <span>ĐĂNG XUẤT</span>}
                </div>

                {showModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Xác nhận thoát</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body text-center py-4">
                                    <i className="bi bi-exclamation-triangle text-warning display-4"></i>
                                    <p className="mt-3 text-secondary">Bạn có chắc chắn muốn kết thúc phiên làm việc không?</p>
                                </div>
                                <div className="modal-footer border-0 justify-content-center pb-4 pt-0">
                                    <button className="btn btn-light px-4 fw-bold" style={{ borderRadius: '10px' }} onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                    <button className="btn btn-danger px-4 fw-bold" style={{ borderRadius: '10px' }} onClick={logout}>Đăng xuất ngay</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        </div>
    );
};

export default Sidebar;