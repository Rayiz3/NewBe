import { LINK_SERVER } from "@/constants/data";
import { Alert, Linking } from "react-native";
import { newsRefreshWindow, hasCurrentNews } from "./newsRefreshPolicy";
import { useDateStore } from "./date";
import { create } from "zustand";

export interface summaryType {
    summaryId?: string | null;
    personaId: string;
    title: string;
    category: string;
    published: string;
    source: string;
    newsUrl: string;
    content: string;
}

interface RequestProps {
    openingPersonaId: string | null;
    openOriginalNews: (personaId: string) => Promise<void>;
    summaries: Record<string, summaryType>
    getSummaries: () => Promise<void>;

    refreshAttemptedDay: string | null;
    needsRefresh: boolean;
    nextRetryAt: number;
    retryCount: number;
    error: string | null;
    isLoading: boolean
}

export const useRequestStore = create<RequestProps>((set, get) => ({
    openingPersonaId: null,
    openOriginalNews: async (personaId) => {
        const newsUrl = get().summaries[personaId]?.newsUrl?.trim();
        if (get().openingPersonaId !== null || !isNewsUrlValid(newsUrl)) return;
        set({ openingPersonaId: personaId });
        try {
            await Linking.openURL(newsUrl!);
        } catch {
            Alert.alert('원문을 열 수 없어요', '잠시 후 다시 시도해주세요.');
        } finally {
            set({ openingPersonaId: null });
        }
    },
    summaries: {},
    refreshAttemptedDay: null, needsRefresh: false, nextRetryAt: 0, retryCount: 0, error: null,
    getSummaries: async () => {
        if (get().isLoading) return;
        const window = newsRefreshWindow();
        set({ isLoading: true, error: null,
            ...(window.afterRefresh ? { refreshAttemptedDay: window.day } : {}) });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);
        try {
            const response = await fetch(`${LINK_SERVER}/news`, { signal: controller.signal, cache: 'no-store' });
            if (!response.ok) throw new Error(`News request failed: ${response.status}`);
            const data = await response.json();
            if (!data || typeof data !== 'object' || Array.isArray(data) ||
                !Object.values(data).every((item: any) => item && typeof item.published === 'string' &&
                    typeof item.personaId === 'string' && typeof item.content === 'string')) {
                throw new Error('Invalid news response');
            }
            const current = newsRefreshWindow();
            const stale = current.afterRefresh && !hasCurrentNews(data, current.day);
            const retryCount = stale ? get().retryCount + 1 : 0;
            set({ ...(Object.keys(data).length ? { summaries: data as Record<string, summaryType> } : {}),
                needsRefresh: stale, retryCount,
                nextRetryAt: stale ? Date.now() + Math.min(30000 * 2 ** Math.min(retryCount - 1, 4), 300000) : 0 });
            useDateStore.getState().refreshDate();
        } catch (error) {
            const retryCount = get().retryCount + 1;
            set({ error: '뉴스를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
                needsRefresh: true, retryCount,
                nextRetryAt: Date.now() + Math.min(30000 * 2 ** Math.min(retryCount - 1, 4), 300000) });
            console.error('[Error] get news error:', error);
        } finally {
            clearTimeout(timeout);
            set({ isLoading: false });
        }
    },

    isLoading: false
}));

/*
response = Record<personaId: string, value: SummaryResponseSchema>
SummaryResponseSchema:
    persona_id: str = ""
    title     : str = ""
    category  : str = ""
    published : str = ""
    source    : str = ""
    news_url  : str = ""
    content   : str = ""
*/
export function isNewsUrlValid(value?: string): boolean {
    try {
        const url = new URL(value ?? '');
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}
