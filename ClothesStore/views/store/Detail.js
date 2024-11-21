import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

export default function Detail({ route }) {
  const navigation = useNavigation();
  const { productId } = route.params; // Nhận productId từ màn hình trước
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null); // Lưu size được chọn
  const [quantity, setQuantity] = useState(1); // Số lượng mặc định là 1
  const [cart, setCart] = useState([]); // Quản lý giỏ hàng

  useEffect(() => {
    // Hàm để lấy dữ liệu sản phẩm từ Firestore
    const fetchProduct = async () => {
      try {
        const docRef = doc(FIREBASE_DB, "Product", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product: ", error);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) {
    return <Text>Loading...</Text>;
  }

  // ========== Xử lý số lượng mua hàng ========== //
  const handleIncrease = () => {
    setQuantity(quantity + 1); // Tăng số lượng
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1); // Giảm số lượng, nhưng không dưới 1
    }
  };
  // ========== Kết thúc xử lý số lượng mua hàng ========== //

  // ========== Xử lý thêm vào giỏ hàng ========== //
  const handleAddToCart = async () => {
    try {
      // Lấy userId từ Firebase Auth
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        // console.error("User not logged in!");
        navigation.navigate("Login");
        return;
      }
      const userId = user.uid;

      if (!selectedSize) {
        Toast.show({
          type: "error",
          text1: "Message",
          text2: "Vui lòng chọn size sản phẩm!",
          visibilityTime: 3000, // Duration of toast
          autoHide: true, // Automatically hide after a duration
        });
        return;
      }

      // Tính toán tổng giá
      const totalPrice = quantity * parseInt(product.price);

      // Lấy ID tài liệu tiếp theo
      const orderRef = doc(FIREBASE_DB, "Order", "metadata"); // Document chứa metadata
      let nextOrderId = 1;

      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        nextOrderId = orderSnap.data().nextOrderId || 1;
      }

      // Tạo đơn hàng mới
      const orderData = {
        userId,
        productId,
        image: product.images,
        productName: product.productName,
        description: product.description,
        selectedSize,
        quantity,
        price: product.price,
        totalPrice,
        priceUnit: product.priceUnit,
        status: "pending", // Tùy chỉnh trạng thái đơn hàng
        createdAt: new Date().toISOString(), // Ngày tạo đơn hàng
      };

      await setDoc(
        doc(FIREBASE_DB, "Order", nextOrderId.toString()),
        orderData
      );

      // Cập nhật metadata với ID tiếp theo
      await setDoc(orderRef, { nextOrderId: nextOrderId + 1 });

      console.log("Order added successfully:", orderData);
      Toast.show({
        type: "success",
        text1: "Message",
        text2: "Thêm vào giỏ hàng thành công.",
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };
  // ========== Kết thúc xử lý thêm vào giỏ hàng ========== //

  // ========== Xử lý mua hàng ngay lập tức ========= //

  const handleBuyNow = async () => {
    try {
      // Lấy userId từ Firebase Auth
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        // console.error("User not logged in!");
        navigation.navigate("Login");
        return;
      }
      const userId = user.uid;

      if (!selectedSize) {
        Toast.show({
          type: "error",
          text1: "Message",
          text2: "Vui lòng chọn size sản phẩm!",
          visibilityTime: 3000, // Duration of toast
          autoHide: true, // Automatically hide after a duration
        });
        return;
      }

      // Tính toán tổng giá
      const totalPrice = quantity * parseInt(product.price);

      // Lấy ID tài liệu tiếp theo
      const orderRef = doc(FIREBASE_DB, "Order", "metadata"); // Document chứa metadata
      let nextOrderId = 1;

      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        nextOrderId = orderSnap.data().nextOrderId || 1;
      }

      // Tạo đơn hàng mới
      const orderData = {
        userId,
        productId,
        image: product.images,
        productName: product.productName,
        description: product.description,
        selectedSize,
        quantity,
        price: product.price,
        totalPrice,
        priceUnit: product.priceUnit,
        status: "pending", // Tùy chỉnh trạng thái đơn hàng
        createdAt: new Date().toISOString(), // Ngày tạo đơn hàng
      };

      await setDoc(
        doc(FIREBASE_DB, "Order", nextOrderId.toString()),
        orderData
      );

      // Cập nhật metadata với ID tiếp theo
      await setDoc(orderRef, { nextOrderId: nextOrderId + 1 });

      // Truyền mảng orders vào màn hình thanh toán
      const orders = [orderData]; // Tạo mảng chứa đơn hàng hiện tại

      // Nếu có giỏ hàng, bạn có thể thêm các đơn hàng trong giỏ vào mảng orders
      if (cart && cart.length > 0) {
        orders.push(...cart); // Thêm các đơn hàng trong giỏ hàng vào mảng orders
      }

      // Chuyển sang màn hình thanh toán (Checkout)
      navigation.navigate("Payment", {
        orders, // Truyền mảng đơn hàng
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // ========== Kết thúc xử lý mua hàng ngay lập tức ========= //
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <FlatList
          data={product.images}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="contain" // Giữ nguyên kích thước gốc mà không bị cắt
            />
          )}
          showsVerticalScrollIndicator={false}
        />
        <Text style={styles.name}>{product.productName}</Text>
        <Text style={styles.price}>
          {parseInt(product.price).toLocaleString("vi-VN")} {product.priceUnit}
        </Text>
        <Text style={styles.description}>{product.description}</Text>
        {/* Xử lý số lượng mua hàng */}
        <View style={styles.quantityContainer}>
          <Pressable onPress={handleDecrease} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </Pressable>
          <Text style={styles.quantityText}>{quantity}</Text>{" "}
          {/* Hiển thị số lượng */}
          <Pressable onPress={handleIncrease} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </Pressable>
        </View>
        {/* Kết thúc xử lý số lượng mua hàng */}
        {/* Xử lý chọn size */}
        <FlatList
          data={product.size}
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
        {/* Kết thúc xử lý chọn size */}
      </View>
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.btnAddToCart} onPress={handleAddToCart}>
          <Text>Add To Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleBuyNow}
          style={[styles.btnAddToCart, { backgroundColor: "#3b82f6" }]}
        >
          <Text style={{ color: "white" }}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
  },
  image: {
    width: "100%", // Chiếm toàn bộ chiều ngang
    height: undefined, // Để tự động điều chỉnh theo tỷ lệ gốc
    aspectRatio: 1, // Giữ nguyên tỷ lệ ảnh (có thể điều chỉnh nếu cần)
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: "green",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#555",
  },
  sizeList: {
    flexDirection: "row", // Sắp xếp hàng ngang
    flexWrap: "wrap", // Tự động xuống dòng
    justifyContent: "flex-start",
    marginVertical: 10,
    gap: 8, // Khoảng cách giữa các ô
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 120, // Độ rộng cố định
    marginVertical: 10, // Khoảng cách trên dưới
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 5,
    backgroundColor: "#f9f9f9",
  },
  quantityButton: {
    padding: 10,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff", // Màu chữ của nút
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  bottomArea: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  btnAddToCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
