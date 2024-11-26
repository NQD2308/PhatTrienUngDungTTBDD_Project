import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import React, { useState, useEffect } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { collection, where, query, getDocs } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as LocalAuthentication from "expo-local-authentication";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const auth = FIREBASE_AUTH;

  useEffect(() => {
    loadRememberedEmail();
    checkBiometricLogin();
  }, []);

  // Load email được lưu nếu "Remember Me" được bật
  const loadRememberedEmail = async () => {
    const savedEmail = await AsyncStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  };

  // Kiểm tra xác thực vân tay
  const checkBiometricLogin = async () => {
    try {
        // Lấy email từ AsyncStorage hoặc một nơi khác
        const email = await AsyncStorage.getItem('rememberedEmail');
        if (!email) {
            console.error("Không có email người dùng");
            return;
        }

        // Truy vấn tài liệu người dùng từ Firestore bằng email
        const usersRef = collection(FIREBASE_DB, "User");
        const q = query(usersRef, where("email", "==", email)); // Truy vấn theo email

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const useBiometrics = userData.biometricEnabled;

                // Kiểm tra nếu tính năng vân tay được bật
                if (useBiometrics) {
                    handleBiometricAuth();
                } else {
                    Toast.show({
                        type: 'info',
                        text1: 'Xác thực vân tay bị vô hiệu hóa',
                        text2: 'Bạn không thể sử dụng xác thực vân tay.',
                    });
                }
            });
        } else {
            console.error("Không tìm thấy người dùng với email: ", email);
        }
    } catch (error) {
        console.error("Lỗi khi kiểm tra xác thực vân tay: ", error);
    }
};

  // Hàm xác thực vân tay
  const handleBiometricAuth = async () => {
    try {
        setLoading(true); // Bật chế độ loading

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Xác thực để đăng nhập",
            cancelLabel: "Hủy",
        });

        if (result.success) {
            Toast.show({
                type: 'success',
                text1: 'Xác thực thành công!',
                text2: 'Bạn đã đăng nhập thành công.',
            });
            navigation.replace('Inside'); // Chuyển hướng đến trang chính
        } else {
            Toast.show({
                type: 'error',
                text1: 'Xác thực thất bại!',
                text2: 'Vui lòng thử lại.',
            });
        }
    } catch (error) {
        console.error("Lỗi khi xác thực sinh trắc học: ", error);
        Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Đã xảy ra lỗi khi xác thực vân tay.',
        });
    } finally {
        setLoading(false); // Tắt chế độ loading sau khi hoàn tất
    }
};

  // Hàm đăng nhập
  const signIn = async (emailInput = email, passwordInput = password) => {
    if (!isValidEmail(emailInput)) {
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: "Email không đúng định dạng!",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        emailInput,
        passwordInput
      );

      if (rememberMe) {
        await AsyncStorage.setItem("rememberedEmail", emailInput);
        await AsyncStorage.setItem("rememberedPassword", passwordInput);
      } else {
        await AsyncStorage.removeItem("rememberedEmail");
        await AsyncStorage.removeItem("rememberedPassword");
      }

      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công",
        text2: "Chào mừng bạn quay trở lại!",
      });

      navigation.replace("Inside", { userId: response.user.uid });
    } catch (error) {
      console.error("Login Error:", error.message);
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Xác minh email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clothes Store</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#007BFF"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.rememberMeContainer}>
        <Checkbox
          value={rememberMe}
          onValueChange={setRememberMe}
          color={rememberMe ? "#007BFF" : undefined}
        />
        <Text style={styles.rememberMeText}>Remember Me</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => signIn()}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.biometricButton}
        onPress={handleBiometricAuth}
      >
        <Text style={styles.buttonText}>Login with Fingerprint</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.linkText}>Forgot password!</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.linkText}>
          Don't have an account? Register here
        </Text>
      </TouchableOpacity>
      <Toast />
    </View>
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  inputPassword: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  showPasswordButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMeText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  biometricButton: {
  width: "100%",
  height: 50,
  backgroundColor: "#28a745", // Màu xanh lá
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
  marginTop: 10, // Khoảng cách với các phần khác
},
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    fontSize: 16,
    color: "#007BFF",
    marginTop: 10,
  },
});
