import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FIREBASE_DB } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const Cart = ({ route }) => {
  const { userId } = route.params; // Nhận userId từ route.params
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const navigation = useNavigation();

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    if (userId === "guest") {
      return (
        <View style={styles.guestContainer}>
          <Text style={styles.guestText}>
            Bạn cần đăng nhập để truy cập vào giỏ hàng.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // console.log("userId tại Cart.js: " + userId);
    
    const q = query(
      collection(FIREBASE_DB, "Order"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
      console.log(`Số lượng sản phẩm trong giỏ hàng: ${data.length}`); // Kiểm tra độ dài
      console.log(`Sản phẩm trong giỏ hàng: ${data}`); // Kiểm tra độ dài
    });
    return () => unsubscribe();
  }, [userId]);

  // Toggle chọn đơn hàng
  const toggleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Xóa đơn hàng
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "Order", orderId));
      Alert.alert("Thành công", "Đơn hàng đã được xóa!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa đơn hàng.");
      console.error(error);
    }
  };

  // Cập nhật đơn hàng
  const handleUpdateOrder = async (orderId) => {
    const newSize = prompt("Nhập size mới:");
    const newQuantity = prompt("Nhập số lượng mới:");
    try {
      await updateDoc(doc(FIREBASE_DB, "Order", orderId), {
        selectedSize: newSize || "",
        quantity: parseInt(newQuantity, 10) || 1,
      });
      Alert.alert("Thành công", "Đơn hàng đã được cập nhật!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật đơn hàng.");
      console.error(error);
    }
  };

  // Thanh toán
  const handlePayment = () => {
    const selectedData = orders.filter((order) =>
      selectedOrders.includes(order.id)
    );
    navigation.navigate("Payment", { orders: selectedData });
  };

  // Giao diện từng đơn hàng
  const renderOrderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri: item.image && item.image.length > 0 ? item.image[0] : null,
        }}
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text>Mô tả: {item.description}</Text>
        <Text>Size: {item.selectedSize}</Text>
        <Text>Số lượng: {item.quantity}</Text>
        <Text>Giá: {parseInt(item.price).toLocaleString("vi-VN")} {item.priceUnit}</Text>
        <Text>Tổng: {parseInt(item.totalPrice).toLocaleString("vi-VN")} {item.priceUnit}</Text>
        <View style={styles.buttons}>
          <Button
            title={selectedOrders.includes(item.id) ? "Bỏ chọn" : "Chọn"}
            onPress={() => toggleSelectOrder(item.id)}
          />
          <Button
            title="Xóa"
            color="red"
            onPress={() => handleDeleteOrder(item.id)}
          />
          <Button title="Cập nhật" onPress={() => handleUpdateOrder(item.id)} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Giỏ hàng của bạn</Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
      {orders.length > 0 && (
        <TouchableOpacity
          style={[styles.paymentButton, selectedOrders.length === 0 && styles.disabledButton]}
          onPress={handlePayment}
          disabled={selectedOrders.length === 0}
        >
          <Text style={styles.paymentText}>Thanh toán</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  emptyText: { textAlign: "center", fontSize: 16, color: "#888" },
  list: { paddingBottom: 16 },
  cartItem: {
    flexDirection: "row",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 8,
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  details: { flex: 1 },
  productName: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  paymentButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  paymentText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#ccc" },
});

export default Cart;
