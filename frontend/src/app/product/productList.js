import { ProductProvider } from './ui/ProductContext';
import ProductListPage from './page/ProductListPage';

const ProductList = () => (
    <ProductProvider>
        <ProductListPage />
    </ProductProvider>
);

export default ProductList;