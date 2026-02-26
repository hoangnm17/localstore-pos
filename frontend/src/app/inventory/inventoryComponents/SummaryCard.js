import React from 'react';

// src/components/SummaryCard.jsx (hoặc inventoryComponents/SummaryCard.jsx)
function SummaryCard({
  color = 'primary',
  icon,
  title,
  value,
  trend,
  isCurrency = false,
}) {
  const formatValue = (val) => {
    if (val == null) return '0';
    if (isCurrency) {
      return val.toLocaleString('vi-VN') + ' ₫';
    }
    return val.toLocaleString('vi-VN');
  };

  return (
    <div className="col-md-4 col-sm-6 col-12">  {/* ← thay col-md-3 thành col-md-4 */}
      <div
        className={`card bg-${color} text-white shadow-lg border-0 rounded-4 h-100 overflow-hidden`}
        style={{
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }}
      >
        <div className="card-body d-flex align-items-center p-4">
          <div className="me-4">
            <i className={`bi ${icon} fs-2 opacity-85`} style={{ minWidth: '48px' }}></i>
          </div>
          <div className="flex-grow-1">
            <div className="fs-6 fw-light opacity-90 mb-1">{title}</div>
            <h4 className="fw-bold mb-0 fs-3">
              {formatValue(value)}
            </h4>
            {trend && (
              <small
                className={`d-block mt-1 fw-medium ${
                  trend.startsWith('+') ? 'text-success' : 'text-danger'
                }`}
              >
                {trend.startsWith('+') ? '↑ ' : '↓ '}
                {trend}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;