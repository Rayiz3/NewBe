import { LINK_SERVER } from "@/constants/data";
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
    summaries: Record<string, summaryType>
    getSummaries: () => Promise<void>;

    isLoading: boolean
}

export const useRequestStore = create<RequestProps>((set, get) => ({
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