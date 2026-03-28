import React, { useState } from 'react';
import useCategories from '../../../hooks/category/useCategories';
import useCategoryForm from '../../../hooks/category/useCategoryForm';
import CategoryModal from '../ui/CategoryModal';
import Pagination from '../../../components/Pagination/Pagination';
import '../../product/pm-theme.css';
import { useNotification } from '../../../components/global/Notification/NotificationContext';

export default function CategoryPage() {
    const { showNotification } = useNotification();

    const [confirmState, setConfirmState] = useState({ open: false, message: '', onOk: null });
    const onConfirm = ({ message, onOk }) => setConfirmState({ open: true, message, onOk });
    const handleConfirmOk = () => {
        confirmState.onOk?.();
        setConfirmState({ open: false, message: '', onOk: null });
    };
    const handleConfirmCancel = () => setConfirmState({ open: false, message: '', onOk: null });

    const [editId, setEditId] = useState(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    const { categories, pagination, reload, deleteCategory } = useCategories({
        showNotification,
        onConfirm,
        search,
        page: currentPage,
        limit: PAGE_SIZE
    });

    const formHook = useCategoryForm(editId, { showNotification });

    function openCreate() {
        setEditId(null);
        formHook.resetForm();
        setOpen(true);
    }

    function openEdit(id) {
        setEditId(id);
        setOpen(true);
    }

    function handleCloseModal() {
        setOpen(false);
        setEditId(null);
        formHook.resetForm();
    }

    function handleDone() {
        const isEditing = !!editId;
        setOpen(false);
        setEditId(null);
        formHook.resetForm();
        reload();
        showNotification(isEditing ? 'Cập nhật danh mục thành công.' : 'Tạo danh mục thành công.', 'success');
    }

    return (
        <div className="pm-page">
            <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
                <div className="input-group" style={{ maxWidth: 340 }}>
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Tìm kiếm danh mục..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-circle me-2" />
                    Tạo danh mục mới
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle">
                    <thead className="pm-thead text-center">
                        <tr>
                            <th style={{ width: 48 }}>#</th>
                            <th className="text-start">Tên danh mục</th>
                            <th style={{ width: 130 }}>SL sản phẩm</th>
                            <th style={{ width: 130 }}>Trạng thái</th>
                            <th style={{ width: 110 }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center text-muted py-4">
                                    Không có danh mục nào
                                </td>
                            </tr>
                        ) : (
                            categories.map((item, index) => (
                                <CategoryTableRow
                                    key={item.id}
                                    item={item}
                                    index={(currentPage - 1) * PAGE_SIZE + index + 1}
                                    level={0}
                                    onEdit={openEdit}
                                    onDelete={deleteCategory}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
            />

            <CategoryModal
                {...formHook}
                open={open}
                isEdit={!!editId}
                editId={editId}
                onClose={handleCloseModal}
                onDone={handleDone}
            />

            {confirmState.open && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,21,41,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: '28px 32px',
                            minWidth: 340,
                            maxWidth: 480,
                            boxShadow: '0 8px 40px rgba(0,21,41,0.25)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <i className="bi bi-exclamation-triangle-fill" style={{ color: '#faad14', fontSize: '1.5rem' }} />
                            <strong style={{ fontSize: '1rem' }}>Xác nhận</strong>
                        </div>
                        <p style={{ margin: '0 0 24px', color: '#334155' }}>{confirmState.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button className="btn btn-light" onClick={handleConfirmCancel}>Hủy</button>
                            <button className="btn btn-danger" onClick={handleConfirmOk}>Xác nhận xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CategoryTableRow({ item, index, level, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const canDelete = item.totalProductCount === 0;

    const indent = level * 20;

    return (
        <>
            <tr>
                <td className="text-center">{level === 0 ? index : ''}</td>

                <td>
                    <div style={{ paddingLeft: indent, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {hasChildren ? (
                            <button
                                className="btn btn-link btn-sm p-0 text-dark"
                                onClick={() => setExpanded(p => !p)}
                                title={expanded ? 'Thu gọn' : 'Mở rộng'}
                            >
                                <i className={`bi ${expanded ? 'bi-caret-down-fill' : 'bi-caret-right-fill'} text-primary`}></i>
                            </button>
                        ) : (
                            <span style={{ width: 16, display: 'inline-block' }}>
                                {level > 0 && <i className="bi bi-arrow-right-short text-muted"></i>}
                            </span>
                        )}
                        <span>{item.name}</span>
                    </div>
                </td>

                <td className="text-center">{item.totalProductCount ?? 0}</td>

                <td className="text-center">
                    {item.status === 0 || item.status === false
                        ? <span className="badge bg-secondary">Ngừng bán</span>
                        : <span className="badge bg-success">Đang bán</span>}
                </td>

                <td className="text-center">
                    <button
                        className="btn btn-link btn-sm p-0 me-2 text-warning"
                        onClick={() => onEdit(item.id)}
                        title="Sửa"
                    >
                        <i className="bi bi-pencil-square fs-5"></i>
                    </button>

                    <button
                        className="btn btn-link btn-sm p-0 text-danger"
                        onClick={() => canDelete && onDelete(item.id)}
                        disabled={!canDelete}
                        title={canDelete ? 'Xóa' : 'Không thể xóa vì có sản phẩm'}
                    >
                        <i className="bi bi-trash fs-5"></i>
                    </button>
                </td>
            </tr>

            {hasChildren && expanded && item.children.map(child => (
                <CategoryTableRow
                    key={child.id}
                    item={child}
                    index={null}
                    level={level + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
}