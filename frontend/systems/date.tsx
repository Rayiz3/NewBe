import { create } from "zustand";

export function formatCurrentDate(now = new Date()) {
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const week = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    return `${now.getFullYear()}.${month}.${day} (${week})`;
}

export const useDateStore = create<{ currentDate: string; refreshDate: () => void }>(set => ({
    currentDate: formatCurrentDate(),
    refreshDate: () => set({ currentDate: formatCurrentDate() }),
}));
