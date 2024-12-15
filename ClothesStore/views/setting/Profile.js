import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { FIREBASE_DB } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import Toast from "react-native-toast-message";
import i18next from "../../services/i18next";

export default function Profile({ route, navigation }) {
  const { userId } = route.params || {}; // Nhận userId từ route.params
  const safeUserId = userId || "guest";
  const [userData, setUserData] = useState({
    email: "",
    phone: "",
    username: "",
  });
  const [addressSuggestions, setAddressSuggestions] = useState([]); // Gợi ý địa chỉ
  const [loading, setLoading] = useState(true);

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
          text1: i18next("Error"),
          text2: i18next("User not found!"),
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng: ", error);
      Toast.show({
        type: "error",
        text1: i18next("Error"),
        text2: i18next("Unable to load user information!"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Truy vấn document theo trường 'uid' (nếu không phải là documentId trực tiếp)
      const userQuery = query(
        collection(FIREBASE_DB, "User"),
        where("uid", "==", safeUserId)
      );

      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userRef = doc(FIREBASE_DB, "User", querySnapshot.docs[0].id); // Lấy id của document đầu tiên từ kết quả query
        await updateDoc(userRef, {
          email: userData.email,
          phone: userData.phone,
          username: userData.username,
          address: userData.address, // Thêm địa chỉ vào
        });

        Toast.show({
          type: "success",
          text1: i18next.t("Success"),
          text2: i18next.t("The information has been updated!"),
        });
      } else {
        Toast.show({
          type: "error",
          text1: i18next("Error"),
          text2: i18next("User not found!"),
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng: ", error);
      Toast.show({
        type: "error",
        text1: i18next("Error"),
        text2: i18next.t("Unable to update the information!"),
      });
    }
  };

  const handleAddressAutocomplete = async (text) => {
    setUserData((prev) => ({ ...prev, address: text })); // Cập nhật input
    if (text.trim() === "") {
      setAddressSuggestions([]); // Xóa gợi ý nếu input rỗng
      return;
    }

    try {
      const response = await fetch("https://google.serper.dev/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "c78259ca9bbe24c57ea57b224a5df58a0a4748b3",
        },
        body: JSON.stringify({
          q: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Map dữ liệu để chỉ lấy `title`
        const suggestions = (data.places || []).map((place) => ({
          title: place.title, // Lấy `title` từ mỗi phần tử
        }));

        setAddressSuggestions(suggestions); // Cập nhật danh sách gợi ý
      } else {
        console.error("Autocomplete API Error:", response.status);
      }
    } catch (error) {
      console.error("Error during autocomplete fetch:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6b7280" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={{
        uri: "https://images.pexels.com/photos/8483478/pexels-photo-8483478.jpeg?auto=compress&cs=tinysrgb&w=600",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView style={styles.formContainer}>
        <Text style={styles.title}>{i18next.t("User's Information")}</Text>

        {/* Form Inputs */}
        <TextInput
          style={styles.input}
          value={userData.username}
          onChangeText={(text) => setUserData({ ...userData, username: text })}
          placeholder={i18next.t("Username")}
        />
        <TextInput
          style={styles.input}
          value={userData.email}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
          placeholder="Email"
        />
        <TextInput
          style={styles.input}
          value={userData.phone}
          onChangeText={(text) => setUserData({ ...userData, phone: text })}
          placeholder={i18next.t("Phone number")}
        />
        {/* <TextInput
        style={styles.input}
        value={userData.address}
        onChangeText={(text) => setUserData({ ...userData, address: text })}
        placeholder="Address"
      /> */}

        <TextInput
          style={styles.input}
          value={userData.address}
          onChangeText={handleAddressAutocomplete} // Gọi hàm autocomplete khi người dùng nhập
          placeholder={i18next.t("Address")}
        />

        {/* Hiển thị danh sách gợi ý địa chỉ */}
        {addressSuggestions.length > 0 && (
          <FlatList
            data={addressSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  setUserData((prev) => ({ ...prev, address: item.title })); // Cập nhật địa chỉ được chọn
                  setAddressSuggestions([]); // Xóa gợi ý
                }}
              >
                <Text style={{ color: "#000" }}>{item.title}</Text>{" "}
                {/* Hiển thị title */}
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{i18next.t("Save")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>{i18next.t("Cancel")}</Text>
        </TouchableOpacity>

        <Toast />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "85%",
    backgroundColor: "#ffffffCC", // Màu trắng với alpha 80%
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#212529",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#212529",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  cancelButton: {
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 10,
    alignItems: "center",
    width: "40%",
    alignSelf: "center",
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },
  cancelButtonText: {
    color: "#212529",
    fontSize: 18,
    fontWeight: "bold",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    color: "#333",
  },
});
