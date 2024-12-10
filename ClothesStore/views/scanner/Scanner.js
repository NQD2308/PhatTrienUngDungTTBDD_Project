import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  AppState,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions, // Thêm Dimensions API
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function Scanner({ route }) {
  const { userId } = route.params;
  const navigation = useNavigation();
  const qrLock = useRef(false);
  const timeoutRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [qrData, setQrData] = useState(null);

  const borderSize = 200; // Kích thước viền
  const animatedBorderPosition = useRef(
    new Animated.ValueXY({ x: 0, y: 0 }) // Vị trí khởi tạo của viền
  ).current;

  // Lấy kích thước màn hình
  const { width, height } = Dimensions.get("window");

  useFocusEffect(
    React.useCallback(() => {
      qrLock.current = false;
      setQrData(null);
      clearTimeout(timeoutRef.current);
      
      
      // Khi quay lại màn hình, viền sẽ về vị trí trung tâm
      const centerX = (width - borderSize) / 2; // Xác định vị trí trung tâm ngang
      const centerY = (height - borderSize) / 2; // Xác định vị trí trung tâm dọc

      Animated.timing(animatedBorderPosition, {
        toValue: { x: centerX, y: centerY }, // Trung tâm màn hình
        duration: 800,
        useNativeDriver: false,
      }).start();
      
      return () => {
        clearTimeout(timeoutRef.current);
      };
    }, [width, height]) // Sử dụng width, height từ Dimensions để tái tạo lại vị trí viền khi kích thước màn hình thay đổi
  );

  const handleBarcodeScanned = ({ bounds, data }) => {
    if (data && !qrLock.current) {
      const { origin } = bounds;

      // Cập nhật vị trí viền với hiệu ứng mượt
      Animated.timing(animatedBorderPosition, {
        toValue: { x: origin.x, y: origin.y }, // Vị trí mới của viền
        duration: 300, // Thời gian chuyển động (ms)
        useNativeDriver: false, // Native driver không hỗ trợ thay đổi layout
      }).start();

      // Điều hướng khi mã QR nằm trong viền
      qrLock.current = true; // Khóa để tránh quét lại
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        navigation.navigate("Detail", { productId: data, userId: userId });
      }, 200); // Chuyển sau 0.5 giây
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
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

      {/* Text trên khu vực ngoài viền */}
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
        Scanner QR Product
      </Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
