import { Route } from 'react-router-dom';
import ProtectedRoute from './protected.route';
import ProductList from '../app/product/productList';

const ProductRoutes = (
    <Route element={<ProtectedRoute requiredFeatures={['VIEW_PRODUCT']} />}>
        <Route
            path="/products/list"
            element={
                    <ProductList />
            }
        />
    </Route>
);

export default ProductRoutes;