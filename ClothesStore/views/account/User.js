import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import { CommonActions } from '@react-navigation/native';

export default function User({ navigation, route }) {
  const { userId } = route.params || {}; // Nhận userId từ route.params
  const safeUserId = userId || "guest"; // Giá trị mặc định nếu không có userId

  console.log("User ID tại User.js: ", safeUserId);

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert("Đăng xuất thành công!");
      navigation.replace("Inside");

      // Reset toàn bộ điều hướng
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Inside" }], // Điều hướng về màn hình Login
        })
      );
    } catch (error) {
      console.error("Lỗi khi đăng xuất: ", error);
      Alert.alert("Đã xảy ra lỗi khi đăng xuất, vui lòng thử lại!");
    }
  };

  if (userId === "guest") {
    // Nếu chưa đăng nhập, hiển thị nút Đăng Nhập
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Bạn chưa đăng nhập</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Đăng Nhập</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Page</Text>
      <Text style={styles.info}>User ID: {safeUserId}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Đăng Xuất</Text>
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
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
