import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import ForceChangePasswordModal from '../app/auth/modals/ForceChangePasswordModal';
import AutoCheckInModal from 'components/global/Notification/AutoCheckInModal/AutoCheckInModal';

function AppLayout() {
    let requireChange = false;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userObj = JSON.parse(userStr);
            if (userObj.requirePasswordChange === true) {
                requireChange = true;
            }
        }
    } catch (e) {
        console.error("Lỗi Parsing User:", e);
    }
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            <AutoCheckInModal /> 
            {requireChange && <ForceChangePasswordModal />}
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Header />
                <main style={{ flex: 1, overflowY: 'auto', background: '#f0f2f5' }}>
                    <Outlet />
                </main>
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
