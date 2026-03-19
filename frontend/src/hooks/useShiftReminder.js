import { useEffect, useRef } from 'react';
import api from '../services/axiosInstance';
import { useNotification } from '../components/global/Notification/NotificationContext';

export const useShiftReminder = () => {
    const { showNotification } = useNotification();
    const notifiedRef = useRef(false);

    useEffect(() => {
        const checkShiftEnding = async () => {
            if (notifiedRef.current) return;

            try {
                const today = new Date();
                const todayStr = `${today.getFullYear()}
                -${String(today.getMonth() + 1).padStart(2, '0')}
                -${String(today.getDate()).padStart(2, '0')}`;

                const res = await api.get(`/cashier/handover/pending?workDate=${todayStr}`);
                const isSuccess = res.data?.success ?? res.success;
                const shifts = res.data?.data || res.data;

                if (isSuccess && shifts && shifts.length > 0) {
                    const shift = shifts[0];
                    const [endH, endM] = shift.endTime.split(':').map(Number);

                    const now = new Date();
                    const endDate = new Date();
                    endDate.setHours(endH, endM, 0, 0);

                    if (endH < now.getHours()) {
                        endDate.setDate(endDate.getDate() + 1);
                    }

                    const diffMinutes = (endDate.getTime() - now.getTime()) / 60000;

                    if (diffMinutes > 0 && diffMinutes <= 10.5) {
                        showNotification(
                            `Ca làm việc (${shift.shiftName}) sẽ kết thúc sau ${Math.ceil(diffMinutes)} phút. Bạn hãy chuẩn bị để bàn giao!`,
                            'warning'
                        );
                        notifiedRef.current = true;
                    }
                }
            } catch (err) { }
        };

        const interval = setInterval(checkShiftEnding, 60000);
        setTimeout(checkShiftEnding, 5000);

        return () => clearInterval(interval);
    }, [showNotification]);
};
