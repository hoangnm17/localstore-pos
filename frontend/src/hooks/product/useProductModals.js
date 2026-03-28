import { useState } from 'react';

function useProductModals() {
    const [productFormState, setProductFormState] = useState({
        open: false,
        mode: 'create',
        productType: 'regular',
        product: null
    });

    const [unitModalState, setUnitModalState] = useState({
        open: false,
        mode: 'create',
        product: null,
        unit: null
    });

    const [statusModalState, setStatusModalState] = useState({
        open: false,
        product: null
    });

    const [comboModalState, setComboModalState] = useState({
        open: false,
        product: null
    });

    const openCreateProductModal = (productType = 'regular') => {
        setProductFormState({
            open: true,
            mode: 'create',
            productType,
            product: null
        });
    };

    const closeProductFormModal = () => {
        setProductFormState({
            open: false,
            mode: 'create',
            productType: 'regular',
            product: null
        });
    };

    const openUnitCreateModal = (product) => {
        setUnitModalState({
            open: true,
            mode: 'create',
            product,
            unit: null
        });
    };

    const openUnitEditModal = (product, unit) => {
        setUnitModalState({
            open: true,
            mode: 'edit',
            product,
            unit
        });
    };

    const closeUnitModal = () => {
        setUnitModalState({
            open: false,
            mode: 'create',
            product: null,
            unit: null
        });
    };

    const openStatusModal = (product) => {
        setStatusModalState({
            open: true,
            product
        });
    };

    const closeStatusModal = () => {
        setStatusModalState({
            open: false,
            product: null
        });
    };

    const openComboModal = (product) => {
        setComboModalState({
            open: true,
            product
        });
    };

    const closeComboModal = () => {
        setComboModalState({
            open: false,
            product: null
        });
    };

    return {
        productFormState,
        setProductFormState,
        openCreateProductModal,
        closeProductFormModal,

        unitModalState,
        setUnitModalState,
        openUnitCreateModal,
        openUnitEditModal,
        closeUnitModal,

        statusModalState,
        setStatusModalState,
        openStatusModal,
        closeStatusModal,

        comboModalState,
        setComboModalState,
        openComboModal,
        closeComboModal
    };
}

export default useProductModals;