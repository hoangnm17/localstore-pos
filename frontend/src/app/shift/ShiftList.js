import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import api from '../../services/axiosInstance';

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create' or 'edit'
  const [selectedShift, setSelectedShift] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({}); 

  const navigate = useNavigate();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shifts');
      if (response.data && response.data.success) {
        setShifts(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi fetch shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, shift = null) => {
    setModalType(type);
    setFieldErrors({});
    if (type === 'edit' && shift) {
      setSelectedShift(shift);
      setFormData({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime
      });
    } else {
      setFormData({ name: '', startTime: '', endTime: '' });
    }
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShift(null);
    setFormData({ name: '', startTime: '', endTime: '' });
    setFieldErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: '' });
    setErrorMsg('');
  };

const validateForm = () => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Tên ca làm việc không được để trống!";
  } else if (formData.name.length < 3) {
    errors.name = "Tên ca làm việc phải có ít nhất 3 ký tự!";
  } else if (formData.name.length > 50) {
    errors.name = "Tên ca làm việc không được quá 50 ký tự!";
  }

  if (!formData.startTime) {
    errors.startTime = "Vui lòng chọn giờ bắt đầu!";
  }

  if (!formData.endTime) {
    errors.endTime = "Vui lòng chọn giờ kết thúc!";
  }

  if (formData.startTime && formData.endTime) {
    
    if (formData.startTime >= formData.endTime) {
      errors.endTime = "Giờ kết thúc phải sau giờ bắt đầu!";
    } 
    else {
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      const end = new Date(`2000-01-01T${formData.endTime}:00`);
      const diffMinutes = (end - start) / (1000 * 60);
      
      // Kiểm tra thời gian tối thiểu
      if (diffMinutes < 30) {
        errors.endTime = "⏱Thời gian làm việc tối thiểu là 30 phút!";
      }
      // Kiểm tra thời gian tối đa
      else if (diffMinutes > 12 * 60) { // 12 giờ
        errors.endTime = "⏱Thời gian làm việc không được quá 12 giờ!";
      }
    }
  }

  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (modalType === 'create') {
        const res = await api.post('/shifts', formData);
        if (res.data?.success) {
          setSuccessMsg("Tạo ca làm việc thành công!");
          fetchShifts();
          setTimeout(() => handleCloseModal(), 1500);
        }
      } else {
        const res = await api.put(`/shifts/${selectedShift.id}`, formData);
        if (res.data?.success) {
          setSuccessMsg("Cập nhật ca làm việc thành công!");
          fetchShifts();
          setTimeout(() => handleCloseModal(), 1500);
        }
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Có lỗi xảy ra!";
      
      if (serverMessage.includes("tên ca làm việc đã tồn tại")) {
        setFieldErrors({ ...fieldErrors, name: serverMessage });
      } else if (serverMessage.includes("trùng với ca")) {
        setErrorMsg(serverMessage);
      } else {
        setErrorMsg(serverMessage);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(" Bạn có chắc chắn muốn xóa ca làm việc này?")) return;
    
    try {
      const res = await api.delete(`/shifts/${id}`);
      if (res.data?.success) {
        alert(" Xóa ca làm việc thành công!");
        fetchShifts();
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Không thể xóa ca làm việc!";
      
      if (serverMessage.includes("đã được phân công")) {
        alert(" Không thể xóa ca đã được phân công cho nhân viên!");
      } else {
        alert(serverMessage);
      }
    }
  };

  return (
    <div className="d-flex" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Sidebar />
      
      <div className="flex-grow-1" style={{ padding: '20px' }}>
        <div className="container-fluid p-4">
          <div className="card shadow border-0 p-4 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold m-0">Danh Sách Ca Làm Việc</h2>
              <button 
                className="btn btn-primary px-4 fw-bold"
                onClick={() => handleOpenModal('create')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                TẠO CA MỚI
              </button>
            </div>

            {/* TABLE */}
            <div className="table-responsive">
              <table className="table table-hover align-middle border">
                <thead className="table-secondary">
                  <tr className="text-center">
                    <th>STT</th>
                    <th className="text-start">Ca làm việc</th>
                    <th>Thời gian bắt đầu</th>
                    <th>Thời gian kết thúc</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift, index) => (
                    <tr key={shift.id} className="text-center">
                      <td>{index + 1}</td>
                      <td className="text-start fw-bold">{shift.name}</td>
                      <td>{shift.startTime}</td>
                      <td>{shift.endTime}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleOpenModal('edit', shift)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(shift.id)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {shifts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <i className="bi bi-clock-history fs-1 text-secondary"></i>
                        <p className="text-secondary mt-2">Chưa có ca làm việc nào</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TẠO/SỬA CA LÀM */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${modalType === 'create' ? 'bi-plus-circle' : 'bi-pencil-square'} me-2`}></i>
                  {modalType === 'create' ? 'THÊM CA LÀM MỚI' : 'CHỈNH SỬA CA LÀM'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {errorMsg && (
                    <div className="alert alert-danger py-2 d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  
                  {successMsg && (
                    <div className="alert alert-success py-2 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Tên ca */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Tên ca làm việc <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ca sáng"
                    />
                    {fieldErrors.name && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {fieldErrors.name}
                      </div>
                    )}
                  </div>

                  <div className="row">
                    {/* Giờ bắt đầu */}
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold">Giờ bắt đầu</label>
                      <input
                        type="time"
                        name="startTime"
                        className={`form-control ${fieldErrors.startTime ? 'is-invalid' : ''}`}
                        value={formData.startTime}
                        onChange={handleChange}
                      />
                      {fieldErrors.startTime && (
                        <div className="invalid-feedback">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {fieldErrors.startTime}
                        </div>
                      )}
                    </div>

                    {/* Giờ kết thúc */}
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold">Giờ kết thúc</label>
                      <input
                        type="time"
                        name="endTime"
                        className={`form-control ${fieldErrors.endTime ? 'is-invalid' : ''}`}
                        value={formData.endTime}
                        onChange={handleChange}
                      />
                      {fieldErrors.endTime && (
                        <div className="invalid-feedback">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {fieldErrors.endTime}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-light p-3 rounded-3 mt-2">
                    <small className="text-secondary d-block">
                      <i className="bi bi-info-circle me-1"></i>
                      Thời gian làm việc tối thiểu: 30 phút
                    </small>
                    <small className="text-secondary d-block">
                      <i className="bi bi-info-circle me-1"></i>
                      Thời gian làm việc tối đa: 12 giờ
                    </small>
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4" 
                    onClick={handleCloseModal}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    HỦY
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4"
                  >
                    <i className={`bi ${modalType === 'create' ? 'bi-save' : 'bi-check-lg'} me-2`}></i>
                    {modalType === 'create' ? 'THÊM MỚI' : 'CẬP NHẬT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftList;