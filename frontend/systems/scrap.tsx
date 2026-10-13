import { create } from 'zustand';
import { summaryType } from './request';
import { LINK_SERVER } from '@/constants/data';
import { getAccountAccessToken, useAccountStore } from './account';
import { useToastStore } from './toast';

export interface ScrapItem { id: string; savedAt: string; summary: summaryType }
type ScrapResponse = Omit<summaryType, 'published'> & { id: string; savedAt: string };
const toItem = (row: ScrapResponse): ScrapItem => ({
    id: row.id, savedAt: row.savedAt, summary: { ...row, published: '' },
});
interface ScrapState {
    items: ScrapItem[];
    isSaving: boolean;
    isLoading: boolean;
    error: string | null;
    save: (summary: summaryType) => Promise<void>;
    load: () => Promise<void>;
}
export const useScrapStore = create<ScrapState>((set, get) => ({
    items: [], isSaving: false, isLoading: false, error: null,
    save: async summary => {
        if (get().isSaving) return;
        const owner = useAccountStore.getState().userId;
        set({ isSaving: true });
        try {
            const token = await getAccountAccessToken();
            if (!summary.summaryId) throw new Error('뉴스를 새로 불러온 뒤 다시 시도해주세요.');
            const response = await fetch(`${LINK_SERVER}/scraps`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ summaryId: summary.summaryId }),
            });
            if (!response.ok) throw new Error(response.status === 401 ? '다시 로그인해주세요.' :
                response.status === 404 ? '뉴스가 변경되었어요. 새로 불러온 뒤 다시 시도해주세요.' : '스크랩을 저장하지 못했어요. 다시 시도해주세요.');
            const item = toItem(await response.json());
            if (owner !== useAccountStore.getState().userId || !useAccountStore.getState().isLogin) return;
            const exists = get().items.some(saved => saved.id === item.id);
            set(state => ({ items: [item, ...state.items.filter(saved => saved.id !== item.id)]
                .sort((a, b) => b.savedAt.localeCompare(a.savedAt) || b.id.localeCompare(a.id)) }));
            useToastStore.getState().show(exists ? '이미 스크랩한 뉴스예요.' : '스크랩에 저장했어요.');
        } catch (error) {
            useToastStore.getState().show(error instanceof Error ? error.message : '스크랩을 저장하지 못했어요.');
        } finally { set({ isSaving: false }); }
    },
    load: async () => {
        if (get().isLoading) return;
        const owner = useAccountStore.getState().userId;
        set({ isLoading: true, error: null });
        try {
            const token = await getAccountAccessToken();
            const items: ScrapItem[] = [];
            let cursor: string | null = null;
            do {
                const response = await fetch(`${LINK_SERVER}/scraps?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('스크랩을 불러오지 못했어요. 다시 시도해주세요.');
                const page: { items: ScrapResponse[]; nextCursor: string | null } = await response.json();
                items.push(...page.items.map(toItem));
                cursor = page.nextCursor;
            } while (cursor);
            if (owner === useAccountStore.getState().userId && useAccountStore.getState().isLogin) {
                set(state => ({ items: [...new Map([...items, ...state.items].map(item => [item.id, item])).values()]
                    .sort((a, b) => b.savedAt.localeCompare(a.savedAt) || b.id.localeCompare(a.id)) }));
            }
        } catch (error) {
            set({ error: error instanceof Error ? error.message : '스크랩을 불러오지 못했어요.' });
        } finally { set({ isLoading: false }); }
    },
}));

useAccountStore.subscribe((state, previous) => {
    if (state.userId !== previous.userId || state.isLogin !== previous.isLogin) {
        useScrapStore.setState({ items: [], error: null });
    }
});

export function formatScrapDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}
