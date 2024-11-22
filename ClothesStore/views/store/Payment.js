import React, { useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Image } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";

const Payment = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // const [cartListForId, setCartListForId] = useState([]);
  const { orders, totalAmount } = route.params || {
    orders: [],
    totalAmount: 0,
  };

  // Chuyển totalAmount sang kiểu số (nếu chưa phải số)
  const formattedTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(totalAmount));

  const handlePayment = async () => {
    const userId =
      route.params?.userId || FIREBASE_AUTH.currentUser?.uid || "guest";

    try {
      if (!userId || userId === "guest") {
        navigation.navigate("Login");
        return;
      }

      // Mảng lưu các ID sản phẩm đã thanh toán
      const cartListForId = [];

      // Lặp qua từng sản phẩm trong đơn hàng và lưu vào Bill
      for (const item of orders) {
        // Thêm thông tin vào collection "Bill"
        await addDoc(collection(FIREBASE_DB, "Bill"), {
          userId, // ID người dùng
          productId: item.id,
          productName: item.productName,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          totalAmount: Number(totalAmount),
          priceUnit: item.priceUnit,
          image: item.image,
          timestamp: new Date().toISOString(), // Thời gian thanh toán
        });

        // Lưu item.id vào mảng cartListForId để xóa sau khi đã thêm vào Bill
        cartListForId.push(item.id);
      }

      // Log cartListForId để kiểm tra các ID sẽ được xóa
      console.log("Danh sách ID trong cartListForId:", cartListForId);

      // Sau khi lưu tất cả sản phẩm vào Bill, xóa các ID trong bảng Order
      for (const orderId of cartListForId) {
        try {
          console.log("Đang xóa đơn hàng có ID:", orderId); // Log từng orderId trước khi xóa

          const cartRef = doc(FIREBASE_DB, "Order", orderId); // Sử dụng orderId để tham chiếu đến tài liệu Order
          await deleteDoc(cartRef); // Xóa tài liệu đó khỏi bảng Order

          // Log sau khi xóa thành công
          console.log("Đã xóa đơn hàng có ID:", orderId);
        } catch (error) {
          console.log(error);
        }
      }

      // Thông báo thanh toán thành công
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Cảm ơn bạn đã tin tưởng và mua hàng",
        visibilityTime: 3000,
      });

      // Điều hướng đến TabNavigator sau khi thanh toán thành công
      navigation.navigate("TabNavigator");
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu thanh toán:", error);

      // Thông báo lỗi nếu có sự cố xảy ra
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Xảy ra lỗi hệ thống trong quá trình thanh toán",
        visibilityTime: 3000,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>
      {orders.length === 0 ? (
        <Text>Không có đơn hàng nào được chọn.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.paymentItem}>
              <Image
                source={{
                  uri:
                    item.image && item.image.length > 0
                      ? item.image[0]
                      : "https://via.placeholder.com/150",
                }}
                style={styles.productImage}
              />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text>Số lượng: {item.quantity}</Text>
                <Text>
                  Tổng: {parseInt(item.totalPrice).toLocaleString("vi-VI")}{" "}
                  {item.priceUnit}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <Text style={styles.totalAmount}>
        Tổng giá trị đơn hàng: {formattedTotal}
      </Text>
      <Button title="Xác nhận thanh toán" onPress={handlePayment} />

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5", // Màu nền
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Hiệu ứng nổi trên Android
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8, // Bo góc cho ảnh
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
});

export default Payment;
