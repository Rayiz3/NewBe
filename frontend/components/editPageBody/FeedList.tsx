import { colors } from "@/constants/colors";
import { fontSize, scale, screen, space } from "@/constants/sizes";
import { usePersonaDropZone, usePersonaStore } from "@/systems/persona";
import { StyleSheet, Text, View } from "react-native";
import Token from "./Token";

export default function FeedList() {
  const feed = usePersonaStore(s => s.feed);
  const { cardContainerRef, measureDropZone } = usePersonaDropZone("feed");

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>피드 목록</Text>
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {feed.length} / 7
        </Text>
      </View>
      
      <View
        style={styles.cardContainer}
        ref={cardContainerRef}
        onLayout={() => measureDropZone()}>
          {feed.map((personaId, index) => 
            <Token
              key={personaId}
              personaId={personaId}
              location="feed"
              index={index} />
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screen.width,
    paddingTop: scale(24),
    paddingBottom: scale(24),
    paddingHorizontal: space.mainPadding,
    backgroundColor: '#ffffff',
    borderTopColor: colors.grayLight,
    borderTopWidth: space.borderWidth,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(20),
    marginBottom: scale(20),
  },
  title: {
    color: colors.black,
    fontSize: fontSize.menuTitle2,
    fontWeight: "700",
  },
  count: {
    color: colors.black,
    fontSize: fontSize.menuBody,
    textAlign: "right",
    fontVariant: ['tabular-nums'],
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(32),
    width: "100%",
    height: scale(180),
    borderRadius: scale(15),
    paddingHorizontal: space.mainPadding,
  },
});
