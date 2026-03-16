import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';

/**
 * AppLayout — Layout chính dùng <Outlet> của React Router v6.
 * Bao gồm: Sidebar (trái) + Header (trên) + Footer (dưới)
 * Chỉ cần bọc nhóm route trong <Route element={<AppLayout />}>
 * thì tất cả page con tự có Sidebar + Header mà KHÔNG cần import trong từng page.
 */
function AppLayout() {
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Header />
                <main style={{ flex: 1, overflowY: 'auto', background: '#f0f2f5' }}>
                    <Outlet />
                </main>
                {/* ✅ Footer gọn cho admin dashboard */}
                <footer style={{
                    height: '36px',
                    background: '#fff',
                    borderTop: '1px solid #e8edf3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    flexShrink: 0,
                    letterSpacing: '0.3px',
                }}>
                    © 2026 LocalStore POS &nbsp;·&nbsp; MST: 010xxxxxxxx &nbsp;·&nbsp; support@localstorepos.com
                </footer>
            </div>
        </div>
    );
}

export default AppLayout;
