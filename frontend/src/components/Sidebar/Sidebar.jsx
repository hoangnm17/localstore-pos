import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar1.css";

const menuItems = [
    { label: "Tổng Quan", path: "/dashboard", icon: "bi-speedometer2" },
    { label: "Bán Hàng", path: "/sales", icon: "bi-cart3" },
    {
        label: "Đơn Hàng",
        icon: "bi-receipt",
        children: [
            { label: "Danh sách đơn", path: "/orders" },
            { label: "Trả hàng", path: "/orders/returns" },
        ],
    },
    {
        label: "Kho Hàng",
        icon: "bi-box-seam",
        children: [
            { label: "Tồn kho", path: "/inventory" },
            { label: "Nhập hàng", path: "/inventory/import" },
        ],
    },
    {
        label: "Sản Phẩm",
        icon: "bi-tag",
        children: [
            { label: "Danh sách", path: "/products" },
            { label: "Danh mục", path: "/categories" },
        ],
    },
    {
        label: "Khuyến Mãi",
        icon: "bi-percent",
        children: [
            { label: "Voucher", path: "/promotions/vouchers" },
            { label: "Chương trình", path: "/promotions/programs" },
        ],
    },
    {
        label: "Nhân Sự",
        icon: "bi-people",
        children: [
            { label: "Nhân viên", path: "/staff" },
            { label: "Ca làm việc", path: "/staff/shifts" },
        ],
    },
    {
        label: "Báo Cáo",
        icon: "bi-bar-chart-line",
        children: [
            { label: "Doanh thu", path: "/reports/revenue" },
            { label: "Sản phẩm", path: "/reports/products" },
        ],
    },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const navigate = useNavigate();

    function toggleCollapse() {
        setCollapsed((prev) => !prev);
        if (!collapsed) setOpenMenus({});
    }

    function toggleMenu(label) {
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    }

    function handleLogout() {
        // TODO: clear auth token/session
        navigate("/login");
    }

    return (
        <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
            {/* Brand */}
            <div className="sidebar__brand">
                {!collapsed && <span className="sidebar__brand-text">LocalStore POS</span>}
                <button
                    className="sidebar__toggle"
                    onClick={toggleCollapse}
                    title={collapsed ? "Mở rộng" : "Thu gọn"}
                >
                    <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar__nav">
                {menuItems.map((item) =>
                    item.children ? (
                        // Group with dropdown
                        <div key={item.label} className="sidebar__group">
                            <button
                                className={`sidebar__item sidebar__item--group ${openMenus[item.label] ? "sidebar__item--open" : ""}`}
                                onClick={() => !collapsed && toggleMenu(item.label)}
                                title={collapsed ? item.label : ""}
                            >
                                <i className={`bi ${item.icon} sidebar__icon`}></i>
                                {!collapsed && (
                                    <>
                                        <span className="sidebar__label">{item.label}</span>
                                        <i
                                            className={`bi bi-chevron-down sidebar__arrow ${openMenus[item.label] ? "sidebar__arrow--open" : ""}`}
                                        ></i>
                                    </>
                                )}
                            </button>

                            {/* Submenu */}
                            {!collapsed && openMenus[item.label] && (
                                <div className="sidebar__submenu">
                                    {item.children.map((child) => (
                                        <NavLink
                                            key={child.path}
                                            to={child.path}
                                            className={({ isActive }) =>
                                                `sidebar__subitem ${isActive ? "sidebar__subitem--active" : ""}`
                                            }
                                        >
                                            <i className="bi bi-dash sidebar__subicon"></i>
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Single link
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar__item ${isActive ? "sidebar__item--active" : ""}`
                            }
                            title={collapsed ? item.label : ""}
                        >
                            <i className={`bi ${item.icon} sidebar__icon`}></i>
                            {!collapsed && <span className="sidebar__label">{item.label}</span>}
                        </NavLink>
                    )
                )}
            </nav>

            {/* Logout */}
            <div className="sidebar__footer">
                <button className="sidebar__logout" onClick={handleLogout} title="Đăng xuất">
                    <i className="bi bi-box-arrow-left sidebar__icon"></i>
                    {!collapsed && <span className="sidebar__label">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
}