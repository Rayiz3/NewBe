import { colors } from "@/constants/colors";
import { scale, screen, space } from "@/constants/sizes";
import { StyleSheet, View } from "react-native";
import NavigationButton from "./NavigationButton";
import PageIndicator from "./PageIndicator";

export default function Footer() {
  return (
    <View style={styles.container}>
      <NavigationButton name="편집" side="L" />
      <PageIndicator />
      <NavigationButton name="더보기" side="R" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: screen.width,
    height: scale(270),
    paddingHorizontal: space.mainPadding,
    backgroundColor: colors.mainOpacity,
    borderTopColor: colors.grayLight,
    borderTopWidth: space.borderWidth,
    zIndex: 10,
  }
});
