import React, { useState, useEffect, useRef } from 'react';
import categoryService from '../../../services/Category/category.service';
import CategoryModal from '../../category/ui/CategoryModal';
import useCategoryForm from '../../../hooks/category/useCategoryForm';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import { flattenTree } from '../../../utils/categoryTree';

export default function CategorySelector({ value, onChange, categories: initialCategories }) {
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState(initialCategories || []);
    const [isOpen, setIsOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const dropdownRef = useRef(null);
    const { showNotification } = useNotification();
    const categoryForm = useCategoryForm(null, { showNotification });

    // Close dropdown when click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const reloadCategories = async () => {
        try {
            const res = await categoryService.fetchCategoryTree('', 1, 9999);
            setCategories(flattenTree(res.data || []));
        } catch (err) {
            console.error('Failed to reload categories:', err);
        }
    };

    useEffect(() => {
        reloadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleDone = async () => {
        await reloadCategories();
        setShowModal(false);
        showNotification('Tạo danh mục thành công.', 'success');
    };

    const selectedCategory = categories.find(c => c.id === value);

    // Filter categories by search keyword
    const filteredCategories = searchKeyword
        ? categories.filter(cat =>
            cat.name.toLowerCase().includes(searchKeyword.toLowerCase())
        )
        : categories;

    const handleSelectCategory = (category) => {
        if (!category.hasChildren) {
            onChange(category.id);
            setIsOpen(false);
            setSearchKeyword('');
        }
    };

    return (
        <>
            <label className="form-label fw-semibold">Danh mục</label>
            <div className="input-group" ref={dropdownRef}>
                <div
                    className="form-control d-flex align-items-center justify-content-between"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span style={{ color: value ? '#000' : '#6c757d' }}>
                        {selectedCategory ? selectedCategory.name : 'Chọn danh mục'}
                    </span>
                    <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowModal(true)}
                    title="Tạo danh mục mới"
                >
                    <i className="bi bi-plus-lg" />
                </button>

                {/* Custom Dropdown */}
                {isOpen && (
                    <div
                        className="position-absolute w-100 bg-white border rounded shadow-lg"
                        style={{
                            top: '100%',
                            left: 0,
                            zIndex: 1050,
                            marginTop: '4px',
                            maxHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Search box */}
                        <div className="p-2 border-bottom">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Tìm kiếm danh mục..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Scrollable list */}
                        <div
                            style={{
                                overflowY: 'auto',
                                maxHeight: '320px'
                            }}
                        >
                            {filteredCategories.length === 0 ? (
                                <div className="p-3 text-center text-muted">
                                    Không tìm thấy danh mục
                                </div>
                            ) : (
                                filteredCategories.map((category) => {
                                    const indent = '　'.repeat(category.level);
                                    const arrow = category.level > 0 ? '└─ ' : '';
                                    const prefix = indent + arrow;
                                    const isDisabled = category.hasChildren;
                                    const isSelected = category.id === value;

                                    return (
                                        <div
                                            key={category.id}
                                            className={`px-3 py-2 ${isSelected ? 'bg-primary text-white' : ''} ${!isDisabled ? 'cursor-pointer' : ''}`}
                                            style={{
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                color: isDisabled ? '#999' : isSelected ? '#fff' : '#000',
                                                fontStyle: isDisabled ? 'italic' : 'normal',
                                                fontWeight: category.level === 0 ? 'bold' : 'normal',
                                                backgroundColor: isSelected ? '#0d6efd' : 'transparent'
                                            }}
                                            onClick={() => handleSelectCategory(category)}
                                            onMouseEnter={(e) => {
                                                if (!isDisabled && !isSelected) {
                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isDisabled && !isSelected) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            {prefix}{category.name}
                                            {isDisabled && <span className="ms-2 small">(danh mục cha)</span>}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            <CategoryModal
                {...categoryForm}
                open={showModal}
                isEdit={false}
                editId={null}
                onClose={() => setShowModal(false)}
                onDone={handleDone}
            />
        </>
    );
}