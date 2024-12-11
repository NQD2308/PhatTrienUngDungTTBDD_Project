import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import Toast from "react-native-toast-message";
import FontAwesome from 'react-native-vector-icons/FontAwesome6';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const forgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập email hợp lệ.",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Email khôi phục đã được gửi!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể gửi email. Vui lòng thử lại.",
      });
      console.error("Error sending password reset email:", error);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/4641825/pexels-photo-4641825.jpeg?auto=compress&cs=tinysrgb&w=600',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.brandView}>
        <FontAwesome name="shopware" style={{ color: '#fff', fontSize: 60 }} />
        <Text style={styles.brandViewText}>Clothes's Store</Text>
      </View>
      <KeyboardAvoidingView style={styles.formContainer}>
        <Text style={styles.header}>Forgot Password</Text>
        {/* Form Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Enter your email..."
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={forgotPassword}>
          <Text style={styles.buttonText}>Send it</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <Toast />
    </ImageBackground>

  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandView: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandViewText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  formContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#344E41',
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
  button: {
    backgroundColor: '#344E41',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
