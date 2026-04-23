import { screen } from "@/constants/sizes";
import { PanResponder, PanResponderInstance } from "react-native";
import { create } from "zustand";

type dragSourceType = 'feed' | 'persona' | null;

interface personaType {
    id: string;
    category: string;
    name: string;
    description: string;
}

interface posType {
    x: number;
    y: number;
}

interface zoneType extends posType {
    w: number;
    h: number;
}

interface PersonaProps {
    feed: string[]
    setFeed: (v: string[]) => void
    addFeed: (v: string) => void
    removeFeed: (v: string) => number
    insertFeed: (v: string, index: number) => void

    curPersona: string
    setCurPersona: (v: string) => void

    isDragging: dragSourceType
    setIsDragging: (v: dragSourceType) => void

    drag: posType
    setDrag: (x?: number, y?: number) => void

    // persona editing
    getPanResponder: () => PanResponderInstance
    isInsideDropZone: (pos: posType, zone: zoneType | null) => boolean

    dropZoneFeed: zoneType
    setDropZoneFeed: (x?: number, y?: number, w?: number, h?: number) => void

    dropZonePersona: zoneType
    setDropZonePersona: (x?: number, y?: number, w?: number, h?: number) => void

    feedPosX: number[]
    setFeedPosX: (v: number, index: number) => void

    getInsertIndex: (v: number, centers: number[]) => number
}

export const usePersonaStore = create<PersonaProps>((set, get) => ({
    feed: ['GOO_NATION_1', 'GOO_BUSINESS_1', 'GOO_SCIENCE_1', 'GOO_TECHNOLOGY_1', 'GOO_ENTERTAINMENT_1', 'GOO_SPORTS_1', 'GOO_WORLD_1'],
    setFeed: (v) => set({ feed: v }),
    addFeed: (v) => set(state => {
        if (state.feed.includes(v)) return state;

        const next = [...state.feed, v];
        return {
            feed: next,
            feedPosX: Array(next.length).fill(0),
        };
    }),
    removeFeed: (v) => {
        const idx = get().feed.findIndex(feed => feed === v);

        set(state => {
            const next = state.feed.filter(feed => feed !== v);
            return {
                feed: next,
                feedPosX: Array(next.length).fill(0),
            };
        });
        return idx;
    },
    insertFeed: (v, index) => set(state => {
        if (state.feed.includes(v)) return state;

        const next = [...state.feed];
        // clipping
        const safeIndex = Math.max(0, Math.min(index, next.length));
        next.splice(safeIndex, 0, v);
        return {
            feed: next,
            feedPosX: Array(next.length).fill(0),
        };
    }),

    curPersona: "GOO_NATION_1",
    setCurPersona: (v) => set({ curPersona: v }),

    isDragging: null,
    setIsDragging: (v) => set({ isDragging: v }),

    drag: {x: screen.width / 2, y: screen.height / 2},
    setDrag: (x = get().drag.x, y = get().drag.y) => set((state) => ({ drag: { ...state.drag, x, y } })),

    getPanResponder: () => PanResponder.create({
        onStartShouldSetPanResponder: () => false,  // touch will not activate
        onMoveShouldSetPanResponder: () => get().isDragging !== null, // panning will activate

        onPanResponderMove: (e) => {  // while panning ...
            if (get().isDragging === null) return;
            const { pageX, pageY } = e.nativeEvent;
            get().setDrag(pageX, pageY);
        },

        onPanResponderRelease: () => {  // when touch off
            const isDragging = get().isDragging;

            if (isDragging === null) return;
            if (isDragging === 'feed') {
                if (get().isInsideDropZone(get().drag, get().dropZonePersona)) {
                    get().removeFeed(get().curPersona);
                }
                if (get().isInsideDropZone(get().drag, get().dropZoneFeed)) {
                    const postIndex = get().getInsertIndex(get().drag.x, get().feedPosX);
                    const prevIndex = get().removeFeed(get().curPersona);
                    get().insertFeed(get().curPersona, (postIndex > prevIndex)? postIndex-1 : postIndex);
                }
            }
            if (isDragging === 'persona') {
                if (get().isInsideDropZone(get().drag, get().dropZoneFeed) && get().feed.length < 7) {
                    const insertIndex = get().getInsertIndex(get().drag.x, get().feedPosX);
                    get().insertFeed(get().curPersona, insertIndex);
                }
            }
            get().setIsDragging(null);
        },

        onPanResponderTerminate: () => {  // when interrupted
            if (get().isDragging === null) return;
            get().setIsDragging(null);
        }
    }),

    isInsideDropZone: (pos, zone) => {
        if (!zone) return false;
        return (
            pos.x >= zone.x &&
            pos.x <= zone.x + zone.w &&
            pos.y >= zone.y &&
            pos.y <= zone.y + zone.h
        );
    },

    dropZoneFeed: { x: 0, y: 0, w: 0, h: 0 },
    setDropZoneFeed: (
        x = get().dropZoneFeed.x,
        y = get().dropZoneFeed.y,
        w = get().dropZoneFeed.w,
        h = get().dropZoneFeed.h,
    ) => set((state) => ({ dropZoneFeed: { ...state.dropZoneFeed, x, y, w, h } })),

    dropZonePersona: { x: 0, y: 0, w: 0, h: 0 },
    setDropZonePersona: (
        x = get().dropZonePersona.x,
        y = get().dropZonePersona.y,
        w = get().dropZonePersona.w,
        h = get().dropZonePersona.h,
    ) => set((state) => ({ dropZonePersona: { ...state.dropZonePersona, x, y, w, h } })),

    feedPosX: [],
    setFeedPosX: (v, index) => set(state => {
        const next = [...state.feedPosX];
        const len = state.feed.length;
        if (index < 0 || index >= len) return state;
        next[index] = v;

        return { feedPosX: next };
    }),

    getInsertIndex: (v, centers) => {
        const len = centers.length;
        if (len === 0) return 0;
        for (let i=0; i<len; ++i) if (v < centers[i]) return i;
        return len;
    },
}));