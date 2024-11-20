import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons"; // Sử dụng icon từ Ionicons
import { FIREBASE_DB } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 20;

export default function Home() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa tìm kiếm
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm được lọc

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, "Product"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setFilteredProducts(productList); // Khởi tạo danh sách được lọc
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      }
    };

    fetchProducts();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (keyword === "") {
      setFilteredProducts(products); // Hiển thị tất cả sản phẩm nếu không có từ khóa
    } else {
      const filtered = products.filter((product) =>
        product.productName.toLowerCase().includes(keyword)
      );
      setFilteredProducts(filtered);
    }
  };

  // Xóa nội dung tìm kiếm
  const handleClearSearch = () => {
    setSearchKeyword(""); // Xóa từ khóa
    setFilteredProducts(products); // Hiển thị lại tất cả sản phẩm
  };

  // Hiển thị danh sách sản phẩm
  const renderItem = ({ item }) => (
    <View
      style={styles.productCard}
      onTouchStart={() => navigation.navigate("Detail", { productId: item.id })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.productPrice}>
        {parseInt(item.price).toLocaleString("vi-VN")} {item.priceUnit}
      </Text>
      <Text style={styles.productDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Danh sách sản phẩm</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
        {searchKeyword.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearIcon}>
            <Icon name="close-circle" size={24} color="#888" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 5,
  },
  searchButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 10,
    marginLeft: 5,
  },
  list: {
    paddingBottom: 20,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  productPrice: {
    color: "#ff6347",
    fontSize: 14,
    marginTop: 5,
  },
});
