import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSubMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const menuItems = [
        { title: 'Tổng Quan', icon: 'bi-grid-1x2-fill', path: '/dashboard' },
        { title: 'Bán Hàng', icon: 'bi-cart-plus-fill', path: '/sales' },
        { 
            title: 'Đơn Hàng', icon: 'bi-receipt', id: 'orders',
            children: [{ title: 'Danh sách đơn', path: '/orders' }] 
        },
        { 
            title: 'Kho Hàng', icon: 'bi-box-seam-fill', id: 'inventory',
            children: [{ title: 'Tồn kho', path: '/inventory' }, { title: 'Nhập kho', path: '/inventory/import' }] 
        },
        { title: 'Sản Phẩm', icon: 'bi-archive-fill', path: '/products' },
        { title: 'Khuyến Mãi', icon: 'bi-ticket-perforated-fill', path: '/promo' },
        { 
            title: 'Nhân Sự', icon: 'bi-people-fill', id: 'staff',
            children: [{ title: 'Danh sách nhân viên', path: '/staff' }] 
        },
        { title: 'Báo Cáo', icon: 'bi-bar-chart-line-fill', path: '/reports' },
    ];

    return (
        <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && <span className="logo-brand">LOCAL STORE</span>}
                <div className="toggle-btn-wrapper" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <i className={`bi ${isCollapsed ? 'bi-caret-right-square-fill' : 'bi-caret-left-square-fill'}`}></i>
                </div>
            </div>

            <div className="sidebar-content">
                {menuItems.map((item) => (
                    <div key={item.title}>
                        <div 
                            className={`menu-item ${location.pathname.includes(item.path || item.id) ? 'active' : ''}`}
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
                                    <div key={child.title} className="sub-item" onClick={() => navigate(child.path)}>
                                        • {child.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="sidebar-footer" onClick={() => navigate('/login')}>
                <i className="bi bi-box-arrow-right fs-4"></i>
                {!isCollapsed && <span>ĐĂNG XUẤT</span>}
            </div>
        </div>
    );
};

export default Sidebar;