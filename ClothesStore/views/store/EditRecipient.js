import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert, SafeAreaView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function EditRecipient() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, customerInfo } = route.params || {};
  
  // State để lưu trữ các giá trị chỉnh sửa
  const [username, setUsername] = useState(customerInfo?.username || "");
  const [phone, setPhone] = useState(customerInfo?.phone || "");
  const [address, setAddress] = useState(customerInfo?.address || "");

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
        onChangeText={setAddress}
      />

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
});
