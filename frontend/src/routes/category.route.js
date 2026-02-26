import { Route } from 'react-router-dom';
import ManagerLayout from '../layouts/ManagerLayout';
import CategoryPage from '../app/category/pages/CategoryPage';
import ProtectedRoute from './protected.route';

const CategoryRoutes = (
    <Route element={<ProtectedRoute requiredFeatures={['VIEW_CATEGORY']} />}>
        <Route
            path="/categories/*"
            element={
                <ManagerLayout>
                    <CategoryPage />
                </ManagerLayout>
            }
        />
    </Route>
);

export default CategoryRoutes;