import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";
import {
  collection,
  where,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  query
} from "firebase/firestore";
import Toast from "react-native-toast-message";

const Payment = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { orders, totalAmount } = route.params || {
    orders: [],
    totalAmount: 0,
  };
  const [customerInfo, setCustomerInfo] = useState({
    username: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const userId =
    route.params?.userId || FIREBASE_AUTH.currentUser?.uid || "guest";

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId || userId === "guest") {
        setIsLoading(false);
        return;
      }

      console.log("User trong Payment.js: " + userId);
      

      try {
        const userQuery = query(
          collection(FIREBASE_DB, "User"), // Collection 'users'
          where("uid", "==", userId) // Tìm document có trường 'uid' trùng với userId
        );

        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          // Nếu có kết quả, lấy dữ liệu người dùng đầu tiên
          const userData = querySnapshot.docs[0].data();
          setCustomerInfo({
            username: userData.username || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Không tìm thấy thông tin người dùng.",
          });
          console.log("Không tìm thấy thông tin người dùng.");
          
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể lấy thông tin người dùng.",
        });
        console.log("Không thể lấy thông tin người dùng.");
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  const handleEditInfo = () => {
    navigation.navigate("EditCustomerInfo", { userId });
  };

  const formattedTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(totalAmount));

  const handlePayment = async () => {
    if (!userId || userId === "guest") {
      navigation.navigate("Login");
      return;
    }

    try {
      const cartListForId = [];

      for (const item of orders) {
        await addDoc(collection(FIREBASE_DB, "Bill"), {
          userId,
          productId: item.id,
          productName: item.productName,
          quantity: item.quantity,
          color: item.selectedColor,
          size: item.selectedSize,
          totalPrice: item.totalPrice,
          totalAmount: Number(totalAmount),
          priceUnit: item.priceUnit,
          image: item.image,
          timestamp: new Date().toISOString(),
        });

        cartListForId.push(item.id);
      }

      for (const orderId of cartListForId) {
        const cartRef = doc(FIREBASE_DB, "Order", orderId);
        await deleteDoc(cartRef);
      }

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Cảm ơn bạn đã tin tưởng và mua hàng!",
      });

      navigation.navigate("TabNavigator");
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu thanh toán:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Xảy ra lỗi hệ thống trong quá trình thanh toán.",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>
      <View style={styles.customerInfoContainer}>
        <Text style={styles.customerTitle}>Thông tin khách hàng</Text>
        <Text>Người nhận: {customerInfo.username}</Text>
        <Text>Điện thoại: {customerInfo.phone}</Text>
        <Text>Địa chỉ: {customerInfo.address}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditInfo}>
          <Text style={styles.editButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>
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
                <Text>Size: {item.selectedSize}</Text>
                <View
                  style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
                >
                  <Text>Màu sắc:</Text>
                  <Text
                    style={[
                      styles.colorText,
                      { backgroundColor: item.selectedColor },
                    ]}
                  ></Text>
                </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#f5f5f5" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  title: {
    textAlign: "center",
    fontSize: 23,
    fontWeight: "bold",
    marginVertical: 10
  },
  customerInfoContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  customerTitle: { 
    fontSize: 16, fontWeight: "bold", 
    marginBottom: 8 
  },
  editButton: {
    marginTop: 8,
    backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 4,
  },
  editButtonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    textAlign: "center" 
  },
  paymentItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  productImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 8, 
    marginRight: 12 
  },
  productDetails: { 
    flex: 1 
  },
  productName: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 6 
  },
  colorText: { 
    width: 24, 
    height: 24, 
    borderRadius: 50 
  },
  totalAmount: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginVertical: 16 

  },
});

export default Payment;
