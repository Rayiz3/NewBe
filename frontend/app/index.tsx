import DateIndicator from "@/components/DateIndicator";
import Footer from "@/components/mainFooter/Footer";
import { StyleSheet, View } from "react-native";
import Body from "../components/mainBody/Body";


export default function Index() {

  return (
    <View style={styles.container}>
      <DateIndicator />
      <Body />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  }
});
