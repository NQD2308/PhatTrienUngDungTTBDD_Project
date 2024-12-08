import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Dùng để lấy thông tin người dùng hiện tại
import { FIREBASE_DB } from "../../firebaseConfig"; // Đảm bảo đúng đường dẫn đến firebaseConfig
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export default function Wishlist() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]); // State lưu trữ sản phẩm yêu thích
  const [refreshing, setRefreshing] = useState(false); 

  // Hàm lấy dữ liệu từ bảng wishlist
  const getWishlist = async () => {
    try {
      setRefreshing(true); // Bắt đầu refresh
      const auth = getAuth(); // Lấy auth từ Firebase
      const userId = auth.currentUser ? auth.currentUser.uid : null; // Lấy userId của người dùng hiện tại

      if (!userId) {
        console.log("Chưa đăng nhập!");
        setRefreshing(false);
        return;
      }

      const wishlistQuery = collection(FIREBASE_DB, "Wishlist"); // Thay 'wishlist' bằng tên bảng của bạn
      const wishlistSnapshot = await getDocs(wishlistQuery);

      // Mảng lưu trữ các productId có status == true
      const productIds = [];

      wishlistSnapshot.docs.forEach((doc) => {
        // Kiểm tra xem doc.id có trùng với userId không
        if (doc.id === userId) {
          const wishlistData = doc.data();
          // Kiểm tra mảng Products có tồn tại và lọc các sản phẩm có status == true
          if (wishlistData.products) {
            wishlistData.products.forEach((product) => {
              if (product.status === true) {
                productIds.push(product.productId);
              }
            });
          }
        }
      });

      console.log("Danh sách productIds có status == true:", productIds);

      // Sau khi có danh sách productId, lấy thông tin sản phẩm từ bảng Product
      if (productIds.length > 0) {
        const productQuery = query(
          collection(FIREBASE_DB, "Product"),
          where("__name__", "in", productIds) // Truy vấn các sản phẩm có productId trong danh sách
        );

        const productSnapshot = await getDocs(productQuery);

        const products = [];
        productSnapshot.docs.forEach((productDoc) => {
          const productData = productDoc.data();
          products.push({
            id: productDoc.id,
            name: productData.productName,
            description: productData.description,
            priceUnit: productData.priceUnit,
            price: productData.price,
            image: productData.images, // Thêm thông tin hình ảnh nếu có
          });
        });

        // Log danh sách sản phẩm và cập nhật vào state
        console.log("Danh sách sản phẩm yêu thích:", products);
        // Cập nhật state để hiển thị sản phẩm
        setProducts(products);
      } else {
        console.log("Không có sản phẩm yêu thích nào.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu wishlist:", error);
    } finally {
      setRefreshing(false); // Kết thúc refresh
    }
  };

  useEffect(() => {
    // Gọi hàm lấy dữ liệu khi component được render
    getWishlist();
  }, []);

  // Render item cho FlatList
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productContainer}
      onPress={() => navigation.navigate("Detail", { productId: item.id })}
    >
      <Image source={{ uri: item.image[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.description}</Text>
        <Text style={styles.productPrice}>
          {parseInt(item.price).toLocaleString("vi-VN")} {item.priceUnit}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh Sách Yêu Thích</Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing} // Gắn trạng thái refresh
        onRefresh={getWishlist} // Gọi hàm getWishlist khi kéo để làm mới
      />
    </View>
  );
}

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
  productContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  likeButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  likeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
