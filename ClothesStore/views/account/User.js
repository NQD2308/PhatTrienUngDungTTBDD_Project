import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

export default function User({ navigation }) {
  const handleNavigateToLogin = () => {
    navigation.navigate("Login"); // Chuyển hướng sang trang Login
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Page</Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleNavigateToLogin}>
        <Text style={styles.loginText}>Đăng Nhập</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
