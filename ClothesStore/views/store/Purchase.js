import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_DB } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import i18next from "../../services/i18next";

export default function Purchase({ route }) {
  const { userId } = route.params;
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lấy dữ liệu từ Firestore
  const fetchPurchases = async () => {
    setLoading(true);

    try {
      if (userId) {
        const billCollection = collection(FIREBASE_DB, "Bill");
        const q = query(billCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const purchasesByDate = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const {
            timestamp,
            productId,
            productName,
            quantity,
            priceUnit,
            totalPrice,
            image,
            color,
            size,
          } = data;

          // Chuyển timestamp thành dạng ngày (YYYY-MM-DD)
          if (timestamp) {
            const date = new Date(timestamp);
            const dateString = date.toISOString().split("T")[0];

            if (!purchasesByDate[dateString]) {
              purchasesByDate[dateString] = [];
            }

            purchasesByDate[dateString].push({
              productId,
              productName,
              quantity,
              priceUnit,
              totalPrice,
              image,
              color,
              size,
            });
          }
        });

        // Chuyển dữ liệu thành mảng
        const groupedPurchases = Object.keys(purchasesByDate).map((date) => ({
          date,
          products: purchasesByDate[date],
        }));

        setPurchases(groupedPurchases);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPurchases();
  };

  const renderPurchase = ({ item }) => (
    <View style={styles.purchaseContainer}>
      <Text style={styles.dateText}>{item.date}</Text>
      {item.products.map((product, index) => (
        <View key={index} style={styles.productContainer}>
          {/* Hình ảnh sản phẩm */}
          {product.image && product.image.length > 0 && (
            <Image
              source={{ uri: product.image[0] }}
              style={styles.productImage}
            />
          )}
          {/* Thông tin sản phẩm */}
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.productName}</Text>
            <Text>{i18next.t("Size")}: {product.size}</Text>
            <View style={styles.colorRow}>
              <Text>{i18next.t("Color")}:</Text>
              <View
                style={[styles.colorBox, { backgroundColor: product.color }]}
              />
            </View>
            <Text>{i18next.t("Quantity")}: {product.quantity}</Text>
            <Text>{i18next.t("Total Price")}: {parseInt(product.totalPrice).toLocaleString("vi-VN")} {product.priceUnit}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#dc143c" />
        </View>
      ) : purchases.length === 0 ? (
        <Text>{i18next.t("No purchases found")}</Text>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.date}
          renderItem={renderPurchase}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  purchaseContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginLeft: 5,
    borderRadius: 4,
  },
});
