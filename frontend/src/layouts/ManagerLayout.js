import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';

function ManagerLayout({ children }) {
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Header />
                <main style={{ flex: 1, overflowY: 'auto', background: '#f4f6fa' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default ManagerLayout;