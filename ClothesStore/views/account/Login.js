import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Checkbox from "expo-checkbox";
import React, { useState, useEffect } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { collection, where, query, getDocs } from "firebase/firestore";
import FontAwesome from "react-native-vector-icons/FontAwesome6";
import * as LocalAuthentication from "expo-local-authentication";
import i18next, { languageResources } from "../../services/i18next";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const auth = FIREBASE_AUTH;

  useEffect(() => {
    loadRememberedEmail();
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
      // Lấy email từ AsyncStorage
      const emailRemember = await AsyncStorage.getItem("rememberedEmail");

      // Truy vấn tài liệu từ Firestore theo email
      const usersRef = collection(FIREBASE_DB, "User");
      const q = query(usersRef, where("email", "==", emailRemember));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data(); // Lấy tài liệu đầu tiên
        const biometrix = userData.biometricEnabled;
        console.log("biometrix: " + biometrix);

        if (biometrix) {
          // Trả về giá trị `biometricEnabled`
          return true;
        } else {
          return false;
        }
      } else {
        Alert.alert(i18next.t("Message"), i18next.t("User with this email was not found."));
        return false; // Trả về false nếu không tìm thấy
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra xác thực vân tay: ", error);
      Alert.alert(i18next.t("Message"), i18next.t("An error occurred while checking the fingerprint."));
      return false; // Trả về false nếu có lỗi
    }
  };

  // Hàm xác thực vân tay
  const handleBiometricAuth = async () => {
    try {
      setLoading(true); // Bật chế độ loading

      if (!email) {
        Alert.alert(i18next.t("Message"), "Please enter your email!");
      } else {
        const emailRemember = await AsyncStorage.getItem("rememberedEmail");
        if (!emailRemember) {
          Alert.alert(
            i18next.t("Message"),
            i18next.t("Please log in and select the remember first time function to use this feature!")
          );
        } else {
          const compatible = await LocalAuthentication.hasHardwareAsync(); // kiểm tra hệ thống có hỗ trợ sinh trác học hay không
          if (!compatible) {
            Alert.alert(i18next.t("Message"), i18next.t("The device does not support biometrics!"));
          } else {
            // Kiểm tra xác thực vân tay trước
            const canAuthenticate = await checkBiometricLogin();

            console.log("trạng thí xác thực: " + canAuthenticate);

            if (canAuthenticate) {
              // Thực hiện xác thực nếu `biometricEnabled` là true
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: i18next.t("Authenticate with your fingerprint to log in"),
                cancelLabel: i18next.t("Cancel"),
              });

              if (result.success) {
                // Toast.show({
                //   type: "success",
                //   text1: "Xác thực thành công!",
                //   text2: "Bạn đã đăng nhập thành công.",
                // });
                // Tự động lấy email và mật khẩu đã lưu từ AsyncStorage
                const savedEmail = await AsyncStorage.getItem(
                  "rememberedEmail"
                );
                const savedPassword = await AsyncStorage.getItem(
                  "rememberedPassword"
                );

                if (savedEmail && savedPassword) {
                  // Đăng nhập tự động với email và mật khẩu đã lưu
                  await signIn(savedEmail, savedPassword);
                } else {
                  Alert.alert(
                    i18next.t("Message"),
                    i18next.t("Login information not found. Please log in manually.")
                  );
                }
                // navigation.replace("Inside"); // Chuyển hướng đến trang chính
              } else {
                Toast.show({
                  type: "error",
                  text1: i18next.t("Authentication failed!"),
                  text2: i18next.t("Please log in manually."),
                });
              }
            } else {
              // Hiển thị thông báo nếu không thể xác thực
              Alert.alert(
                i18next.t("Message"),
                i18next.t("Fingerprint authentication is not currently enabled. Please enable it after logging in to use this feature.")
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi xác thực sinh trắc học: ", error);
      Toast.show({
        type: "error",
        text1: i18next.t("Error"),
        text2: i18next.t("An error occurred during fingerprint authentication."),
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
        text1: i18next.t("Login failed"),
        text2: i18next.t("The email format is incorrect!"),
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
        text1: i18next.t("Login successful"),
        text2: i18next.t("Welcome back!"),
      });

      navigation.replace("Inside", { userId: response.user.uid });
    } catch (error) {
      console.error("Login Error:", error.message);
      Toast.show({
        type: "error",
        text1: i18next.t("Login failed"),
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Background Image */}
        <ImageBackground
          source={{
            uri: "https://images.pexels.com/photos/9594681/pexels-photo-9594681.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
          }}
          style={{
            height: Dimensions.get("window").height / 1.7,
          }}
        >
          <View style={styles.brandView}>
            <FontAwesome
              name="shopware"
              style={{ color: "#fff", fontSize: 80 }}
            />
            <Text style={styles.brandViewText}>
              {i18next.t("Clothes's Store")}
            </Text>
          </View>
        </ImageBackground>

        {/* Bottom Section */}
        <View style={styles.bottomView}>
          <View style={{ padding: 20 }}>
            <Text style={styles.welcomeText}>{i18next.t("Welcome")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.subText}>
                {i18next.t("Don't have an account?")}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={styles.registerText}>
                  {i18next.t("Register now")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Inputs */}
            <View style={{ marginTop: 30 }}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={i18next.t("Your Email...")}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={i18next.t("Your Password...")}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <FontAwesome
                    name={showPassword ? "eye" : "eye-slash"}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <View style={styles.rememberMeContainer}>
                <Checkbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  color={rememberMe ? "#343A40" : undefined}
                />
                <Text style={styles.rememberMeText}>
                  {i18next.t("Remember Me")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>
                  {i18next.t("Forgot password")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button & Fingerprint */}

            {loading ? (

              <ActivityIndicator size="large" color="#2f4f4f" style={{ marginTop: 15 }} />


            ) : (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => signIn()}
                >
                  <Text style={styles.loginButtonText}>
                    {i18next.t("Login")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fingerprintButton}
                  onPress={handleBiometricAuth}
                >
                  <FontAwesome name="fingerprint" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  brandView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brandViewText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 10,
  },
  bottomView: {
    flex: 1.5,
    backgroundColor: "#fff",
    borderTopStartRadius: 40,
    borderTopEndRadius: 40,
    marginTop: -40,
  },
  welcomeText: {
    color: "#212529",
    fontSize: 34,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 16,
    marginTop: 5,
  },
  registerText: {
    color: "#212529",
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#212529",
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  eyeIcon: {
    fontSize: 20,
    color: "#212529",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Ensure vertical alignment
    marginTop: 20,
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center", // Ensure vertical alignment
  },
  rememberMeText: {
    fontSize: 14,
    color: "#212529",
    marginLeft: 8, // Add space between checkbox and text
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#212529",
    textDecorationLine: "underline",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    // marginTop: 30,
  },
  loginButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#212529",
    borderRadius: 20,
    ...Platform.select({
      android: {
        paddingVertical: 10,
      },
      ios: {
        paddingVertical: 12,
      }
    }),
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  loginButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  fingerprintButton: {
    backgroundColor: "#212529",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5, // Space between login and fingerprint
    ...Platform.select({
      android: {
        width: 45,
        height: 45,
      },
      ios: {
        width: 50,
        height: 50,

      },
    }),
    paddingVertical: 10,
    borderRadius: 50,
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
