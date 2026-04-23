import { space } from "@/constants/sizes";
import { usePersonaStore } from "@/systems/persona";
import { useScrollStore } from "@/systems/scroll";
import { StyleSheet, View } from "react-native";
import { Dot } from "./Dot";

export default function PageIndicator() {
    const curPage = useScrollStore(s => s.curPage);
    const feed = usePersonaStore(s => s.feed);

    return (
      <View style={styles.indicator}>
        {feed.map((_, index) => (
          <Dot key={index} active={curPage === index} />
        ))}
      </View>
    )
}

const styles = StyleSheet.create({
    indicator: {
        marginTop: space.contentPadding,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 9
    }
});