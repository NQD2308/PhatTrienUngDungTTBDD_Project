import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import i18next from "../../services/i18next";

export default function Scanner({ route }) {
  const { userId } = route.params;
  const navigation = useNavigation();
  const qrLock = useRef(false);
  const timeoutRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [qrData, setQrData] = useState(null);

  const borderSize = 200; // Kích thước viền

  const animatedBorderPosition = useRef(
    new Animated.ValueXY({ x: 0, y: 0 }) // Khởi tạo ở góc trên
  ).current;

  useFocusEffect(
    React.useCallback(() => {
      qrLock.current = false;
      setQrData(null);
      clearTimeout(timeoutRef.current);

      // Reset vị trí viền về giữa màn hình
      Animated.timing(animatedBorderPosition, {
        toValue: {
          x: (Dimensions.get("window").width - borderSize) / 2,
          y: (Dimensions.get("window").height - borderSize) / 2,
        },
        duration: 250,
        useNativeDriver: false,
      }).start();

      return () => {
        clearTimeout(timeoutRef.current);
      };
    }, [])
  );

  const handleBarcodeScanned = ({ bounds, data }) => {
    if (data && !qrLock.current) {
      const { origin, size } = bounds;

      // Tính toán vị trí trung tâm của mã QR
      const centerX = origin.x + size.width / 2;
      const centerY = origin.y + size.height / 2;

      // Di chuyển viền đến trung tâm mã QR
      Animated.timing(animatedBorderPosition, {
        toValue: { x: centerX - borderSize / 2, y: centerY - borderSize / 2 },
        duration: 250, // Thời gian chuyển động
        useNativeDriver: false,
      }).start();

      // Điều hướng sau khi phát hiện mã QR
      qrLock.current = true;
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        navigation.navigate("Detail", { productId: data, userId: userId });
      }, 500);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          {i18next.t("We need your permission to show the camera")}
          
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}

      {/* Camera view */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Viền động */}
      <Animated.View
        style={[
          styles.border,
          {
            width: borderSize,
            height: borderSize,
            transform: [
              { translateX: animatedBorderPosition.x },
              { translateY: animatedBorderPosition.y },
            ],
          },
        ]}
      />

      {/* Text chỉ dẫn */}
      <Animated.Text
        style={[
          styles.text,
          {
            position: "absolute",
            top: Animated.subtract(animatedBorderPosition.y, 30), // Nằm trên ngoài khu vực viền (giảm thêm giá trị)
            left: Animated.add(animatedBorderPosition.x, borderSize / 2 - 85), // Căn giữa viền, trừ 100 để cân bằng chiều rộng chữ
          },
        ]}
      >
        {i18next.t("Scanner QR Product")}
      </Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  border: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#fff", // Màu viền
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // Màu chữ
    textAlign: "center",
  },
});
