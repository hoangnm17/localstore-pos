import api from "../axiosInstance";

export const customersSearch = (phone) => {
  return api.get("/customers/by-phone", {
    params: {
      phone: phone
    }
  })
}

export const customerCreate = (data) => {
  return api.post("/customers", data)
}