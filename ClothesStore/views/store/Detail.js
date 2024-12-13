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
  ActivityIndicator,
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
  find,
  addDoc,
  where,
  updateDoc,
} from "firebase/firestore";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ScrollView } from "react-native-gesture-handler";
import i18next from "../../services/i18next";

export default function Detail({ route }) {
  const navigation = useNavigation();
  const { productId, userId } = route.params; // Nhận productId từ màn hình trước
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null); // Lưu size được chọn
  const [selectedColor, setSelectedColor] = useState(null); // Lưu màu được chọn
  const [quantity, setQuantity] = useState(1); // Số lượng mặc định là 1
  const [cart, setCart] = useState([]); // Quản lý giỏ hàng
  const [isLiked, setIsLiked] = useState(false); // Trạng thái yêu thích

  // lấy dữ liệu từ bảng wishlist
  const getWishlistData = async () => {
    const userId = FIREBASE_AUTH.currentUser?.uid; // Lấy userId từ Firebase Auth

    if (!userId) return; // Nếu chưa đăng nhập thì không làm gì

    try {
      const wishlistRef = doc(FIREBASE_DB, "Wishlist", userId); // Lấy tham chiếu đến tài liệu wishlist của người dùng
      const wishlistDoc = await getDoc(wishlistRef); // Lấy tài liệu

      if (wishlistDoc.exists()) {
        const wishlistData = wishlistDoc.data(); // Lấy dữ liệu wishlist

        // Tìm sản phẩm trong mảng `products` có `productId` trùng khớp
        const productInWishlist = wishlistData.products.find(
          (product) => product.productId === productId
        );

        if (productInWishlist) {
          console.log("UID: ", userId);
          console.log("Product ID: ", productId);
          console.log("Status: ", productInWishlist.status);

          // Cập nhật trạng thái `isLiked` theo giá trị `status` của sản phẩm
          setIsLiked(productInWishlist.status);
        }
      } else {
        console.log("Không tìm thấy wishlist cho người dùng này.");
      }
    } catch (error) {
      console.error("Lỗi khi tải wishlist:", error);
    }
  };

  useEffect(() => {
    // Hàm để lấy dữ liệu sản phẩm từ Firestore
    const fetchProduct = async () => {
      console.log("User id detail.js: ", userId);

      setLoading(true);

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
      } finally {
        setLoading(false); // Kết thúc tải dữ liệu
      }
    };

    fetchProduct();
    getWishlistData(); // Gọi hàm để lấy thông tin wishlist
  }, [productId]);

  if (loading || !product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#dc143c" />
      </View>
    );
  }

  // if (!product) {
  //   return <Text>Loading...</Text>;
  // }

  // ========== Xử lý số lượng mua hàng ========== //
  const handleIncrease = () => {
    setQuantity(quantity + 1); // Tăng số lượng
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1); // Giảm số lượng, nhưng không dưới 1
    }
  };

  // ========== Xử lý thêm vào giỏ hàng ========== //
  const handleAddToCart = async () => {
    try {
      // Lấy userId từ Firebase Auth
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        navigation.navigate("Login");
        return;
      }
      const userId = user.uid;

      // Kiểm tra chọn size
      if (!selectedColor) {
        Toast.show({
          type: "error",
          text1: "Message",
          text2: "Vui lòng chọn size sản phẩm!",
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      //Kiểm tra chọn màu
      if (!selectedSize) {
        Toast.show({
          type: "error",
          text1: "Message",
          text2: "Vui lòng chọn màu sản phẩm!",
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      // Tính toán tổng giá
      const totalPrice = quantity * parseInt(product.price);

      // Tạo đối tượng orderData
      const orderData = {
        userId,
        productId,
        image: product.images,
        productName: product.productName,
        description: product.description,
        selectedSize,
        selectedColor,
        quantity,
        price: product.price,
        totalPrice,
        priceUnit: product.priceUnit,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const orderRef = collection(FIREBASE_DB, "Order");

      // Tìm kiếm sản phẩm trong giỏ hàng (Order collection) đã có trong Firestore
      const q = query(
        orderRef,
        where("userId", "==", userId),
        where("productId", "==", productId),
        where("selectedSize", "==", selectedSize),
        where("selectedColor", "==", selectedColor)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Nếu đã có sản phẩm trong giỏ hàng, cập nhật số lượng
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(FIREBASE_DB, "Order", docId);

        // Cập nhật số lượng sản phẩm trong giỏ hàng
        const updatedQuantity =
          querySnapshot.docs[0].data().quantity + quantity;
        const updatedTotalPrice = updatedQuantity * parseInt(product.price);

        // Cập nhật lại document trong Firestore
        await updateDoc(docRef, {
          quantity: updatedQuantity,
          totalPrice: updatedTotalPrice,
        });

        console.log("Cart updated successfully:", {
          quantity: updatedQuantity,
          totalPrice: updatedTotalPrice,
        });
        Toast.show({
          type: "success",
          text1: "Message",
          text2: "Cập nhật giỏ hàng thành công.",
          visibilityTime: 3000,
          autoHide: true,
        });
      } else {
        // Nếu chưa có sản phẩm trong giỏ hàng, tạo mới đơn hàng
        const docRef = await addDoc(orderRef, orderData);

        // Lưu ID của document vào orderData
        orderData.id = docRef.id;

        console.log("Order added successfully:", orderData);
        Toast.show({
          type: "success",
          text1: "Message",
          text2: "Thêm vào giỏ hàng thành công.",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

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

      //Kiểm tra chọn size
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

      //Kiểm tra chọn màu
      if (!selectedSize) {
        Toast.show({
          type: "error",
          text1: "Message",
          text2: "Vui lòng chọn màu sản phẩm!",
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      // Tính toán tổng giá
      const totalPrice = quantity * parseInt(product.price);

      // Tạo đơn hàng mới
      const orderData = {
        userId,
        productId,
        image: product.images,
        productName: product.productName,
        description: product.description,
        selectedSize,
        selectedColor,
        quantity,
        price: product.price,
        totalPrice,
        priceUnit: product.priceUnit,
        status: "pending", // Tùy chỉnh trạng thái đơn hàng
        createdAt: new Date().toISOString(), // Ngày tạo đơn hàng
      };

      const orderRef = collection(FIREBASE_DB, "Order");
      const docRef = await addDoc(orderRef, orderData);

      // Lưu ID của document vào orderData
      orderData.id = docRef.id; // Lưu ID document vừa tạo vào object orderData

      // Truyền mảng orders vào màn hình thanh toán
      const orders = [orderData]; // Tạo mảng chứa đơn hàng hiện tại

      // Nếu có giỏ hàng, bạn có thể thêm các đơn hàng trong giỏ vào mảng orders
      if (cart && cart.length > 0) {
        orders.push(...cart); // Thêm các đơn hàng trong giỏ hàng vào mảng orders
      }

      const totalAmount = totalPrice;

      // Chuyển sang màn hình thanh toán (Checkout)
      navigation.navigate("Payment", { orders, totalAmount });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // ========== Hàm xử lý khi nhấn vào nút ========== //
  const toggleWishlist = async () => {
    const userId = FIREBASE_AUTH.currentUser?.uid; // Lấy userId từ Firebase Auth (nếu người dùng đã đăng nhập)

    if (!userId) {
      // Nếu người dùng chưa đăng nhập
      Alert.alert(
        "Đăng nhập yêu cầu",
        "Vui lòng đăng nhập để thêm vào danh sách yêu thích.",
        [
          {
            text: "Đăng nhập",
            onPress: () => {
              // Điều hướng tới màn hình đăng nhập
              navigation.navigate("Login");
            },
          },
          {
            text: "Hủy",
            style: "cancel",
          },
        ]
      );
      return; // Dừng nếu người dùng chưa đăng nhập
    }

    try {
      const wishlistRef = doc(FIREBASE_DB, "Wishlist", userId); // Tham chiếu đến wishlist của người dùng

      const wishlistDoc = await getDoc(wishlistRef); // Lấy document wishlist của người dùng

      if (wishlistDoc.exists()) {
        const wishlistData = wishlistDoc.data();
        const productInWishlist = wishlistData.products.find(
          (product) => product.productId === productId
        );

        if (productInWishlist) {
          const newStatus = productInWishlist.status === true ? false : true; // Nếu trạng thái true (liked) thì chuyển thành false (unliked), ngược lại

          // Cập nhật lại trạng thái status của sản phẩm
          await updateDoc(wishlistRef, {
            products: wishlistData.products.map((product) =>
              product.productId === productId
                ? { ...product, status: newStatus }
                : product
            ),
          });

          setIsLiked(newStatus); // Cập nhật trạng thái tim (liked hoặc unliked)
        } else {
          // Nếu chưa có sản phẩm trong wishlist, thêm sản phẩm mới với trạng thái liked (true)
          await updateDoc(wishlistRef, {
            products: [
              ...wishlistData.products,
              { productId, status: true }, // Thêm sản phẩm vào danh sách với trạng thái liked (true)
            ],
          });

          setIsLiked(true); // Đặt trạng thái là liked sau khi thêm sản phẩm vào wishlist
        }
      } else {
        // Nếu wishlist chưa tồn tại, tạo mới và thêm sản phẩm vào
        await setDoc(wishlistRef, {
          products: [
            { productId, status: true }, // Mặc định thêm vào với status 'true' (liked)
          ],
        });

        setIsLiked(true); // Đặt trạng thái là liked sau khi tạo wishlist và thêm sản phẩm
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật wishlist:", error); // Log lỗi nếu có
    }
  };

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
        <ScrollView>
          <View style={styles.headerContainer}>
            <Text style={styles.name}>{product.productName}</Text>
            <TouchableOpacity
              onPress={toggleWishlist}
              style={styles.wishlistButton}
            >
              <FontAwesome
                name={isLiked ? "heart" : "heart-o"} // Hiển thị "heart" nếu đã thích, "heart-o" nếu chưa
                size={32} // Tăng kích thước icon
                color={isLiked ? "red" : "#555555"} // Đổi màu đỏ nếu đã thích
              />
            </TouchableOpacity>
          </View>
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
          <Text style={styles.colorTitle}>{i18next.t("Choose a size")}:</Text>
          <View style={styles.sizeList}>
            {product.size.map((item, index) => (
              <Pressable
                key={index}
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
            ))}
          </View>
          {/* Kết thúc xử lý chọn size */}
          {/* Chọn màu */}
          <Text style={styles.colorTitle}>{i18next.t("Choose a color")}:</Text>
          <View style={styles.colorList}>
            {product.colors.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedColor(item)}
                style={[
                  styles.colorBox,
                  selectedColor === item && styles.selectedColorBox,
                ]}
              >
                <View
                  style={[styles.colorCircle, { backgroundColor: item }]}
                ></View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.btnAddToCart} onPress={handleAddToCart}>
          <Text style={{ color: "#344E41", fontWeight: "500" }}>{i18next.t("Add To Cart")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleBuyNow}
          style={styles.btnBuyNow}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>{i18next.t("Buy Now")}</Text>
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
  headerContainer: {
    flexDirection: 'row', // Căn ngang các phần tử
    alignItems: 'center', // Căn giữa theo chiều dọc
    marginVertical: 5,
    paddingHorizontal: 16,
  },
  wishlistButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#F0F0F0', // Màu nền nhẹ
    borderRadius: 25, // Làm tròn button
    elevation: 2, // Hiệu ứng đổ bóng
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1, // Cho phép tên sản phẩm chiếm phần còn lại
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'flex-start',
    marginLeft: 15,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    marginHorizontal: 16,
    textAlign: 'justify',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityButton: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,

  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  sizeList: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 10,
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  sizeBox: {
    padding: 10,
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
  colorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
    textAlign: 'left',
    marginLeft: 15,
  },
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
  selectedColorBox: {
    borderColor: '#006400',
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
  bottomArea: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  btnAddToCart: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
    borderColor: '#344E41',
    borderWidth: 1,
    alignItems: 'center',
    borderRadius: 10,

  },
  btnBuyNow: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#344E41',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },
});
