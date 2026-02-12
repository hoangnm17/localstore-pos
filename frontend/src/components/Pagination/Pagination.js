import React, { useState, useEffect } from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const [inputPage, setInputPage] = useState(currentPage);

  // Đồng bộ ô nhập liệu khi trang thay đổi từ bên ngoài
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setInputPage(value);
    }
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter") {
      let page = parseInt(inputPage);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      } else {
        setInputPage(currentPage); // Reset nếu nhập sai
      }
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mt-4 gap-3">
      {/* Hiển thị thông tin tổng quát */}
      <div className="text-muted small">
        Trang <b className="text-dark">{currentPage}</b> / {totalPages}
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Điều hướng nút bấm */}
        <ul className="pagination shadow-sm mb-0 rounded-pill overflow-hidden">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link border-0" onClick={() => onPageChange(currentPage - 1)}>
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link border-0" onClick={() => onPageChange(currentPage + 1)}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>

        {/* Ô nhập số trang chuyển nhanh */}
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">Đến trang:</span>
          <input
            type="text"
            className="form-control form-control-sm text-center shadow-sm border-0 rounded-3"
            style={{ width: "50px", height: "35px", fontWeight: "bold" }}
            value={inputPage}
            onChange={handleInputChange}
            onKeyDown={handleInputSubmit}
          />
        </div>
      </div>

      <style jsx="true">{`
        .page-link {
          padding: 8px 16px;
          color: #495057;
          background-color: #fff;
          transition: all 0.2s;
        }
        .page-link:hover {
          background-color: #e9ecef;
          color: #0d6efd;
        }
        .form-control:focus {
          border: 1px solid #0d6efd !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1) !important;
        }
      `}</style>
    </div>
  );
}