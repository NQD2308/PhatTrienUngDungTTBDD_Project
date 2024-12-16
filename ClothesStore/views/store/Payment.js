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
  query,
} from "firebase/firestore";
import Toast from "react-native-toast-message";
import i18next from "../../services/i18next";
import FontAwesome from "react-native-vector-icons/FontAwesome6";

const Payment = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { orders, totalAmount } = route.params || {
    orders: [],
    totalAmount: 0,
  };
  const { updatedUserInfo } = route.params || {}; // Lấy thông tin người dùng đã cập nhật từ EditRecipient

  const [customerInfo, setCustomerInfo] = useState({
    username: "",
    phone: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  const userId =
    route.params?.userId || FIREBASE_AUTH.currentUser?.uid || "guest";

  useEffect(() => {
    if (orders && Array.isArray(orders)) {
      console.log("Số lượng phần tử trong orders:", orders.length);
    } else {
      console.log("Orders không tồn tại hoặc không phải mảng.");
    }
  }, [orders]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId || userId === "guest") {
        setIsLoading(false);
        return;
      }

      console.log("User trong Payment.js: " + userId);

      try {
        const userQuery = query(
          collection(FIREBASE_DB, "User"),
          where("uid", "==", userId)
        );

        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          // console.log("Dữ liệu userData nhận được:", userData);
          // console.log(
          //   "Số lượng thuộc tính trong userData:",
          //   Object.keys(userData).length
          // );

          // Lấy và chuẩn hóa thông tin từ userData
          const extractedUserData = {
            username: userData.username || "",
            phone: userData.phone || "",
            address: userData.address || "",
          };

          // console.log(
          //   "Thông tin khách hàng từ userData (3 thuộc tính):",
          //   extractedUserData
          // );

          // console.log(
          //   "Số lượng thuộc tính trong extractedUserData:",
          //   Object.keys(extractedUserData).length
          // );

          // Nếu có thông tin mới được truyền từ EditRecipient, sử dụng thông tin đó
          if (updatedUserInfo) {
            const updatedUserData = {
              username: updatedUserInfo.username || extractedUserData.username,
              phone: updatedUserInfo.phone || extractedUserData.phone,
              address: updatedUserInfo.address || extractedUserData.address,
            };

            // console.log(
            //   "updatedUserInfo nhận được từ EditRecipient (3 thuộc tính):",
            //   updatedUserData
            // );
            // console.log(
            //   "Số lượng thuộc tính trong updatedUserInfo:",
            //   Object.keys(updatedUserData).length
            // );

            setCustomerInfo(updatedUserData); // Cập nhật với thông tin mới
          } else {
            setCustomerInfo(extractedUserData);
          }
        } else {
          Toast.show({
            type: "error",
            text1: i18next.t("Error"),
            text2: i18next.t("User information not found."),
          });
          console.log("Không tìm thấy thông tin người dùng.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        Toast.show({
          type: "error",
          text1: i18next.t("Error"),
          text2: i18next.t("Unable to retrieve user information."),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId, updatedUserInfo]); // Thêm updatedUserInfo vào mảng dependencies

  const handleEditInfo = () => {
    navigation.navigate("EditRecipient", {
      userId,
      customerInfo,
      orders,
      totalAmount
    });
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

      // Sử dụng `customerInfo` hoặc fallback sang `updatedUserInfo`
      const finalUserInfo = {
        username: customerInfo.username || updatedUserInfo?.username || "Chưa cập nhật",
        phone: customerInfo.phone || updatedUserInfo?.phone || "Chưa cập nhật",
        address: customerInfo.address || updatedUserInfo?.address || "Chưa cập nhật",
      };

      if (!updatedUserInfo) {
        for (const item of orders) {
          await addDoc(collection(FIREBASE_DB, "Bill"), {

            userId,
            receiver: finalUserInfo.username,
            phone: finalUserInfo.phone,
            address: finalUserInfo.address,
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
      } else {
        for (const item of orders) {
          await addDoc(collection(FIREBASE_DB, "Bill"), {

            userId,
            receiver: updatedUserInfo.username,
            phone: updatedUserInfo.phone,
            address: updatedUserInfo.address,
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
      }

      for (const orderId of cartListForId) {
        const cartRef = doc(FIREBASE_DB, "Order", orderId);
        await deleteDoc(cartRef);
      }

      Toast.show({
        type: "success",
        text1: i18next.t("Success"),
        text2: i18next.t(""),
      });

      navigation.navigate("TabNavigator");
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu thanh toán:", error);
      Toast.show({
        type: "error",
        text1: i18next.t("Error"),
        text2: i18next.t("A system error occurred during the checkout process."),
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b7280" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color={"#fff"} style={{ marginTop: 5 }} />
        </TouchableOpacity>
        <Text style={styles.header}>Payment</Text>
      </View>
      <View style={styles.customerInfoContainer}>
        <Text style={styles.customerTitle}>User's information</Text>
        <Text style={styles.customerInfo}>{i18next.t("Recipient")}: {customerInfo.username || updatedUserInfo?.username || "Chưa cập nhật"}</Text>
        <Text style={styles.customerInfo}>{i18next.t("Phone Number")}: {customerInfo.phone || updatedUserInfo?.phone || "Chưa cập nhật"}</Text>
        <Text style={styles.customerInfo}>{i18next.t("Address")}: {customerInfo.address || updatedUserInfo?.address || "Chưa cập nhật"}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditInfo}>
          <FontAwesome name="pen-to-square" size={22} />
        </TouchableOpacity>
      </View>
      {orders.length === 0 ? (
        <Text>{i18next.t("No orders have been selected.")}</Text>
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
                <Text>{i18next.t("Size")}: {item.selectedSize}</Text>
                <View
                  style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
                >
                  <Text>{i18next.t("Color")}:</Text>
                  <Text
                    style={[
                      styles.colorText,
                      { backgroundColor: item.selectedColor },
                    ]}
                  ></Text>
                </View>
                <Text>S{i18next.t("Quantity")}: {item.quantity}</Text>
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
      <View style={styles.totalContainer}>
        <Text style={styles.totalAmount}>
          {i18next.t("Total Amount")}: {formattedTotal}
        </Text>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handlePayment}
        >
          <Text style={styles.paymentText}>{i18next.t("Payment")}</Text>
        </TouchableOpacity>
      </View>

      {/* <Button title={i18next.t("Payment")} onPress={handlePayment} /> */}

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    padding: 20,
    flexDirection: 'row',
    backgroundColor: "#000",
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#000",
  },
  customerInfoContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Bóng đổ nhẹ
    marginBottom: 16,
  },
  customerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  customerInfo: {
    fontSize: 16,
  },
  editButton: {
    position: 'absolute', // Use absolute positioning
    top: -1, // Position at the bottom
    right: 5, // Align it to the right
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  paymentItem: {
    backgroundColor: "#fff",
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Bóng đổ nhẹ
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  colorText: {
    width: 24,
    height: 24,
    borderRadius: 50,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalAmount: {
    flex: 0.8, // Chiếm phần còn lại của không gian
    paddingVertical: 10,
    paddingHorizontal: 14,
    padding: 10,
    fontSize: 17,
    marginVertical: 5,
    color: "#000",
    fontWeight: "bold",
  },
  paymentButton: {
    flexShrink: 0, // Giữ nguyên kích thước button, không bị co lại
    backgroundColor: '#000',
    paddingVertical: 25,
    paddingHorizontal: 45,
  },
  paymentText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Payment;
