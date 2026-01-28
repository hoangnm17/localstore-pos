function Footer() {
    return (
        <footer className="bg-dark text-white pt-5 pb-4">
            <div className="container">
                <div className="row gy-4">

                    <div className="col-lg-4 col-md-6">
                        <h5 className="fw-bold mb-3">LocalStorePOS</h5>
                        <div className="d-flex gap-3 mt-3">
                            <a href="#" className="text-white fs-4"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="text-white fs-4"><i className="bi bi-telegram"></i></a>
                            <a href="#" className="text-white fs-4"><i className="bi bi-youtube"></i></a>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-3 col-6">
                        <h6 className="fw-bold text-uppercase mb-3">Liên kết</h6>
                        <ul className="list-unstyled small">
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Trang chủ</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Tính năng</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Giá cả</a></li>
                            <li><a href="#" className="text-secondary text-decoration-none">Liên hệ</a></li>
                        </ul>
                    </div>

                    <div className="col-lg-3 col-md-3 col-6">
                        <h6 className="fw-bold text-uppercase mb-3">Hỗ trợ</h6>
                        <ul className="list-unstyled small">
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Hướng dẫn sử dụng</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">FAQ</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Chính sách bảo mật</a></li>
                            <li><a href="#" className="text-secondary text-decoration-none">Điều khoản</a></li>
                        </ul>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <h6 className="fw-bold text-uppercase mb-3">Liên hệ</h6>
                        <ul className="list-unstyled small text-secondary">
                            <li className="mb-2"><i className="bi bi-telephone me-2"></i>0123 456 789</li>
                            <li className="mb-2"><i className="bi bi-envelope me-2"></i>support@localstorepos.com</li>
                            <li className="mb-2"><i className="bi bi-geo-alt me-2"></i>Hà Nội, Việt Nam</li>
                        </ul>
                    </div>
                </div>

                <hr className="border-secondary my-4" />

                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start small text-secondary">
                        © 2026 LocalStorePOS. MST: 010xxxxxxxx.
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
