import { StatusBar } from "expo-status-bar";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  View,
  ImageBackground,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";

import React, { useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Import Icon
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { FontAwesome } from '@expo/vector-icons';

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Hiển thị mật khẩu
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Hiển thị xác nhận mật khẩu
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation();

  // Yêu cầu password > 6 ký tự
  const isPasswordValid = password.length >= 6;

  const signUp = async () => {
    // Kiểm tra nếu có trường nào trống
    if (!username || !email || !phone || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill out all the fields.",
      });
      return;
    }

    // Kiểm tra nếu email không đúng định dạng
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Passwords do not match!",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = response.user;

      const counterDocRef = doc(FIREBASE_DB, "Counters", "UserCounter");
      const counterDoc = await getDoc(counterDocRef);

      let newId;
      if (counterDoc.exists()) {
        const currentId = counterDoc.data().currentId;
        newId = currentId + 1;
        await updateDoc(counterDocRef, { currentId: newId });
      } else {
        newId = 1;
        await setDoc(counterDocRef, { currentId: newId });
      }

      const userDoc = doc(FIREBASE_DB, "User", String(newId));
      await setDoc(userDoc, {
        uid: user.uid,
        avatar: "defaultAvatar.png",
        username: username,
        email: email,
        phone: phone,
        biometricEnabled: false,
        createdAt: new Date().toISOString(),
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Registration successful!",
      });
      navigation.replace("Inside");
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/4721153/pexels-photo-4721153.jpeg?auto=compress&cs=tinysrgb&w=600',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView style={styles.formContainer}>
        <Text style={styles.header}>Register</Text>
        <Text style={styles.orText}> with your details</Text>

        {/* Form Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Username..."
          autoCapitalize="words"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Email..."
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number..."
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => setPhone(text)}
        />
        {/* Password Field */}
        <View style={styles.input}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => setPassword(text)}
            onFocus={() => setShowPasswordRequirements(true)}
            onBlur={() => setShowPasswordRequirements(false)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#00000"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Field */}
        <View style={styles.input}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            onFocus={() => setShowPasswordRequirements(true)}
            onBlur={() => setShowPasswordRequirements(false)}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#00000"
            />
          </TouchableOpacity>
        </View>
        {showPasswordRequirements && (
          <View style={styles.passwordRequirement}>
            <Icon
              name={
                isPasswordValid
                  ? "checkbox-marked-circle"
                  : "checkbox-blank-circle"
              }
              size={24}
              color={isPasswordValid ? "green" : "gray"}
            />
            <Text
              style={[
                styles.requirement,
                isPasswordValid && styles.requirementMet,
              ]}
            >
              Password must be at least 6 characters long.
            </Text>
          </View>
        )}

        {/* Submit Button */}
        {loading ? (
          <ActivityIndicator size={"large"} color={"#0000ff"} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={() => signUp()}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        )}

        {/* Navigate to Login */}
        <TouchableOpacity
          style={styles.loginRedirect}
          onPress={() => navigation.navigate('Login')} // Điều hướng tới trang Login
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Login here</Text>
          </Text>
        </TouchableOpacity>

        <Toast />
      </KeyboardAvoidingView>

      {/* <TextInput
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
      /> */}

      {/* <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => setPhone(text)}
      /> */}

      {/* <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => setPassword(text)}
          onFocus={() => setShowPasswordRequirements(true)}
          onBlur={() => setShowPasswordRequirements(false)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#007BFF"
          />
        </TouchableOpacity>
      </View> */}

      {/* <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          onFocus={() => setShowPasswordRequirements(true)}
          onBlur={() => setShowPasswordRequirements(false)}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Icon
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={24}
            color="#007BFF"
          />
        </TouchableOpacity>
      </View> */}

      {/* {loading ? (
        <ActivityIndicator size={"large"} color={"#0000ff"} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => signUp()}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )} */}

      {/* <TouchableOpacity>
        <Text style={styles.linkText}>Already have an account? Login here</Text>
      </TouchableOpacity>

      <Toast /> */}

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#00000',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 5,
    fontSize: 18,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordContainer: {
    paddingVertical: 0, // Đảm bảo icon không bị lệch
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF5733',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginRedirect: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    color: '#FF5733',
    fontWeight: 'bold',
  },
});
