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
import Toast from "react-native-toast-message";

const Cart = ({ route }) => {
  const { userId } = route.params; // Nhận userId từ route.params
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const navigation = useNavigation();

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    console.log(userId);

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
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Sản phẩm đã được xóa khỏi giỏ hàng!",
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể xóa sản phẩm khỏi giỏ hàng.",
        visibilityTime: 3000,
      });
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
      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Thành công",
        text2: "Đơn hàng đã được cập nhật!",
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Lỗi",
        text2: "Không thể cập nhật đơn hàng.",
        visibilityTime: 3000,
      });
      console.error(error);
    }
  };

  // Tổng giá trị đơn hàng
  const calculateTotalPrice = () => {
    return orders
      .filter((order) => selectedOrders.includes(order.id))
      .reduce((total, order) => total + parseInt(order.totalPrice), 0); // Tính tổng
  };

  // Thanh toán
  const handlePayment = () => {
    const selectedData = orders.filter((order) =>
      selectedOrders.includes(order.id)
    );
    const totalAmount = selectedData.reduce(
      (sum, order) => sum + (parseInt(order.totalPrice) || 0),
      0
    );
    navigation.navigate("Payment", { orders: selectedData, totalAmount });
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
        {/* <Text>Mô tả: {item.description}</Text> */}
        <Text>Size: {item.selectedSize}</Text>
        <Text>Số lượng: {item.quantity}</Text>
        <Text>
          Giá: {parseInt(item.price).toLocaleString("vi-VN")} {item.priceUnit}
        </Text>
        <Text>
          Tổng: {parseInt(item.totalPrice).toLocaleString("vi-VN")}{" "}
          {item.priceUnit}
        </Text>
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
      {selectedOrders.length > 0 && (
        <Text style={styles.totalText}>
          Tổng giá trị: {calculateTotalPrice().toLocaleString("vi-VN")} đ
        </Text>
      )}
      {orders.length > 0 && (
        <TouchableOpacity
          style={[
            styles.paymentButton,
            selectedOrders.length === 0 && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={selectedOrders.length === 0}
        >
          <Text style={styles.paymentText}>Thanh toán</Text>
        </TouchableOpacity>
      )}

      <Toast />
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
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  details: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
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
