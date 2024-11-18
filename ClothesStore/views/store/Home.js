import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// Tính chiều rộng của màn hình để điều chỉnh số lượng card hiển thị
const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 20; // Chiều rộng mỗi card (đã trừ khoảng cách margin)

export default function Home() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  // const [numColumns, setNumColumns] = useState(2);

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
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      }
    };

    fetchProducts();
  }, []);

  // Hiển thị danh sách sản phẩm
  const renderItem = ({ item }) => (
    <View style={styles.productCard} onTouchStart={() => navigation.navigate('Detail', { product: item })}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.productPrice}>
        {parseInt(item.price).toLocaleString('vi-VN') } {item.priceUnit};
      </Text>
      <Text style={styles.productDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Danh sách sản phẩm</Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        // numColumns={numColumns}
        // columnWrapperStyle={styles.row}
        // key={numColumns} // Thay đổi key khi numColumns thay đổi
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
  list: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between", // Căn đều các card trong một hàng
    marginBottom: 15,
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
    alignItems: "center", // Căn giữa nội dung trong card
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
