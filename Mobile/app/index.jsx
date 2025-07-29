import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to nati app.</Text>
      <Link href="/about">About</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "yellow",
  },

  heading: {
    fontSize: 24,
    color: "black",
    fontWeight: "bold",
  },
});
