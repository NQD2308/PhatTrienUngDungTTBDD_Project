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
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  onLayoutChange
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";// Sử dụng icon từ Ionicons
import FontAwesome from 'react-native-vector-icons/FontAwesome6';
import { FIREBASE_DB } from "../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import i18next from "../../services/i18next";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 20;

export default function Home({ route }) {
  const navigation = useNavigation();
  const { userId } = route.params;
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa tìm kiếm
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm được lọc
  const [sortOrder, setSortOrder] = useState("asc"); // Thứ tự sắp xếp: 'asc' hoặc 'desc'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [layoutMode, setLayoutMode] = useState(1); // Mặc định 1 sản phẩm trên 1 hàng
  const [visibleCount, setVisibleCount] = useState(4); // Số sản phẩm hiển thị ban đầu

  const [isVisible, setIsVisible] = useState(false);
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["40%", "60%"], []);

  // Hàm xử lý khi click vào View More
  const handleViewMore = () => {
    setVisibleCount(filteredProducts.length); // Hiển thị tất cả sản phẩm
  };

  // Đóng bottom sheet
  const closeBottomSheet = () => {
    bottomSheetModalRef.current?.dismiss();
    setIsVisible(false);
  };

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
        const querySnapshot = await getDocs(
          collection(FIREBASE_DB, "Category")
        );
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

  useFocusEffect(
    React.useCallback(() => {
      // Đóng BottomSheet khi quay lại màn hình
      bottomSheetModalRef.current?.close();
    }, [])
  );

  // Mở Bottom Sheet
  const openCategorySheet = () => {
    bottomSheetModalRef.current?.present();
  };

  // Xử lý tìm kiếm
  const handleFilteredProducts = (products) => {
    setFilteredProducts(products);
  };
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
    setModalVisible(false); // Đóng Modal sau khi chọn
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
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("Detail", { productId: item.id, userId: userId })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.productPrice}>
        {parseInt(item.price).toLocaleString("vi-VN")} {item.priceUnit}
      </Text>
      <Text style={styles.productDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{i18next.t("Search")}</Text>
          {/* TextInput không khung viền */}
          <View style={styles.searchContainer}>
            {searchKeyword.length > 0 && (
              <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                <FontAwesome name="magnifying-glass" size={17} color="#708090" />
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.searchInput}
              value={searchKeyword}
              onChangeText={setSearchKeyword}
            />
            {searchKeyword.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearIcon}
              >
                <FontAwesome name="xmark" size={17} color="#708090" />
              </TouchableOpacity>
            )}

          </View>
          {/* Header TouchableOpacity */}
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate("Wishlist")}>
              <FontAwesome name="heart" size={20} color="#000" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(true)} >
              <FontAwesome name="filter" size={20} color="#000" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openCategorySheet}>
              <FontAwesome name="layer-group" size={20} color="#000" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)} // Đóng Modal khi nhấn ngoài
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>{i18next.t("Filter")}</Text>

                  {/* Sort Price */}
                  <View style={styles.rowContainer}>
                    <Text style={styles.titleLabel}>{i18next.t("Price")}:</Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[
                          styles.sortButton,
                          sortOrder === "asc" && styles.buttonSelectedUp,
                        ]}
                        onPress={() => handleSort("asc")}
                      >
                        <FontAwesome name="sort-up" size={20} color="#000" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.sortButton,
                          sortOrder === "desc" && styles.buttonSelectedDown,
                        ]}
                        onPress={() => handleSort("desc")}
                      >
                        <FontAwesome name="sort-down" size={20} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Change Layout */}
                  <View style={styles.rowContainer}>
                    <Text style={styles.titleLabel}>{i18next.t("Layout")}:</Text>
                    <View style={styles.layoutBtnGroup}>
                      <TouchableOpacity
                        style={[
                          styles.layoutButton,
                          layoutMode === 1 && styles.layoutButtonSelected,
                        ]}
                        onPress={() => setLayoutMode(1) & setModalVisible(false)}
                      >
                        <Text style={styles.layoutText}>1</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.layoutButton,
                          layoutMode === 2 && styles.layoutButtonSelected,
                        ]}
                        onPress={() => setLayoutMode(2) & setModalVisible(false)}
                      >
                        <Text style={styles.layoutText}>2</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.layoutButton,
                          layoutMode === 4 && styles.layoutButtonSelected,
                        ]}
                        onPress={() => setLayoutMode(4) & setModalVisible(false)}
                      >
                        <Text style={styles.layoutText}>4</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Content */}
        {/* <Text style={styles.title}>Danh sách sản phẩm</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
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
              {sortOrder === "asc" ? "Price ↑" : "Price ↓"}
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* Category */}
        {/* <TouchableOpacity
          style={styles.categoryButton}
          onPress={openCategorySheet}
        >
          <Text style={styles.categoryButtonText}>
            {selectedCategory
              ? `Category: ${getCategoryName(selectedCategory)}`
              : "Category"}
          </Text>
          <FontAwesome name="layer-group" size={20} color="#fff" />
        </TouchableOpacity> */}

        {/* Render Item */}
        <ScrollView>
          <View style={styles.brandView}>
            <FontAwesome
              name="shopware"
              style={{ color: "#000", fontSize: 50, marginTop: 10, }}
            />
            <Text style={styles.nameStore}>Clothes's Store</Text>
          </View>

          <View style={styles.productList}>
            {filteredProducts.slice(0, visibleCount).map((item, index) => (
              <View
                key={index}
                style={[
                  styles.productContainer,
                  layoutMode === 1 && { width: "100%" }, // 1 sản phẩm trên 1 hàng
                  layoutMode === 2 && { width: "48%", marginHorizontal: "1%" }, // 2 sản phẩm trên 1 hàng
                  layoutMode === 4 && { width: "23%", marginHorizontal: "1%" }, // 4 sản phẩm trên 1 hàng
                ]}
              >
                <TouchableOpacity onPress={() => navigation.navigate("Detail", { productId: item.id })}>
                  <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                  <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{item.productName}</Text>
                  <Text style={styles.productPrice}>
                    {parseInt(item.price).toLocaleString("vi-VN")} {item.priceUnit}
                  </Text>
                </TouchableOpacity>

                {/* <Text style={styles.productDescription}>{item.description}</Text> */}
              </View>
            ))}
          </View>
          {/* Button View More */}
          {visibleCount < filteredProducts.length && (
            <TouchableOpacity style={styles.viewMoreButton} onPress={handleViewMore}>
              <Text style={styles.viewMoreText}>{i18next.t("View More")}</Text>
            </TouchableOpacity>
          )}
        </ScrollView >


        {/* <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          numColumns={layoutMode === 1 ? 1 : layoutMode === 2 ? 2 : 4}
          key={layoutMode} // Thêm key để FlatList re-render khi layoutMode thay đổi
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        /> */}

        {/* Bottom Sheet */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={({ style }) => (
            <TouchableWithoutFeedback onPress={closeBottomSheet}>
              <View
                style={[
                  style,
                  {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu tối với độ mờ
                  },
                ]}
              />
            </TouchableWithoutFeedback>
          )}
        >
          <View style={styles.bottomSheetContainer}>
            <Text style={styles.sheetTitle}>{i18next.t("Category")}</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => filterByCategory(category.id)}
              >
                <Text style={styles.categoryText}>{category.Name}</Text>
              </TouchableOpacity>
            ))}
            {/* clearCategoryButton */}
            <TouchableOpacity
              style={styles.clearCategoryButton}
              onPress={() => {
                setFilteredProducts(products); // Hiển thị lại tất cả sản phẩm
                setSelectedCategory(null); // Xóa loại sản phẩm đã chọn
                bottomSheetModalRef.current?.dismiss(); // Đóng Bottom Sheet
              }}
            >
              <Text style={styles.clearCategoryButtonText}>{i18next.t("Cancel")}</Text>
            </TouchableOpacity>
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
  // Header Style
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    flex: 0.5,
    textAlign: 'left',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.2,
    marginLeft: 5,
    marginRight: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#00000',
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#333',
    padding: 0,
  },
  searchButton: {
    // marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 8,
  },

  //BrandView & Name Store
  brandView: {
    justifyContent: "center",
    alignItems: "center",
  },
  nameStore: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#000",
  },

  //Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    borderBottomColor: "#000000",
    borderBottomWidth: 1,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  titleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    shadowColor: '#000', // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  buttonSelectedUp: {
    backgroundColor: "#4CAF50",
  },
  buttonSelectedDown: {
    backgroundColor: "#dc143c",
  },
  layoutBtnGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  layoutButton: {
    padding: 10,
    marginHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    shadowColor: '#000', // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  layoutButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  layoutText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15
  },

  // Category
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#708090",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000', // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  categoryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 5,
  },

  //Render Item
  productList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  productContainer: {
    marginVertical: 15,
    paddingBottom: 15,
    alignItems: 'center', // Căn giữa toàn bộ container sản phẩm
  },
  productImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 2 / 3,  // Tạo tỷ lệ hình ảnh 2:3
    resizeMode: 'cover', // Đảm bảo hình ảnh bao phủ toàn bộ không gian
  },
  productName: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',  // Căn giữa tên sản phẩm
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',  // Căn giữa giá sản phẩm
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  viewMoreButton: {
    marginBottom: 20,
    padding: 8,
    width: "80%",
    backgroundColor: "#495057",
    borderRadius: 5,
    alignSelf: "center",

  },
  viewMoreText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center"
  },

  //BottomSheet
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
    backgroundColor: "#212529",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: "center",
    shadowColor: '#000', // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  clearCategoryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
