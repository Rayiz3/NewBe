import { AccessibilityInfo } from 'react-native';
import { create } from 'zustand';

let timer: ReturnType<typeof setTimeout> | undefined;
export const useToastStore = create<{ message: string | null; show: (message: string) => void }>(set => ({
    message: null,
    show: message => {
        if (timer) clearTimeout(timer);
        set({ message });
        AccessibilityInfo.announceForAccessibility(message);
        timer = setTimeout(() => set({ message: null }), 2500);
    },
}));
