import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { collection, getDocs, query, where } from "firebase/firestore";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";


const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 20;

export default function Home() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa tìm kiếm
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm được lọc
  const [sortOrder, setSortOrder] = useState("asc"); // Thứ tự sắp xếp: 'asc' hoặc 'desc'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);

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

  // Lấy danh sách loại sản phẩm
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, "Category"));
        const categoryList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu loại sản phẩm:", error);
      }
    };

    fetchCategories();
  }, []);

  // Mở Bottom Sheet
  const openCategorySheet = () => {
    bottomSheetModalRef.current?.present();
  };

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

  // Xử lý sắp xếp
  const handleSort = () => {
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (sortOrder === "asc") {
        return parseInt(a.price) - parseInt(b.price);
      } else {
        return parseInt(b.price) - parseInt(a.price);
      }
    });
    setFilteredProducts(sortedProducts);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Đổi thứ tự
  };

  // Lọc sản phẩm theo loại
  const filterByCategory = async (categoryId) => {
    try {
      const filteredQuery = query(
        collection(FIREBASE_DB, "Product"),
        where("idCategory", "==", categoryId)
      );
      const querySnapshot = await getDocs(filteredQuery);
      const filteredList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFilteredProducts(filteredList);
      setSelectedCategory(categoryId);
      bottomSheetModalRef.current?.dismiss();
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm theo loại:", error);
    }
  };

  // Lây tên danh mục sản phẩm
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.Name : null;
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
    <BottomSheetModalProvider>
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
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearIcon}
            >
              <Icon name="close-circle" size={24} color="#888" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Icon name="search" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSort} style={styles.sortButton}>
            <Text style={styles.sortButtonText}>
              {sortOrder === "asc" ? "Giá ↑" : "Giá ↓"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Nút lọc loại sản phẩm */}
        <TouchableOpacity style={styles.filterButton} onPress={openCategorySheet}>
          <Text style={styles.filterButtonText}>
            {selectedCategory ? `Loại: ${getCategoryName(selectedCategory)}` : "Chọn loại"}
          </Text>
          <Icon name="filter" size={20} color="#fff" />
        </TouchableOpacity>
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
        {/* Bottom Sheet */}
        <BottomSheetModal
  ref={bottomSheetModalRef}
  index={0}
  snapPoints={snapPoints}
>
  <View style={styles.bottomSheetContainer}>
    <Text style={styles.sheetTitle}>Chọn loại sản phẩm</Text>
    
    {/* Nút bỏ chọn loại */}
    <TouchableOpacity
      style={styles.clearCategoryButton}
      onPress={() => {
        setFilteredProducts(products); // Hiển thị lại tất cả sản phẩm
        setSelectedCategory(null); // Xóa loại sản phẩm đã chọn
        bottomSheetModalRef.current?.dismiss(); // Đóng Bottom Sheet
      }}
    >
      <Text style={styles.clearCategoryButtonText}>Bỏ chọn loại</Text>
    </TouchableOpacity>

    {categories.map((category) => (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryItem}
        onPress={() => filterByCategory(category.id)}
      >
        <Text style={styles.categoryText}>{category.Name}</Text>
      </TouchableOpacity>
    ))}
  </View>
</BottomSheetModal>

      </SafeAreaView>
    </BottomSheetModalProvider>
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
  sortButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    padding: 10,
    marginLeft: 5,
  },
  sortButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 5,
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
  bottomSheetContainer: {
    flex: 1,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  categoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  categoryText: {
    fontSize: 16,
  },
  clearCategoryButton: {
    backgroundColor: "#f44336", // Màu đỏ để nổi bật
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  clearCategoryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
