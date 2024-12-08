import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Đừng quên cài đặt thư viện này
import { FIREBASE_DB } from "../../firebaseConfig"; // Firebase config của bạn
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function Contact() {
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
  });

  // Hàm đọc dữ liệu từ Firestore
  const fetchContactInfo = async () => {
    try {
      // 1. Lấy danh sách document trong collection 'Contact'
      const collectionRef = collection(FIREBASE_DB, "Contact");
      const querySnapshot = await getDocs(collectionRef);

      if (!querySnapshot.empty) {
        // 2. Lấy document đầu tiên (hoặc logic chọn document của bạn)
        const docId = querySnapshot.docs[0].id; // Chọn docID đầu tiên
        const docRef = doc(FIREBASE_DB, "Contact", docId);

        // 3. Lấy dữ liệu từ document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContactInfo(docSnap.data()); // Cập nhật state với dữ liệu từ Firestore
        } else {
          Alert.alert("Lỗi", "Không tìm thấy dữ liệu");
        }
      } else {
        Alert.alert("Lỗi", "Không có document nào trong collection Contact");
      }
    } catch (error) {
      Alert.alert("Lỗi", `Không thể tải dữ liệu: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Lỗi", "Không thể mở liên kết này")
    );
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${contactInfo.phone}`).catch(() =>
      Alert.alert("Lỗi", "Không thể mở ứng dụng gọi điện")
    );
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactInfo.email}`).catch(() =>
      Alert.alert("Lỗi", "Không thể mở ứng dụng email")
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Liên hệ</Text>

      <TouchableOpacity style={styles.item} onPress={handlePhonePress}>
        <Icon name="phone" size={24} color="#000" />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>Gọi Số điện thoại</Text>
          <Text style={styles.itemSubtitle}>{contactInfo.phone}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => handleLinkPress(contactInfo.facebook)}
      >
        <Icon name="facebook" size={24} color="#3b5998" />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>Facebook</Text>
          <Text style={styles.itemSubtitle}>mrsimplestyle</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => handleLinkPress(contactInfo.instagram)}
      >
        <Icon name="instagram" size={24} color="#C13584" />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>Instagram</Text>
          <Text style={styles.itemSubtitle}>mrsimple_store</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={handleEmailPress}>
        <Icon name="email-outline" size={24} color="#000" />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>Email</Text>
          <Text style={styles.itemSubtitle}>{contactInfo.email}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemContent: {
    marginLeft: 16,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});
