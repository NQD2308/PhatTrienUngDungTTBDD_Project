import React from "react";
import { View, Text, Button, StyleSheet, FlatList, Image } from "react-native";
import { useRoute } from "@react-navigation/native";

const Payment = () => {
  const route = useRoute();
  const { orders } = route.params || { orders: [] };

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
                <Text>Tổng: {item.totalPrice} VND</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <Button
        title="Xác nhận thanh toán"
        onPress={() => alert("Thanh toán thành công!")}
      />
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
