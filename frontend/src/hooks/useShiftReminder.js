import { useEffect } from 'react';
import { useNotification } from '../components/global/Notification/NotificationContext';

export const useShiftReminder = (activeShift) => {
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!activeShift) return;

        const checkShiftEnding = () => {
            try {
                const shift = activeShift;
                const [endH, endM] = shift.endTime.split(':').map(Number);

                const now = new Date();
                const endDate = new Date();
                endDate.setHours(endH, endM, 0, 0);

                if (endH < now.getHours() && endH < 12 && now.getHours() > 12) {
                    endDate.setDate(endDate.getDate() + 1);
                }

                const diffMinutes = (endDate.getTime() - now.getTime()) / 60000;

                if (diffMinutes > 0 && diffMinutes <= 10) {
                    showNotification(
                        `Ca làm việc (${shift.shiftName }) sẽ kết thúc sau ${Math.ceil(diffMinutes)} phút.
                         Bạn hãy chuẩn bị để kết ca!`,
                        'warning'
                    );
                }
            } catch (err) { console.error(err); }
        };

        const interval = setInterval(checkShiftEnding, 60000);
        setTimeout(checkShiftEnding, 1000);

        return () => clearInterval(interval);
    }, [showNotification, activeShift]);
};
