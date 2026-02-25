import { Routes } from 'react-router-dom';
import ProductList from '../app/product/ProductList';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/manager/products" element={<ProductList />} />
        </Routes>
    );
}

export default AppRoutes;
