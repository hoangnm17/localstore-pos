import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";

function MainLayout() {
    return (
        <>
            <Header />
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <main className="min-vh-100" style={{ flex: 1, overflow: 'auto' }}>
                    <Outlet />
                </main>
            </div>
            <Footer />
        </>
    );
}

export default MainLayout;
