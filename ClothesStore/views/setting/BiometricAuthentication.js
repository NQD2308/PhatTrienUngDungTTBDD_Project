import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Switch } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { doc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

export default function BiometricAuthentication({ route }) {
  const { userId } = route.params || {};
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Lấy trạng thái ban đầu từ Firebase khi màn hình được tải
  useEffect(() => {
    const fetchBiometricStatus = async () => {
      try {
        const userQuery = query(
          collection(FIREBASE_DB, "User"),
          where("uid", "==", userId)
        );

        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const biometricEnabled = userData.biometricEnabled || false;

          setBiometricEnabled(biometricEnabled);
          console.log("Trạng thái biometric:", biometricEnabled);
        } else {
          console.warn("Không tìm thấy tài liệu người dùng với UID:", userId);
        }
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái biometric:", error);
      }
    };

    fetchBiometricStatus();
  }, [userId]);

  // Hàm yêu cầu xác thực vân tay
  const authenticateBiometric = async () => {
    const hasBiometric = await LocalAuthentication.hasHardwareAsync();
    if (!hasBiometric) {
      console.log("Thiết bị không hỗ trợ xác thực vân tay");
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      console.log("Không có dấu vân tay nào đã được đăng ký trên thiết bị");
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác thực vân tay để tiếp tục",
        fallbackLabel: "Sử dụng mật khẩu",
      });

      return result.success;
    } catch (error) {
      console.log("Lỗi xác thực vân tay:", error);
      return false;
    }
  };

  // Hàm cập nhật trạng thái biometricEnabled trong Firestore
  const toggleBiometric = async (value) => {
    if (value) {
      // Nếu bật, yêu cầu xác thực vân tay
      const isAuthenticated = await authenticateBiometric();

      if (isAuthenticated) {
        setBiometricEnabled(true);
        try {
          const userQuery = query(
            collection(FIREBASE_DB, "User"),
            where("uid", "==", userId)
          );

          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            const userRef = doc(FIREBASE_DB, "User", querySnapshot.docs[0].id);
            await updateDoc(userRef, {
              biometricEnabled: true,
            });
            console.log("Trạng thái biometric đã được cập nhật: true");
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật trạng thái biometric:", error);
        }
      } else {
        // Nếu không xác thực thành công, tắt toggle lại
        setBiometricEnabled(false);
      }
    } else {
      // Nếu tắt, cập nhật lại trạng thái trong Firestore
      setBiometricEnabled(false);
      try {
        const userQuery = query(
          collection(FIREBASE_DB, "User"),
          where("uid", "==", userId)
        );

        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userRef = doc(FIREBASE_DB, "User", querySnapshot.docs[0].id);
          await updateDoc(userRef, {
            biometricEnabled: false,
          });
          console.log("Trạng thái biometric đã được cập nhật: false");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái biometric:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Xác nhận vân tay</Text>
        <Switch value={biometricEnabled} onValueChange={toggleBiometric} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
  },
});
