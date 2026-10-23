import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useRequestStore } from './request';
import { newsRefreshWindow } from './newsRefreshPolicy';

// Observe only while the app is active; resume checks and the daily boundary on foreground.
export function useNewsRefresh() {
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let active = AppState.currentState === 'active' || AppState.currentState == null;
        const check = () => {
            if (timer) clearTimeout(timer);
            if (!active) return;
            const state = useRequestStore.getState();
            const window = newsRefreshWindow();
            if (!state.isLoading && ((window.afterRefresh && state.refreshAttemptedDay !== window.day) ||
                (state.needsRefresh && Date.now() >= state.nextRetryAt))) {
                void state.getSummaries();
                return;
            }
            const next = state.needsRefresh ? Math.min(state.nextRetryAt, window.nextRefreshAt) : window.nextRefreshAt;
            timer = setTimeout(check, Math.max(1000, next - Date.now()));
        };
        const unsubscribe = useRequestStore.subscribe(() => check());
        const listener = AppState.addEventListener('change', value => {
            active = value === 'active';
            check();
        });
        void useRequestStore.getState().getSummaries();
        check();
        return () => { if (timer) clearTimeout(timer); unsubscribe(); listener.remove(); };
    }, []);
}
