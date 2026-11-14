import { colors } from "@/constants/colors";
import { fontSize, space } from "@/constants/sizes";
import { StyleSheet, Text, View } from "react-native";

import personas from '@/resources/personas.json';
import { usePersonaDropZone, usePersonaStore } from "@/systems/persona";
import Token from "./Token";

export default function Personas() {
  const isDragging = usePersonaStore(s => s.isDragging);
  const { cardContainerRef, measureDropZone } = usePersonaDropZone("persona");

  return (
    <View style={styles.container} ref={cardContainerRef} onLayout={measureDropZone}>
        <View style={styles.scroll}>
            <View style={styles.grid}>
                {personas.slice(1).map((persona) => 
                  <Token
                    key={persona.id}
                    personaId={persona.id}
                    location="persona" />
                )}
            </View>
        </View>

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
    width: "100%",
    minHeight: 260,
    borderColor: colors.grayLight,
    borderWidth: space.borderWidth,
    backgroundColor: colors.main,
    padding: 20,

  },
  scroll: {
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
  },
  instruction: {
    marginTop: 24,
    color: colors.black,
    fontSize: fontSize.menu,
    textAlign: "center",
    fontWeight: "500",
  },
});
