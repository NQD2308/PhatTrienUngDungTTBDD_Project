import { StatusBar } from "expo-status-bar";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";

import React, { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation();

  const signUp = async () => {
    // Kiểm tra nếu mật khẩu và xác nhận mật khẩu không khớp
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    setLoading(true);
    try {
      // Đăng ký tài khoản qua Firebase Authentication
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user; // Lấy user object từ Firebase Auth
  
      // Lấy giá trị counter hiện tại từ Firestore
      const counterDocRef = doc(FIREBASE_DB, "Counters", "UserCounter");
      const counterDoc = await getDoc(counterDocRef);
  
      let newId;
      if (counterDoc.exists()) {
        // Lấy giá trị hiện tại và tăng lên 1
        const currentId = counterDoc.data().currentId;
        newId = currentId + 1;
  
        // Cập nhật giá trị mới cho counter
        await updateDoc(counterDocRef, { currentId: newId });
      } else {
        // Nếu chưa có Counter, khởi tạo giá trị ban đầu là 1
        newId = 1;
        await setDoc(counterDocRef, { currentId: newId });
      }
  
      // Lưu thông tin người dùng vào Firestore
      const userDoc = doc(FIREBASE_DB, "User", String(newId));
      await setDoc(userDoc, {
        uid: user.uid, // Thêm UID từ Firebase Authentication
        username: username,
        email: email,
        phone: phone,
        createdAt: new Date().toISOString(), // Thêm thời gian tạo tài khoản (tùy chọn)
      });
      
      alert("Registration successful!");
      navigation.replace("Login");
    } catch (error) {
      console.log(error);
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="words"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Num  ber"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => setPhone(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />
      {loading ? (
        <ActivityIndicator size={"large"} color={"#0000ff"} />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={() => signUp()}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity>
        <Text style={styles.linkText}>Already have an account? Login here</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 40,
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
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
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
