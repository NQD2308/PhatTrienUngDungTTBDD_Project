import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from "react-native";
import { FIREBASE_DB } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Detail({ route }) {
  const { productId } = route.params; // Nhận productId từ màn hình trước
  const [product, setProduct] = useState(null);
  
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
      </View>
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.btnAddToCart}>
          <Text>Add To Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnAddToCart, { backgroundColor: "#3b82f6" }]}>
          <Text style={{ color: "white" }}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
  },
  image: {
    width: '100%', // Chiếm toàn bộ chiều ngang
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
