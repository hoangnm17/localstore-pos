import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";

function ManagerLayout({ children }) {
    return (
        <>
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <main className="min-vh-100" style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </main>
            </div>
            <Footer />
        </>
    );
}

export default ManagerLayout;