import { Route } from 'react-router-dom';
import CategoryPage from '../app/category/pages/CategoryPage';
import ProtectedRoute from './protected.route';

const CategoryRoutes = (
    <Route element={<ProtectedRoute requiredFeatures={['VIEW_CATEGORY']} />}>
        <Route
            path="/categories/*"
            element={
                    <CategoryPage />
            }
        />
    </Route>
);

export default CategoryRoutes;