import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert, KeyboardAvoidingView, TouchableOpacity, FlatList, ImageBackground } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import i18next from "../../services/i18next";

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

  // Hàm lưu thông tin người dùng sau khi chỉnh sửa
  const handleSave = async () => {
    if (!username || !phone || !address) {
      Alert.alert(i18next.t("Error"), i18next.t("Please fill out all the fields."));
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
    <ImageBackground source={{
      uri: "https://images.pexels.com/photos/8483478/pexels-photo-8483478.jpeg?auto=compress&cs=tinysrgb&w=600",
    }}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView style={styles.container}>
        <Text style={styles.title}>{i18next.t("Recipient information")}</Text>

        {/* Form Inputs */}
        <TextInput
          style={styles.input}
          placeholder={i18next.t("Recipient")}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder={i18next.t("Phone Number")}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder={i18next.t("Address")}
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{i18next.t("Save")}</Text>
        </TouchableOpacity>

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
  container: {
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
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    color: "#333"
  },
  saveButton: {
    backgroundColor: "#343A40",
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
});
