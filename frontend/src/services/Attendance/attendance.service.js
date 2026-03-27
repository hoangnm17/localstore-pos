import api from "../axiosInstance";

export const attendanceService = {
    checkPending: () =>
        api.get("/attendance/check-pending").then(r => r.data),
    checkIn: (data) =>
        api.post("/attendance/check-in", data).then(r => r.data),
    simpleCheckOut: (scheduleId) =>
        api.post("/attendance/simple-check-out", { scheduleId }).then(r => r.data),
    checkWorking: () =>
        api.get("/attendance/check-working").then(r => r.data),
};
