import { useNotification } from 'components/global/Notification/NotificationContext';
import React, { useState } from 'react';
import { changeMyPassword } from 'services/Staff/staff.service';

const ForceChangePasswordModal = () => {
    const [newPass, setNewPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); 
    const { showNotification } = useNotification();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await changeMyPassword({
                oldPassword: '123456', 
                newPassword: newPass
            });
            
            setIsSuccess(true);
            
            const user = JSON.parse(localStorage.getItem('user'));
            user.requirePasswordChange = false;
            localStorage.setItem('user', JSON.stringify(user));
            
            setTimeout(() => {
                window.location.reload(); 
            }, 1500);
            
        } catch (err) {
            showNotification("Lỗi: " + (err.response?.data?.message || err.message), "danger");
            setLoading(false);
        }
    };
    
    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    
                    {!isSuccess ? (
                        <>
                            <div style={{ background: 'linear-gradient(135deg, #d34b4b 0%, #e94141 100%)', padding: '20px', color: '#fff', textAlign: 'center' }}>
                                <h4 className="fw-bold m-0"><i className="bi bi-shield-lock-fill me-2" />THAY ĐỔI MẬT KHẨU</h4>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <p className="mb-4 text-secondary" style={{ fontSize: '0.95rem' }}>
                                    Tài khoản của bạn đang sử dụng mật khẩu mặc định (123456). <br/> Vui lòng thay đổi mật khẩu mới!
                                </p>
                                <form onSubmit={handleSubmit}>
                                    <input 
                                        type="password" 
                                        value={newPass} 
                                        onChange={e => setNewPass(e.target.value)} 
                                        placeholder="Nhập mật khẩu an toàn" 
                                        className="form-control mb-4 fw-bold text-success" 
                                        style={{  fontSize: '1.2rem', padding: '12px', background: '#f8f9fa' }}
                                        required minLength="6" 
                                    />
                                    <button type="submit" disabled={loading} className="btn w-100 fw-bold text-white py-2" style={{ background: '#dc2626', borderRadius: '10px', fontSize: '1.1rem' }}>
                                        {loading ? <span className="spinner-border spinner-border-sm" /> : 'XÁC NHẬN'}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="modal-body p-5 text-center" style={{ background: '#f0fdf4' }}>
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
                            <h3 className="fw-bold text-success mt-3 mb-2"> Thay đổi mật khẩu mới thành công!</h3>
                            <p className="text-secondary fw-semibold"><br/>Bắt đầu vào ca làm việc!</p>
                            <div className="spinner-border text-success mt-3" style={{width: '24px', height: '24px'}} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
export default ForceChangePasswordModal;
