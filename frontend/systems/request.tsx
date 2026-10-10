import { LINK_SERVER } from "@/constants/data";
import { Alert, Linking } from "react-native";
import { create } from "zustand";

export interface summaryType {
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
    getSummaries: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });

        try {
            const response = await fetch(`${LINK_SERVER}/news`)
            const data = await response.json();
            set({
                summaries: data as Record<string, summaryType>,
                isLoading: false,
            })
        }
        catch (error) {
            console.error('[Error] get news error :', error);
            set({ isLoading: false })
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
