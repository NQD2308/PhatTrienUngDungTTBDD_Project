import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Overlay } from "./Overlay";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export default function Scanner({ route }) {
  const { userId } = route.params; // Lấy userId từ route.params
  const navigation = useNavigation();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();

  // State to store the QR code data
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      console.log("Camera is granted and active");
    } else {
      console.log("Camera permission not granted or denied");
    }
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading
    console.log("Camera permissions are loading...");
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    console.log("Camera permission denied");
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Log the camera facing state every time it changes
  const toggleCameraFacing = () => {
    setFacing((current) => {
      const newFacing = current === "back" ? "front" : "back";
      console.log(`Camera facing is now: ${newFacing}`); // Log the new facing state
      return newFacing;
    });
  };

  // Function to handle barcode scanned
  const handleBarcodeScanned = ({ data }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      setQrData(data); // Save QR code data to state
      const productId = data; // Assuming the QR code contains the productId (e.g. "10")
      
      // Navigate to Detail page with productId and userId
      navigation.navigate("Detail", { productId: productId, userId: userId });
      
      setTimeout(() => {
        qrLock.current = false; // Allow scanning again after timeout
      }, 500);
    }
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}

      {/* Camera view to scan QR Code */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        onBarcodeScanned={handleBarcodeScanned} // Call the handle function when barcode is scanned
      />

      {/* Display QR code data on screen */}
      {/* <View style={styles.overlay}>
        {qrData && <Text style={styles.qrText}>QR Code Data: {qrData}</Text>}
      </View> */}

      <Overlay />

      {/* Button to toggle camera facing */}
      {/* <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
        <Text style={styles.text}>Flip Camera</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  overlay: {
    position: "absolute",
    top: "50%",
    left: "10%",
    right: "10%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 10,
  },
  qrText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});
