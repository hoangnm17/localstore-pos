import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

function MainLayout() {
    return (
        <>
            <Header />
            <main className="min-vh-100">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default MainLayout;
