import { Route } from 'react-router-dom';
import ManagerLayout from '../layouts/ManagerLayout';
import CategoryPage from '../app/category/pages/CategoryPage';

const CategoryRoutes = () => (
    <ManagerLayout>
        <CategoryPage />
    </ManagerLayout>
);

export default CategoryRoutes;