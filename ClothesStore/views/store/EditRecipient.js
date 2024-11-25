import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert, SafeAreaView, TouchableOpacity, FlatList } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function EditRecipient() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, customerInfo, orders, totalAmount } = route.params || {};
  
  // State để lưu trữ các giá trị chỉnh sửa
  const [username, setUsername] = useState(customerInfo?.username || "");
  const [phone, setPhone] = useState(customerInfo?.phone || "");
  const [address, setAddress] = useState(customerInfo?.address || "");
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  // Gợi ý địa chỉ
  const handleAddressAutocomplete = async (text) => {
    setAddress(text); // Cập nhật trực tiếp giá trị nhập vào

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

  // Hàm lưu thông tin người dùng sau khi chỉnh sửa
  const handleSave = async () => {
    if (!username || !phone || !address) { 
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Cập nhật thông tin người dùng mới
    const updatedUserInfo = { username, phone, address };

    // Điều hướng đến trang Payment và truyền lại thông tin đã cập nhật
    navigation.navigate("Payment", {
      updatedUserInfo,
      orders,
      totalAmount
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin người nhận</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên người nhận"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        value={address}
        onChangeText={handleAddressAutocomplete}
        // onChangeText={setAddress}
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
                setAddress(item.title); // Cập nhật địa chỉ với giá trị từ gợi ý
                setAddressSuggestions([]); // Xóa gợi ý sau khi chọn
              }}
            >
              <Text style={{ color: "#000" }}>{item.title}</Text> {/* Hiển thị title */}
            </TouchableOpacity>
          )}
        />
      )}

      <Button title="Lưu" onPress={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    color: "#333"
  },
});
