import { Route } from 'react-router-dom';
import ManagerLayout from '../layouts/ManagerLayout';
import ProductList from '../app/product/ProductList';

const ProductRoutes = (
    <Route
        path="/products/list"
        element={
            <ManagerLayout>
                <ProductList />
            </ManagerLayout>
        }
    />
);

export default ProductRoutes;
