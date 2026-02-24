import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';

const StaffList = () => {
    const [staffs, setStaffs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("asc");
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/staff');
                if (res.success) setStaffs(res.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    // XỬ LÝ TÌM KIẾM, LỌC, SẮP XẾP 
    const filteredData = useMemo(() => {
        let data = staffs.filter(s =>
            (s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phoneNumber.includes(searchTerm)) &&
            (roleFilter === "All" || s.roleName === roleFilter)
        );

        data.sort((a, b) => {
            const nameA = a.fullName.toLowerCase();
            const nameB = b.fullName.toLowerCase();
            return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
        return data;
    }, [staffs, searchTerm, roleFilter, sortOrder]);

    // --- LOGIC CẮT DỮ LIỆU CHO PHÂN TRANG ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="d-flex" style={{ background: '#f8f9fa', minHeight: '100vh' }}>

            {/* 1. SIDEBAR COMPONENT */}
            <Sidebar />

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-grow-1" style={{ padding: '20px' }}>
                <div className="container-fluid p-4">
                    <div className="card shadow border-0 p-4 rounded-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-bold m-0">Quản Lý Nhân Viên</h2>
                            <button className="btn btn-primary px-4 fw-bold" onClick={() => navigate('/staff/create')}>
                                + THÊM MỚI
                            </button>
                        </div>

                        {/* SEARCH & FILTER BAR */}
                        <div className="row g-3 mb-4 p-3 bg-light rounded-3 border">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Tìm kiếm</label>
                                <input type="text" className="form-control shadow-sm" placeholder="Tên, Email hoặc SĐT..."
                                    onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Lọc Vai Trò</label>
                                <select className="form-select shadow-sm" onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="All">Tất cả</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Warehouse">Warehouse</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Sắp xếp (Tên)</label>
                                <select className="form-select shadow-sm" onChange={(e) => setSortOrder(e.target.value)}>
                                    <option value="asc">Tên tăng dần (A-Z)</option>
                                    <option value="desc">Tên giảm dần (Z-A)</option>
                                </select>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle border">
                                <thead className="table-secondary">
                                    <tr className="text-center small">
                                        <th>#</th>
                                        <th className="text-start">Tên nhân viên</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th>Vai trò</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                    {currentItems.map((s, index) => (
                                        <tr key={s.id}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td className="text-start fw-bold">{s.fullName}</td>
                                            <td>{s.username}</td>
                                            <td>{s.phoneNumber}</td>
                                            <td><span className="badge bg-light text-dark border px-2 py-1">{s.roleName}</span></td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-3 fs-5">
                                                    <i className="bi bi-pencil-square text-primary cursor-pointer"
                                                        onClick={() => navigate(`/staff/update`,{ state: { id: s.id }} )}></i>
                                                    <i className="bi bi-eye text-success cursor-pointer"
                                                        onClick={() => navigate(`/staff/detail`)}></i>
                                                    <div className="form-check form-switch">
                                                        <input className="form-check-input" type="checkbox"
                                                            checked={s.isActive === 'active'}
                                                            onChange={() => alert("Mở Popup xác nhận đổi trạng thái!")} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-4 text-secondary">Không tìm thấy dữ liệu phù hợp</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* --- PHẦN ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION) --- */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div className="small text-secondary">
                                Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredData.length)} trên tổng số {filteredData.length} nhân viên
                            </div>
                            <nav>
                                <ul className="pagination pagination-sm m-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffList;