import { colors } from "@/constants/colors";
import { fontSize, scale, screen, space } from "@/constants/sizes";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import personas from '@/resources/personas.json';
import { usePersonaStore } from "@/systems/persona";
import { useEffect, useRef } from "react";
import Token from "./Token";

export default function Personas() {
  const isDragging = usePersonaStore(s => s.isDragging);
  const setDropZone = usePersonaStore(s => s.setDropZonePersona);
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
    <View style={styles.container} ref={cardContainerRef}>
        <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}>
            <View style={styles.grid}>
                {personas.slice(1).map((persona) => 
                  <Token
                    key={persona.id}
                    personaId={persona.id}
                    location="persona" />
                )}
            </View>
        </ScrollView>

        <Text style={styles.instruction}>
          {isDragging === 'persona'
            ? "피드로 드래그 해서 추가"
            : isDragging === 'feed'
              ? "피드 순서 변경 또는 아래로 옮겨서 제거"
              : "아이콘을 터치해서 설명을, 꾹 누른 후 드래그 해서 피드에 추가하세요"}
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    width: screen.width,
    height: scale(700),
    borderColor: colors.grayLight,
    borderWidth: space.borderWidth,
    backgroundColor: colors.main,
    padding: scale(80),
    overflow: "scroll",
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: scale(96),
  },
  instruction: {
    position: 'absolute',
    bottom: scale(24),
    color: colors.black,
    fontSize: fontSize.menu,
    textAlign: "center",
    fontWeight: "500",
  },
});
