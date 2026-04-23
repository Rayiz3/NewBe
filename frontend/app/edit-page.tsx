import DragOverlay from "@/components/editPageBody/DragOverlay";
import FeedList from "@/components/editPageBody/FeedList";
import Personas from "@/components/editPageBody/Personas";
import Profile from "@/components/editPageBody/Profile";
import MenuHeader from "@/components/MenuHeader";
import { colors } from "@/constants/colors";
import { updateFeed, useAccountStore } from "@/systems/account";
import { usePersonaStore } from "@/systems/persona";
import { useNavigation } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";

export default function EditPage() {
    const userId = useAccountStore(s => s.userId);
    const isLogin = useAccountStore(s => s.isLogin);
    const isDragging = usePersonaStore(s => s.isDragging);
    const setIsDragging = usePersonaStore(s => s.setIsDragging);
    const setDrag = usePersonaStore(s => s.setDrag);
    const getPanResponder = usePersonaStore(s => s.getPanResponder);

    const panResponder = useMemo(getPanResponder, [isDragging, setDrag, setIsDragging]);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!userId || !isLogin) return
            updateFeed();
        });

        return unsubscribe;
    }, [navigation, userId]);

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <MenuHeader name="편집하기" />
            <Profile />
            <FeedList />
            <Personas />
            {isDragging && <DragOverlay />}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: "100%",
        height: "100%",
        backgroundColor: colors.white,
    }
})