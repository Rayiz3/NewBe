import { SafeAreaView } from 'react-native-safe-area-context';
import DragOverlay from "@/components/editPageBody/DragOverlay";
import FeedList from "@/components/editPageBody/FeedList";
import Personas from "@/components/editPageBody/Personas";
import Profile from "@/components/editPageBody/Profile";
import MenuHeader from "@/components/MenuHeader";
import { saveCurrentFeed } from "@/systems/account";
import { usePersonaStore } from "@/systems/persona";
import { useNavigation } from "expo-router";
import { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function EditPage() {
    const isDragging = usePersonaStore(s => s.isDragging);
    const getPanResponder = usePersonaStore(s => s.getPanResponder);

    const panResponder = useMemo(getPanResponder, [getPanResponder]);
    const navigation = useNavigation();

    useEffect(() => {
        return navigation.addListener('beforeRemove', saveCurrentFeed);
    }, [navigation]);

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container} {...panResponder.panHandlers}>
            <MenuHeader name="편집하기" />
            <ScrollView scrollEnabled={!isDragging} onScroll={() => usePersonaStore.getState().refreshLayout()} scrollEventThrottle={32}
                contentContainerStyle={styles.content}>
            <Profile />
            <FeedList />
            <Personas />
            </ScrollView>
            {isDragging && <DragOverlay />}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    content: { width: "100%", alignSelf: "center", paddingBottom: 32 },
    container: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: "100%",
        height: "100%",
        backgroundColor: '#ffffff',
    }
})