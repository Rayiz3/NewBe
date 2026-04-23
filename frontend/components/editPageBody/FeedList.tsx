import { colors } from "@/constants/colors";
import { fontSize, scale, screen, space } from "@/constants/sizes";
import { usePersonaStore } from "@/systems/persona";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Token from "./Token";

export default function FeedList() {
  const feed = usePersonaStore(s => s.feed);
  const setDropZone = usePersonaStore(s => s.setDropZoneFeed);
  const cardContainerRef = useRef<View>(null);

  const measureDropZone = () => {
    cardContainerRef.current?.measureInWindow((x, y, w, h) => {
      setDropZone(x, y, w, h);
    });
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      measureDropZone();
    });

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>피드 목록</Text>
      
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
    marginTop: scale(24),
    marginBottom: scale(24),
    paddingHorizontal: space.mainPadding,
  },
  title: {
    color: colors.black,
    fontSize: fontSize.menuTitle2,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: scale(20),
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(36),
    width: "100%",
    height: scale(180),
    backgroundColor: colors.secondary,
    borderRadius: scale(15),
    paddingHorizontal: space.mainPadding,
  },
});
