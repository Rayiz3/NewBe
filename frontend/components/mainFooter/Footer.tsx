import { colors } from "@/constants/colors";
import { space } from "@/constants/sizes";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import NavigationButton from "./NavigationButton";
import PageIndicator from "./PageIndicator";

export default function Footer() {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.container, { height: width >= 600 ? 80 : width * 270 / 1080 }]}>
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
    width: "100%",

    paddingHorizontal: space.mainPadding,
    backgroundColor: '#ffffff',
    borderTopColor: colors.grayLight,
    borderTopWidth: space.borderWidth,
    zIndex: 10,
  }
});
