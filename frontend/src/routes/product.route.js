import { Route } from 'react-router-dom';
import ManagerLayout from '../layouts/ManagerLayout';
import ProtectedRoute from './protected.route';
import ProductList from '../app/product/productList';

const ProductRoutes = (
    <Route element={<ProtectedRoute requiredFeatures={['VIEW_PRODUCT']} />}>
        <Route
            path="/products/list"
            element={
                <ManagerLayout>
                    <ProductList />
                </ManagerLayout>
            }
        />
    </Route>
);

export default ProductRoutes;