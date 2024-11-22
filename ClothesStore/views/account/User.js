import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import { CommonActions } from '@react-navigation/native';
import { collection, query, where, getDocs } from "firebase/firestore"; // Import các hàm Firestore
import Toast from "react-native-toast-message";

export default function User({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null); // Lưu thông tin người dùng
  const { userId } = route.params || {}; // Nhận userId từ route.params
  const safeUserId = userId || "guest"; // Giá trị mặc định nếu không có userId

  console.log("User ID tại User.js: ", safeUserId);

  useEffect(() => {
    if (safeUserId !== "guest") {
      fetchUserData(); // Gọi hàm lấy dữ liệu
    } else {
      setLoading(false); // Không cần tải dữ liệu nếu là guest
    }
  }, [safeUserId]);

  const fetchUserData = async () => {
    try {
      // Truy vấn người dùng theo UID
      const userQuery = query(
        collection(FIREBASE_DB, "User"), // Collection 'users'
        where("uid", "==", safeUserId) // Tìm document có trường 'uid' trùng với userId
      );
      
      const querySnapshot = await getDocs(userQuery); // Thực thi truy vấn

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setUserData(doc.data()); // Lưu dữ liệu vào state
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không tìm thấy người dùng!",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng: ", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin người dùng!",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }


  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đăng xuất thành công!",
      });
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
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi khi đăng xuất, vui lòng thử lại!",
      });
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
      <Text style={styles.title}>Thông Tin Người Dùng</Text>
      {userData ? (
        <>
          <Text style={styles.info}>Email: {userData.email}</Text>
          <Text style={styles.info}>Số điện thoại: {userData.phone}</Text>
          <Text style={styles.info}>Username: {userData.username}</Text>
        </>
      ) : (
        <Text style={styles.info}>Không có thông tin</Text>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Đăng Xuất</Text>
      </TouchableOpacity>

      <Toast/>
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
