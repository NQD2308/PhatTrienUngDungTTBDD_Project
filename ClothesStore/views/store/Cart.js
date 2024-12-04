import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Button,
  FlatList,
  Pressable,
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
  getDoc,
  getDocs,
} from "firebase/firestore";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

const Cart = ({ route }) => {
  const { userId } = route.params; // Nhận userId từ route.params
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null); // Lưu size được chọn
  const [selectedColor, setSelectedColor] = useState(null); // Lưu màu được chọn
  const [purchaseQuantity, setPurchaseQuantity] = useState(1); // Lưu số lượng mua
  const [orderId, setOrderId] = useState(null); // Lưu số lượng mua
  const navigation = useNavigation();

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["50%", "70%"], []);

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
    });
    return () => unsubscribe();
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      // Đóng BottomSheet khi quay lại màn hình
      bottomSheetRef.current?.close();
    }, [])
  );

  // Thêm vào hàm tăng số lượng
  const handleIncreaseQuantity = async (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (order) {
      try {
        await updateDoc(doc(FIREBASE_DB, "Order", orderId), {
          quantity: order.quantity + 1,
          totalPrice: (order.quantity + 1) * order.price, // Cập nhật tổng giá
        });
      } catch (error) {
        console.error("Lỗi khi tăng số lượng:", error);
      }
    }
  };

  // Hàm thay đổi số lượng
  const changeQuantity = (action) => {
    setPurchaseQuantity((prevQuantity) => {
      if (action === "increase") {
        return prevQuantity + 1; // Tăng số lượng
      } else if (action === "decrease") {
        // Giảm số lượng, đảm bảo không nhỏ hơn 1
        return prevQuantity > 1 ? prevQuantity - 1 : 1;
      }
      return prevQuantity; // Không làm gì nếu action không hợp lệ
    });
  };

  // Thêm vào hàm giảm số lượng
  const handleDecreaseQuantity = async (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (order && order.quantity > 1) {
      try {
        await updateDoc(doc(FIREBASE_DB, "Order", orderId), {
          quantity: order.quantity - 1,
          totalPrice: (order.quantity - 1) * order.price, // Cập nhật tổng giá
        });
      } catch (error) {
        console.error("Lỗi khi giảm số lượng:", error);
      }
    }
  };

  const handleOpenBottomSheet = async (productId) => {
    try {
      console.log("productId: ", productId);
      console.log(orders);

      // Lấy thông tin sản phẩm từ bảng "Product"
      const productRef = doc(FIREBASE_DB, "Product", productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        console.log("Tài liệu tồn tại:", productDoc.data());
        setSelectedProduct(productDoc.data());

        // Lấy thông tin đơn hàng từ bảng "Order" với productId
        const ordersRef = collection(FIREBASE_DB, "Order");
        const q = query(ordersRef, where("productId", "==", productId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Lấy thông tin của đơn hàng
          querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            const selectedSize = orderData.selectedSize;
            const selectedColor = orderData.selectedColor;
            const purchaseQuantity = orderData.quantity;
            const orderId = doc.id;

            // Cập nhật trạng thái với thông tin về size và color
            setSelectedSize(selectedSize);
            setSelectedColor(selectedColor);
            setPurchaseQuantity(purchaseQuantity);
            setOrderId(orderId);

            console.log("Selected size: ", selectedSize);
            console.log("Selected color: ", selectedColor);
            console.log("Purchase quantity: ", purchaseQuantity);
            console.log("Order id: ", orderId);
          });
        } else {
          console.log("Không tìm thấy đơn hàng với productId: ", productId);
        }

        // Mở bottom sheet
        bottomSheetRef.current?.present();
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không tìm thấy thông tin sản phẩm.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy tài liệu từ Firebase:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Có lỗi khi kết nối với Firebase.",
      });
    }
  };

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
  const handleUpdateOrder = async () => {
    // Đảm bảo có thông tin đã được chọn
    if (!selectedSize || !selectedColor || !purchaseQuantity) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập đầy đủ thông tin.",
      });
      return;
    }
  
    try {
      await updateDoc(doc(FIREBASE_DB, "Order", orderId), {
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        quantity: purchaseQuantity,
        totalPrice: purchaseQuantity * selectedProduct.price, // Cập nhật tổng giá
      });
  
      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Thành công",
        text2: "Đơn hàng đã được cập nhật!",
        visibilityTime: 3000,
      });

      // Đóng BottomSheet sau khi cập nhật thành công
      bottomSheetRef.current.close(); // Đóng BottomSheet
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
    <TouchableOpacity
      style={styles.cartItem}
      onPress={() =>
        navigation.navigate("Detail", { productId: item.productId })
      }
    >
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text>Số lượng:</Text>
          <TouchableOpacity
            onPress={() => handleDecreaseQuantity(item.id)}
            style={styles.quantityButton}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => handleIncreaseQuantity(item.id)}
            style={styles.quantityButton}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <Text>Màu sắc:</Text>
          <Text
            style={[styles.colorText, { backgroundColor: item.selectedColor }]}
          ></Text>
        </View>
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
          <Button
            title="Chỉnh sửa"
            onPress={() => handleOpenBottomSheet(item.productId)}
          />
          {/* <TouchableOpacity
            onPress={() => handleOpenBottomSheet(item.productId)}
          >
            /<Text>Cập nhật</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModalProvider>
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
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
        >
          {selectedProduct ? (
            <View style={styles.bottomSheetContent}>
              <View style={styles.productContainer}>
                {/* Hình ảnh sản phẩm */}
                <Image
                  source={{ uri: selectedProduct.images[0] }}
                  style={styles.productImage}
                />

                {/* Thông tin sản phẩm */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {selectedProduct.productName}
                  </Text>
                  <Text>
                    Giá:{" "}
                    {parseInt(selectedProduct.price).toLocaleString("vi-VN")}{" "}
                    {selectedProduct.priceUnit}
                  </Text>
                  <Text>Size:</Text>
                  <FlatList
                    data={selectedProduct.size}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => setSelectedSize(item)} // Gán size được chọn
                        style={[
                          styles.sizeBox,
                          selectedSize === item && styles.selectedSizeBox, // Highlight nếu được chọn
                        ]}
                      >
                        <Text
                          style={[
                            styles.sizeText,
                            selectedSize === item && styles.selectedSizeText, // Thay đổi text khi chọn
                          ]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    )}
                    contentContainerStyle={styles.sizeList}
                  />

                  <Text>Colors:</Text>
                  <FlatList
                    data={selectedProduct.colors}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => setSelectedColor(item)}
                        style={[
                          styles.colorBox,
                          selectedColor === item && styles.selectedColorBox,
                        ]}
                      >
                        <View
                          style={[
                            styles.colorCircle,
                            { backgroundColor: item },
                          ]}
                        ></View>
                      </Pressable>
                    )}
                    contentContainerStyle={styles.colorList}
                  />
                  {/* Số lượng và chức năng tăng giảm */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text>Số lượng:</Text>
                    <TouchableOpacity
                      onPress={() => changeQuantity("decrease")}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                    <Text>{purchaseQuantity}</Text>
                    <TouchableOpacity
                      onPress={() => changeQuantity("increase")}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Nút xác nhận */}
                  <Pressable
                    onPress={() => handleUpdateOrder()}
                    style={styles.confirmButton} // Đảm bảo có style cho nút xác nhận
                  >
                    <Text style={styles.confirmButtonText}>Xác nhận</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <Text>Đang tải thông tin...</Text>
          )}
        </BottomSheetModal>
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
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  list: {
    paddingBottom: 16,
  },
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
  colorText: {
    width: 24,
    height: 24,
    marginTop: 8,
    padding: 8,
    color: "#fff", // Đảm bảo chữ hiển thị rõ trên nền màu
    borderRadius: 50,
    textAlign: "center",
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
  paymentText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },

  // Bottom sheet
  bottomSheetContent: {
    padding: 20,
  },
  productContainer: {
    flexDirection: "row", // Đặt chúng theo chiều ngang (image bên trái, thông tin bên phải)
    alignItems: "center", // Căn chỉnh theo chiều dọc (giữa)
  },
  productImage: {
    width: 120, // Kích thước ảnh
    height: 120,
    marginRight: 20, // Khoảng cách giữa ảnh và thông tin sản phẩm
    borderRadius: 10, // Bo góc ảnh nếu cần
  },
  productInfo: {
    flex: 1, // Chiếm hết không gian còn lại
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // Size
  sizeList: {
    flexDirection: "row", // Sắp xếp hàng ngang
    flexWrap: "wrap", // Tự động xuống dòng
    justifyContent: "flex-start",
    marginVertical: 10,
    gap: 0, // Khoảng cách giữa các ô
  },
  sizeBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc", // Màu viền mặc định
    borderRadius: 5,
    margin: 4,
    backgroundColor: "#f0f0f0", // Màu nền mặc định
  },
  selectedSizeBox: {
    borderColor: "#007bff", // Màu viền khi được chọn
    backgroundColor: "#d0eaff", // Màu nền khi được chọn
  },
  sizeText: {
    fontSize: 16,
    color: "#333",
  },
  selectedSizeText: {
    color: "#007bff", // Màu chữ khi được chọn
    fontWeight: "bold",
  },

  // Color
  colorList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginVertical: 10,
    gap: 8,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ccc",
    margin: 4,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedColorBox: {
    borderColor: "#007bff",
    borderWidth: 3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Styles cho nút xác nhận
  confirmButton: {
    backgroundColor: '#007bff',  // Màu nền của nút xác nhận
    paddingVertical: 12,          // Khoảng cách dọc cho nút
    borderRadius: 8,             // Viền tròn cho nút
    marginTop: 20,               // Khoảng cách từ phần nội dung sản phẩm
    alignItems: 'center',        // Căn giữa nội dung trong nút
  },
  confirmButtonText: {
    color: '#fff',               // Màu chữ của nút
    fontSize: 16,                // Kích thước chữ
    fontWeight: 'bold',          // Chữ đậm
  },
});

export default Cart;
