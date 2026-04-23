import { create } from "zustand";

interface ScrollProps {
    curPage: number
    setCurPage: (v: number) => void
}

export const useScrollStore = create<ScrollProps>((set, get) => ({
    curPage: 0,
    setCurPage: (v) => set({curPage: v}),
}));