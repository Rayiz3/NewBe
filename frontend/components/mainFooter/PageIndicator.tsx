import { space } from "@/constants/sizes";
import { usePersonaStore } from "@/systems/persona";
import { useRequestStore } from "@/systems/request";
import { useScrollStore } from "@/systems/scroll";
import { StyleSheet, View } from "react-native";
import { Dot } from "./Dot";

export default function PageIndicator() {
    const curPage = useScrollStore(s => s.curPage);
    const feed = usePersonaStore(s => s.feed);
    const summaries = useRequestStore(s => s.summaries);

    return (
      <View style={styles.indicator}>
        {feed.filter(id => summaries[id]).map((id, index) => (
          <Dot key={id} active={curPage === index} />
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
