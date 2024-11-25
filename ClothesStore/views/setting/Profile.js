import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList
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
          text1: "Lỗi",
          text2: "Không tìm thấy người dùng!",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng: ", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin người dùng!",
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
          text1: "Thành công",
          text2: "Thông tin đã được cập nhật!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không tìm thấy người dùng!",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng: ", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật thông tin!",
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
          "X-API-KEY": "87cf8c1e8bbcf4156fca3acaf724426580eac54f",
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
      <View style={styles.container}>
        <Text>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh Sửa Thông Tin Người Dùng</Text>

      <TextInput
        style={styles.input}
        value={userData.username}
        onChangeText={(text) => setUserData({ ...userData, username: text })}
        placeholder="Username"
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
        placeholder="Phone number"
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
        placeholder="Address"
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
            <Text style={{ color: "#000" }}>{item.title}</Text> {/* Hiển thị title */}
          </TouchableOpacity>
        )}
      />
      
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Hủy</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    color: "#333"
  },
});
