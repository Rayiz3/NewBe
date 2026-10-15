import { create } from 'zustand';
import { isNewsUrlValid, summaryType } from './request';
import { Linking } from 'react-native';
import { LINK_SERVER } from '@/constants/data';
import { getAccountAccessToken, useAccountStore } from './account';
import { useToastStore } from './toast';

export interface ScrapItem { id: string; savedAt: string; summary: summaryType }
type ScrapResponse = Omit<summaryType, 'published'> & { id: string; savedAt: string };
const toItem = (row: ScrapResponse): ScrapItem => ({
    id: row.id, savedAt: row.savedAt, summary: { ...row, published: '' },
});
let accountEpoch = 0;
interface ScrapState {
    items: ScrapItem[];
    isSaving: boolean;
    isLoading: boolean;
    error: string | null;
    deletingIds: string[];
    deletedIds: string[];
    expandedIds: string[];
    openingId: string | null;
    toggleExpanded: (id: string) => void;
    openOriginal: (id: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
    save: (summary: summaryType) => Promise<void>;
    load: () => Promise<void>;
}
export const useScrapStore = create<ScrapState>((set, get) => ({
    items: [], isSaving: false, isLoading: false, error: null,
    deletingIds: [], deletedIds: [],
    expandedIds: [], openingId: null,
    toggleExpanded: id => set(state => ({ expandedIds: state.expandedIds.includes(id)
        ? [] : [id] })),
    openOriginal: async id => {
        if (get().openingId !== null) return;
        const url = get().items.find(item => item.id === id)?.summary.newsUrl;
        if (!isNewsUrlValid(url)) {
            useToastStore.getState().show('원문 링크가 제공되지 않았어요.');
            return;
        }
        set({ openingId: id });
        try { await Linking.openURL(url!.trim()); }
        catch { useToastStore.getState().show('원문을 열 수 없어요. 다시 시도해주세요.'); }
        finally { set({ openingId: null }); }
    },
    remove: async id => {
        if (get().deletingIds.includes(id)) return;
        const owner = useAccountStore.getState().userId;
        const epoch = accountEpoch;
        set(state => ({ deletingIds: [...state.deletingIds, id] }));
        try {
            const token = await getAccountAccessToken();
            if (epoch !== accountEpoch) return;
            const response = await fetch(`${LINK_SERVER}/scraps/batch-delete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] }),
            });
            if (!response.ok) throw new Error(response.status === 401 ? '다시 로그인해주세요.' : '삭제하지 못했어요. 다시 시도해주세요.');
            const result: { deletedIds: string[] } = await response.json();
            if (epoch !== accountEpoch || owner !== useAccountStore.getState().userId || !useAccountStore.getState().isLogin) return;
            if (!result.deletedIds.includes(id)) throw new Error('삭제할 항목을 찾지 못했어요. 목록을 새로고침해주세요.');
            set(state => ({ items: state.items.filter(item => item.id !== id), deletedIds: [...state.deletedIds, id],
                expandedIds: state.expandedIds.filter(value => value !== id) }));
            useToastStore.getState().show('스크랩을 삭제했어요.');
        } catch (error) {
            if (epoch === accountEpoch && owner === useAccountStore.getState().userId) {
                useToastStore.getState().show(error instanceof Error ? error.message : '삭제하지 못했어요.');
            }
        } finally {
            if (epoch === accountEpoch) set(state => ({ deletingIds: state.deletingIds.filter(value => value !== id) }));
        }
    },
    save: async summary => {
        if (get().isSaving) return;
        const owner = useAccountStore.getState().userId;
        const epoch = accountEpoch;
        set({ isSaving: true });
        const loadingToast = useToastStore.getState().showLoading('스크랩 확인 중');
        let resultMessage: string | undefined;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const token = await getAccountAccessToken();
            if (epoch !== accountEpoch) return;
            if (!summary.summaryId) throw new Error('뉴스를 새로 불러온 뒤 다시 시도해주세요.');
            const statusResponse = await fetch(`${LINK_SERVER}/scraps/status`, {
                method: 'POST', signal: controller.signal,
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ summaryIds: [summary.summaryId] }),
            });
            if (!statusResponse.ok) throw new Error(statusResponse.status === 401
                ? '다시 로그인해주세요.' : '스크랩 여부를 확인하지 못했어요. 다시 눌러주세요.');
            const status: { items: { summaryId: string; scrapId: string }[] } = await statusResponse.json();
            if (epoch !== accountEpoch) return;
            if (status.items.some(item => item.summaryId === summary.summaryId)) {
                resultMessage = '이미 스크랩한 뉴스예요.';
                return;
            }
            const response = await fetch(`${LINK_SERVER}/scraps`, {
                method: 'POST', signal: controller.signal, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ summaryId: summary.summaryId }),
            });
            if (!response.ok) throw new Error(response.status === 401 ? '다시 로그인해주세요.' :
                response.status === 404 ? '뉴스가 변경되었어요. 새로 불러온 뒤 다시 시도해주세요.' : '스크랩을 저장하지 못했어요. 다시 시도해주세요.');
            const item = toItem(await response.json());
            if (epoch !== accountEpoch || owner !== useAccountStore.getState().userId || !useAccountStore.getState().isLogin) return;
            const exists = get().items.some(saved => saved.id === item.id);
            set(state => ({ items: [item, ...state.items.filter(saved => saved.id !== item.id)]
                .sort((a, b) => b.savedAt.localeCompare(a.savedAt) || b.id.localeCompare(a.id)) }));
            resultMessage = exists ? '이미 스크랩한 뉴스예요.' : '스크랩에 저장했어요.';
        } catch (error) {
            if (epoch === accountEpoch) resultMessage = error instanceof Error ? error.message : '스크랩을 저장하지 못했어요.';
        } finally {
            clearTimeout(timeout);
            useToastStore.getState().finishLoading(loadingToast, resultMessage);
            if (epoch === accountEpoch) set({ isSaving: false });
        }
    },
    load: async () => {
        if (get().isLoading) return;
        const owner = useAccountStore.getState().userId;
        const epoch = accountEpoch;
        set({ isLoading: true, error: null });
        try {
            const token = await getAccountAccessToken();
            if (epoch !== accountEpoch) return;
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
            if (epoch === accountEpoch && owner === useAccountStore.getState().userId && useAccountStore.getState().isLogin) {
                set(state => ({ items: [...new Map([...items, ...state.items].map(item => [item.id, item])).values()]
                    .filter(item => !state.deletedIds.includes(item.id))
                    .sort((a, b) => b.savedAt.localeCompare(a.savedAt) || b.id.localeCompare(a.id)) }));
            }
        } catch (error) {
            if (epoch === accountEpoch) set({ error: error instanceof Error ? error.message : '스크랩을 불러오지 못했어요.' });
        } finally { if (epoch === accountEpoch) set({ isLoading: false }); }
    },
}));

useAccountStore.subscribe((state, previous) => {
    if (state.userId !== previous.userId || state.isLogin !== previous.isLogin) {
        accountEpoch++;
        useScrapStore.setState({
            isSaving: false, isLoading: false, items: [], error: null, deletedIds: [], deletingIds: [], expandedIds: [], openingId: null });
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

