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
  TouchableWithoutFeedback,
  Alert,
  SafeAreaView
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';
import FontAwesome from "react-native-vector-icons/FontAwesome6"; // Đừng quên cài đặt thư viện này


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

  const [isVisible, setIsVisible] = useState(false);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["50%", "70%"], []);


  // Đóng bottom sheet
  const closeBottomSheet = () => {
    bottomSheetRef.current?.dismiss();
    setIsVisible(false);
  };

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    console.log(userId);

    if (userId === "guest") {
      return (
        <View style={styles.guestContainer}>
          <Text style={styles.guestText}>
            You must be logged in to access the Shopping Cart!
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>Log In</Text>
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
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn bỏ sản phẩm này?",
        [
          {
            text: "Hủy", // Nút hủy
            style: "cancel", // Không làm gì cả
          },
          {
            text: "Đồng ý", // Nút đồng ý
            onPress: async () => {
              try {
                await deleteDoc(doc(FIREBASE_DB, "Order", orderId)); // Xóa tài liệu
              } catch (error) {
                console.error("Lỗi khi xóa tài liệu:", error);
                alert("Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại!"); // Thông báo lỗi
              }
            },
          },
        ]
      );
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
  // const renderOrderItem = ({ item }) => (
  //   <TouchableOpacity
  //     style={styles.cartItem}
  //     onPress={() =>
  //       navigation.navigate("Detail", { productId: item.productId })
  //     }
  //   >
  //     <Image
  //       source={{
  //         uri: item.image && item.image.length > 0 ? item.image[0] : null,
  //       }}
  //       style={styles.image}
  //     />
  //     <View style={styles.details}>
  //       <Text style={styles.productName}>{item.productName}</Text>
  //       {/* <Text>Mô tả: {item.description}</Text> */}
  //       <Text>Size: {item.selectedSize}</Text>
  //       <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  //         <Text>Số lượng:</Text>
  //         <TouchableOpacity
  //           onPress={() => handleDecreaseQuantity(item.id)}
  //           style={styles.quantityButton}
  //         >
  //           <Text style={styles.buttonText}>-</Text>
  //         </TouchableOpacity>
  //         <Text>{item.quantity}</Text>
  //         <TouchableOpacity
  //           onPress={() => handleIncreaseQuantity(item.id)}
  //           style={styles.quantityButton}
  //         >
  //           <Text style={styles.buttonText}>+</Text>
  //         </TouchableOpacity>
  //       </View>
  //       <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
  //         <Text>Màu sắc:</Text>
  //         <Text
  //           style={[styles.colorText, { backgroundColor: item.selectedColor }]}
  //         ></Text>
  //       </View>
  //       <Text>
  //         Giá: {parseInt(item.price).toLocaleString("vi-VN")} {item.priceUnit}
  //       </Text>
  //       <Text>
  //         Tổng: {parseInt(item.totalPrice).toLocaleString("vi-VN")}{" "}
  //         {item.priceUnit}
  //       </Text>
  //       <View style={styles.buttons}>
  //         <Button
  //           title={selectedOrders.includes(item.id) ? "Bỏ chọn" : "Chọn"}
  //           onPress={() => toggleSelectOrder(item.id)}
  //         />
  //         {/* <Button
  //           title="Xóa"
  //           color="red"
  //           onPress={() => handleDeleteOrder(item.id)}
  //         />
  //         <Button
  //           title="Chỉnh sửa"
  //           onPress={() => handleOpenBottomSheet(item.productId)}
  //         /> */}
  //         {/* <TouchableOpacity
  //           onPress={() => handleOpenBottomSheet(item.productId)}
  //         >
  //           /<Text>Cập nhật</Text>
  //         </TouchableOpacity> */}
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={[styles.cartItem, { backgroundColor: selectedOrders.includes(item.id) ? "#A3B18A" : "#DAD7CD" }]} onLongPress={() => navigation.navigate("Detail", { productId: item.productId })}>
      <Image
        source={{ uri: item.image && item.image.length > 0 ? item.image[0] : null }}
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text>Size: {item.selectedSize}</Text>
        {/* Quantity */}
        <View style={styles.itemQuantity}>
          <TouchableOpacity onPress={() => handleDecreaseQuantity(item.id)} style={styles.quantityButton}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleIncreaseQuantity(item.id)} style={styles.quantityButton}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <Text>Color:</Text>
          <Text style={[styles.colorText, { backgroundColor: item.selectedColor }]} />
        </View>
        <Text>Price: {parseInt(item.price).toLocaleString("vi-VN")} {item.priceUnit}</Text>
        <Text style={styles.priceUnit}>Total: {parseInt(item.totalPrice).toLocaleString("vi-VN")} {item.priceUnit}</Text>
        {/* toggle button */}
        <TouchableOpacity style={styles.chooseBtn} onPress={() => toggleSelectOrder(item.id)}>
          <FontAwesome name={selectedOrders.includes(item.id) ? "circle-check" : "circle"} size={24} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Left Actions (Swipe từ trái sang)
  const renderEditActions = (item) => (
    <TouchableOpacity
      style={styles.editAction}
      onPress={() => handleOpenBottomSheet(item.productId)}
    >
      <Text style={styles.actionText}>Edit</Text>
    </TouchableOpacity>
  );

  // Right Actions (Swipe từ phải sang)
  const renderDeletetActions = (item) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDeleteOrder(item.id)}
    >
      <Text style={styles.actionText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.title}>Shopping Cart</Text>
        {orders.length === 0 ? (
          <Text style={styles.emptyText}>Cart is empty.</Text>
        ) : (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SwipeableFlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderLeftActions={renderEditActions}
              renderRightActions={renderDeletetActions}
            />
          </GestureHandlerRootView>
        )}
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={({ style }) => (
            <TouchableWithoutFeedback onPress={closeBottomSheet}>
              <View style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
            </TouchableWithoutFeedback>
          )}
        >
          {selectedProduct ? (
            <View style={styles.bottomSheetContent}>
              <View style={styles.productContainer}>
                <Image source={{ uri: selectedProduct.images[0] }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{selectedProduct.productName}</Text>
                  <Text style={styles.priceUnit}>Price: {parseInt(selectedProduct.price).toLocaleString("vi-VN")} {selectedProduct.priceUnit}</Text>
                  <Text>Size:</Text>
                  <FlatList
                    data={selectedProduct.size}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => setSelectedSize(item)}
                        style={[
                          styles.sizeBox,
                          selectedSize === item && styles.selectedSizeBox,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sizeText,
                            selectedSize === item && styles.selectedSizeText,
                          ]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    )}
                    contentContainerStyle={styles.sizeList}
                  />
                  <Text>Color:</Text>
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
                        <View style={[styles.colorCircle, { backgroundColor: item }]} />
                      </Pressable>
                    )}
                    contentContainerStyle={styles.colorList}
                  />
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text>Quantity:</Text>
                    <TouchableOpacity onPress={() => changeQuantity("decrease")} style={styles.quantityButton}>
                      <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                    <Text>{purchaseQuantity}</Text>
                    <TouchableOpacity onPress={() => changeQuantity("increase")} style={styles.quantityButton}>
                      <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Pressable onPress={() => handleUpdateOrder()} style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <Text>Loading...</Text>
          )}
        </BottomSheetModal>
        {/* Total & Payment Now Section */}
        {selectedOrders.length > 0 && (
          <View style={styles.orderInfo}>
            <Text style={styles.totalPrice}>
              Total: {calculateTotalPrice().toLocaleString("vi-VN")} đ
            </Text>
          </View>
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
            <Text style={styles.paymentText}>Payment Now</Text>
          </TouchableOpacity>
        )}
        <Toast />
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A5A40',
    marginBottom: 16,
    textAlign: "center"
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
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Bóng đổ nhẹ
    marginBottom: 15,
    position: 'relative', // Add relative positioning
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 15,
    borderRadius: 10,
    borderColor: "#000"
  },
  details: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
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
  priceUnit: {
    fontSize: 16,
    color: '#588157',
    fontWeight: "bold",
  },
  //Group quantity btn
  itemQuantity: {
    position: 'absolute', // Use absolute positioning
    bottom: 10, // Position at the bottom
    right: 10, // Align it to the right
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 10,
    backgroundColor: '#A3B18A',
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 30,
  },
  buttonText: {
    position: 'absolute', // Use absolute positioning
    top: 0, // Position at the bottom
    right: 0, // Align it to the right
    flexDirection: 'row',
    alignItems: 'center',
    color: "#fff",
    fontSize: 16,
    //fontWeight: "bold",
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  chooseBtn: {
    position: 'absolute', // Use absolute positioning
    top: -1, // Position at the bottom
    right: 5, // Align it to the right
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  iconChooseBtn: {

  },
  choosedIconBtn: {

  },
  orderInfo: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  totalPrice: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#A3B18A",
    fontSize: 16,
    marginVertical: 5,
    color: "#000",
    fontWeight: "bold"
  },
  paymentButton: {
    backgroundColor: '#344E41',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  paymentText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    aspectRatio: 1 / 2, // Tạo tỷ lệ hình ảnh 1:2
    marginRight: 20, // Khoảng cách giữa ảnh và thông tin sản phẩm
    borderRadius: 10, // Bo góc ảnh nếu cần
    resizeMode: 'cover',// Đảm bảo hình ảnh bao phủ toàn bộ không gian
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 10,
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  sizeBox: {
    padding: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },
  selectedSizeBox: {
    borderColor: '#3b82f6',
    backgroundColor: '#e6f0ff',
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 10,
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  colorBox: {
    margin: 5,
    padding: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 50,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },
  selectedColorBox: {
    borderColor: '#006400',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Styles cho nút xác nhận
  confirmButton: {
    backgroundColor: '#344E41',// Màu nền của nút xác nhận
    paddingVertical: 12,// Khoảng cách dọc cho nút
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,               // Khoảng cách từ phần nội dung sản phẩm
    alignItems: 'center',        // Căn giữa nội dung trong nút
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',        // Chữ đậm
  },

  //Left & Right Action
  editAction: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  deleteAction: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Cart;
