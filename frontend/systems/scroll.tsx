import { screen } from "@/constants/sizes";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { create } from "zustand";

interface ScrollProps {
    curPage: number
    setCurPage: (v: number) => void
}

export const useScrollStore = create<ScrollProps>((set, get) => ({
    curPage: 0,
    setCurPage: (v) => set({curPage: v}),
}));
export function handlePageScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / screen.width);
    useScrollStore.getState().setCurPage(pageIndex);
}
