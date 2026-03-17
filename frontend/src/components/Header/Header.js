import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const PAGE_TITLES = {
    '/dashboard': 'Tổng Quan',
    '/sales': 'Bán Hàng',
    '/invoices': 'Danh Sách Đơn Hàng',
    '/inventory/menu': 'Kho Hàng',
    '/categories': 'Danh Mục Sản Phẩm',
    '/products/list': 'Danh Sách Sản Phẩm',
    '/crm': 'Khuyến Mãi',
    '/staff': 'Nhân Sự',
    '/shifts': 'Danh Sách Ca',
    '/schedule': 'Thời Khóa Biểu',
    '/reports': 'Báo Cáo',
    '/salary': 'Báo Cáo Lương',
    '/my-schedule': 'Lịch của tôi',
    '/handover-report':'Báo Cáo Bàn Giao Tiền Mặt',
};

const ROLE_LABELS = {
    Manager: 'Quản lý',
    Cashier: 'Thu ngân',
    Warehouse: 'Thủ kho',
};

function getPageTitle(pathname) {
    const match = Object.entries(PAGE_TITLES).find(([key]) =>
        pathname === key || pathname.startsWith(key + '/')
    );
    return match ? match[1] : 'LocalStore POS';
}

function Header() {
    const location = useLocation();
    const { user, roleName } = useAuth();

    const pageTitle = getPageTitle(location.pathname);
    const displayName = user?.fullName || user?.username || 'Người dùng';
    const displayRole = ROLE_LABELS[roleName] || roleName || 'Nhân viên';

    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <header className="top-header">
            <div className="top-header__left">
                <h1 className="top-header__title">{pageTitle}</h1>
                <span className="top-header__date">{dateStr}</span>
            </div>

            <div className="top-header__right">
                <div className="top-header__user">
                    <div className="top-header__avatar">
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="top-header__user-info">
                        <span className="top-header__user-name">{displayName}</span>
                        <span className="top-header__user-role">{displayRole}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;