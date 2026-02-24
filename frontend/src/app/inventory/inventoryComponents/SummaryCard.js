import React from 'react';

function SummaryCard({ color, icon, title, value }) {
  return (
    <div className="col-md-3 col-sm-6">
      <div
        className={`card bg-${color} text-white shadow-lg border-0 rounded-4 h-100`}
        style={{ transition: "transform 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <div className="card-body d-flex align-items-center">
          <i className={`bi ${icon} fs-1 me-3 opacity-75`}></i>
          <div>
            <div className="fs-6 fw-light">{title}</div>
            <h4 className="fw-bold mb-0">{value.toLocaleString()}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;