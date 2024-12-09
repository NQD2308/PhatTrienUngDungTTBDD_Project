import { View, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const innerDimension = 300;

export const Overlay = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.outerOverlay]} />
      <View style={styles.centerOverlay}>
        <View style={styles.transparentSquare} />
      </View>
      <View style={[styles.outerOverlay]} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centerOverlay: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  transparentSquare: {
    width: innerDimension,
    height: innerDimension,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
  },
});
