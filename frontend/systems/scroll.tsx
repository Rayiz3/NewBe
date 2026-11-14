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
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    if (layoutMeasurement.width <= 0) return;
    const pageIndex = Math.max(0, Math.round(contentOffset.x / layoutMeasurement.width));
    useScrollStore.getState().setCurPage(pageIndex);
}
