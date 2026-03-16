import { useState } from 'react';
import {
    addComboItem,
    createProduct,
    createProductUnit,
    deleteProductUnit,
    getComboItems,
    getProduct,
    removeComboItem,
    startSellingProduct,
    stopSellingProduct,
    updateProduct,
    updateProductUnit
} from '../../services/Product/product.service';

function areQuantitiesEqual(a, b) {
    return Math.abs(Number(a || 0) - Number(b || 0)) < 0.0001;
}

async function syncComboItems(parentProductId, currentComboItems = [], desiredComboItems = []) {
    const currentMap = new Map(
        currentComboItems.map((item) => [String(item.childProductId), item])
    );

    const desiredMap = new Map(
        desiredComboItems.map((item) => [String(item.childProductId), item])
    );

    for (const currentItem of currentComboItems) {
        const childKey = String(currentItem.childProductId);
        const desiredItem = desiredMap.get(childKey);

        if (!desiredItem) {
            await removeComboItem(parentProductId, currentItem.id);
            continue;
        }

        if (!areQuantitiesEqual(currentItem.quantity, desiredItem.quantity)) {
            await removeComboItem(parentProductId, currentItem.id);
        }
    }

    for (const desiredItem of desiredComboItems) {
        const childKey = String(desiredItem.childProductId);
        const currentItem = currentMap.get(childKey);

        if (!currentItem || !areQuantitiesEqual(currentItem.quantity, desiredItem.quantity)) {
            await addComboItem(parentProductId, {
                childProductId: desiredItem.childProductId,
                quantity: desiredItem.quantity
            });
        }
    }
}

function useProductActions({
    productFormState,
    setProductFormState,
    closeProductFormModal,

    unitModalState,
    closeUnitModal,

    closeStatusModal,

    comboModalState,
    closeComboModal,

    detailState,
    loadProducts,
    openDetailModal,
    refreshDetailModal,

    showNotification,
    onConfirm
}) {
    const [submitLoading, setSubmitLoading] = useState(false);

    const openEditProductModal = async (productId) => {
        try {
            setSubmitLoading(true);

            const response = await getProduct(productId);
            const product = response.data?.data;

            if (!product) {
                showNotification('Không tìm thấy sản phẩm.', 'error');
                return;
            }

            let comboItems = [];
            if (product.isCombo) {
                try {
                    const comboResponse = await getComboItems(productId);
                    comboItems = comboResponse.data?.data || [];
                } catch (_) {
                    comboItems = [];
                }
            }

            setProductFormState({
                open: true,
                mode: 'edit',
                productType: product.isCombo ? 'combo' : 'regular',
                product: {
                    ...product,
                    comboItems
                }
            });
        } catch (error) {
            showNotification(error.response?.data?.message || 'Không tải được thông tin sản phẩm.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSaveProduct = async (payload) => {
        let createdProductId = null;

        try {
            setSubmitLoading(true);

            const basicPayload = {
                code: payload.code,
                name: payload.name,
                imageUrl: payload.imageUrl,
                categoryId: payload.categoryId,
                baseUnit: payload.baseUnit,
                salePrice: payload.salePrice,
                barcode: payload.barcode,
                minThreshold: payload.minThreshold,
                status: payload.status,
                isCombo: payload.isCombo,
                allowDecimalQuantity: payload.allowDecimalQuantity
            };

            const desiredComboItems = Array.isArray(payload.comboItems)
                ? payload.comboItems
                : [];

            if (productFormState.mode === 'create') {
                const response = await createProduct(basicPayload);
                createdProductId = response.data?.id;

                if (payload.isCombo && desiredComboItems.length > 0) {
                    await syncComboItems(createdProductId, [], desiredComboItems);
                }

                closeProductFormModal();
                await loadProducts();

                if (createdProductId) {
                    await openDetailModal(createdProductId);
                }

                showNotification('Tạo sản phẩm thành công.', 'success');
                return;
            }

            const editingProductId = productFormState.product.id;
            const currentComboItems = productFormState.product?.comboItems || [];

            await updateProduct(editingProductId, basicPayload);

            if (payload.isCombo) {
                await syncComboItems(editingProductId, currentComboItems, desiredComboItems);
            }

            closeProductFormModal();
            await loadProducts();

            if (detailState.open && detailState.product?.id === editingProductId) {
                await refreshDetailModal(editingProductId);
            }

            showNotification('Cập nhật sản phẩm thành công.', 'success');
        } catch (error) {
            if (createdProductId && payload?.isCombo) {
                await loadProducts();
                await openDetailModal(createdProductId);
                showNotification(
                    'Đã tạo sản phẩm combo nhưng lưu thành phần combo bị lỗi. Vui lòng kiểm tra lại trong popup chi tiết sản phẩm.',
                    'warning'
                );
                closeProductFormModal();
                return;
            }

            showNotification(error.response?.data?.message || 'Lưu sản phẩm thất bại.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleChangeProductStatus = async (product) => {
        try {
            setSubmitLoading(true);

            if (product.status === 'Selling') {
                await stopSellingProduct(product.id);
            } else {
                await startSellingProduct(product.id);
            }

            closeStatusModal();
            await loadProducts();

            if (detailState.open && detailState.product?.id === product.id) {
                await refreshDetailModal(product.id);
            }

            showNotification('Cập nhật trạng thái thành công.', 'success');
        } catch (error) {
            showNotification(error.response?.data?.message || 'Cập nhật trạng thái thất bại.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSaveUnit = async (payload) => {
        try {
            setSubmitLoading(true);
            let response;

            if (unitModalState.mode === 'create') {
                response = await createProductUnit(payload);
            } else {
                response = await updateProductUnit(unitModalState.unit.id, payload);
            }
            showNotification(
                unitModalState.mode === 'create'
                    ? 'Tạo đơn vị tính thành công.'
                    : 'Cập nhật đơn vị tính thành công.',
                'success'
            );

            const productId = unitModalState.product?.id;
            closeUnitModal();
            await loadProducts();

            if (productId) {
                await refreshDetailModal(productId);
            }
        } catch (error) {
            showNotification(error.response?.data?.message || error.message || 'Lưu đơn vị tính thất bại.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteUnit = async (unit) => {
        onConfirm({
            message: `Bạn có chắc muốn xóa đơn vị tính "${unit.unitName}" không?`,
            onOk: async () => {
                try {
                    setSubmitLoading(true);
                    await deleteProductUnit(unit.id);
                    await loadProducts();
                    await refreshDetailModal(detailState.product?.id);
                    showNotification('Xóa đơn vị tính thành công.', 'success');
                } catch (error) {
                    showNotification(error.response?.data?.message || 'Xóa đơn vị tính thất bại.', 'error');
                } finally {
                    setSubmitLoading(false);
                }
            }
        });
    };

    const handleAddComboItem = async (payload) => {
        try {
            setSubmitLoading(true);

            const productId = comboModalState.product?.id;
            await addComboItem(productId, payload);

            closeComboModal();
            await loadProducts();
            await refreshDetailModal(productId);

            showNotification('Thêm thành phần combo thành công.', 'success');
        } catch (error) {
            showNotification(error.response?.data?.message || 'Thêm thành phần combo thất bại.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleRemoveComboItem = async (comboItemId) => {
        onConfirm({
            message: 'Bạn có chắc muốn xóa thành phần combo này không?',
            onOk: async () => {
                try {
                    setSubmitLoading(true);

                    const productId = detailState.product?.id;
                    await removeComboItem(productId, comboItemId);

                    await loadProducts();
                    await refreshDetailModal(productId);

                    showNotification('Đã xóa thành phần combo.', 'success');
                } catch (error) {
                    showNotification(error.response?.data?.message || 'Xóa thành phần combo thất bại.', 'error');
                } finally {
                    setSubmitLoading(false);
                }
            }
        });
    };

    return {
        submitLoading,
        openEditProductModal,
        handleSaveProduct,
        handleChangeProductStatus,
        handleSaveUnit,
        handleDeleteUnit,
        handleAddComboItem,
        handleRemoveComboItem
    };
}

export default useProductActions;