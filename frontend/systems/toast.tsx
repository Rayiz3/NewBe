import { AccessibilityInfo } from 'react-native';
import { create } from 'zustand';

export interface ToastEntry { id: number; message: string; loading: boolean }
interface ToastState {
    current: ToastEntry | null;
    visible: boolean;
    queue: ToastEntry[];
    show: (message: string) => void;
    showLoading: (message: string) => number;
    finishLoading: (id: number, message?: string) => void;
    finishExit: (id: number) => void;
}
let nextId = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
function cancelTimer() { if (timer) clearTimeout(timer); timer = undefined; }
function activate(entry: ToastEntry) {
    cancelTimer();
    useToastStore.setState({ current: entry, visible: true });
    AccessibilityInfo.announceForAccessibility(entry.message);
    if (!entry.loading) timer = setTimeout(() => useToastStore.setState({ visible: false }), 2500);
}
function enqueue(entry: ToastEntry) {
    const state = useToastStore.getState();
    if (!state.current) activate(entry);
    else {
        cancelTimer();
        useToastStore.setState({ queue: [...state.queue, entry], visible: false });
    }
}
export const useToastStore = create<ToastState>((set, get) => ({
    current: null, visible: false, queue: [],
    show: message => enqueue({ id: ++nextId, message, loading: false }),
    showLoading: message => {
        const id = ++nextId;
        enqueue({ id, message, loading: true });
        return id;
    },
    finishLoading: (id, message) => {
        const replacement = message ? { id: ++nextId, message, loading: false } : null;
        const state = get();
        if (state.current?.id === id) {
            cancelTimer();
            set({ visible: false, queue: replacement ? [replacement, ...state.queue] : state.queue });
        } else {
            set({ queue: state.queue.flatMap(entry => entry.id === id ? (replacement ? [replacement] : []) : [entry]) });
        }
    },
    finishExit: id => {
        if (get().current?.id !== id || get().visible) return;
        cancelTimer();
        const [next, ...queue] = get().queue;
        set({ current: null, queue, visible: false });
        if (next) activate(next);
    },
}));
