import api from "services/axiosInstance";


export const getReturnDetail = async (returnId) => {
  const res = await api.get(`/returns/${returnId}`);
  return res.data;
};


export const approveReturn = async (id) => {
    console.log("id", id);
    
    return await api.patch(`returns/${id}/approve`);
}

export const rejectReturn = async (id) => {
    return await api.patch(`returns/${id}/reject`);
}

export const getItems = async (status = "PENDING", page = 1, pageSize = 10) => {
    const res = await api.get("/return-items", {
        params: { status, page, pageSize },
    });
    return res.data;
}


export const approveRestock = async (id) => {
    return await api.patch(`/return-items/restock/${id}/approve`);
}

export const rejectRestock = async (id) => {
    return await api.patch(`/return-items/restock/${id}/reject`);
}

