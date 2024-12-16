import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Đừng quên cài đặt thư viện này
import { FIREBASE_DB } from "../../firebaseConfig"; // Firebase config của bạn
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import FontAwesome from "react-native-vector-icons/FontAwesome6"; // Đừng quên cài đặt thư viện này
import i18next from "../../services/i18next";
import { useNavigation } from '@react-navigation/native';

export default function Contact() {
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
  });
  const navigation = useNavigation();

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
          Alert.alert(i18next("Error"), i18next.t("Data not found"));
        }
      } else {
        Alert.alert(i18next("Error"), i18next.t("Data not found"));
      }
    } catch (error) {
      Alert.alert(i18next("Error"), i18next.t(`Unable to load data`) + `: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert(i18next("Error"), i18next.t("Unable to open this link"))
    );
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${contactInfo.phone}`).catch(() =>
      Alert.alert(i18next("Error"), i18next.t("Unable to open the dialer app"))
    );
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactInfo.email}`).catch(() =>
      Alert.alert(i18next("Error"), i18next.t("Unable to open the email app"))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color={"#fff"} style={{ marginTop: 5 }} />
        </TouchableOpacity>
        <Text style={styles.header}>{i18next.t("Contact Us")}</Text>
      </View>

      <View style={styles.itemContainer}>
        <TouchableOpacity style={styles.item} onPress={handlePhonePress}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="phone" size={24} color="#000" />
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{i18next.t("Phone Number")}</Text>
              <Text style={styles.itemSubtitle}>{contactInfo.phone}</Text>
            </View>
          </View>
          <FontAwesome name="arrow-right" size={24} style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => handleLinkPress(contactInfo.facebook)}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="facebook" size={24} color="#3b5998" />
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Facebook</Text>
              <Text style={styles.itemSubtitle}>mrsimplestyle</Text>
            </View>
          </View>
          <FontAwesome name="arrow-right" size={24} style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => handleLinkPress(contactInfo.instagram)}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="instagram" size={24} color="#C13584" />
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Instagram</Text>
              <Text style={styles.itemSubtitle}>mrsimple_store</Text>
            </View>
          </View>
          <FontAwesome name="arrow-right" size={24} style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleEmailPress}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            /\
            <Icon name="email-outline" size={24} color="#000" />
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Email</Text>
              <Text style={styles.itemSubtitle}>{contactInfo.email}</Text>
            </View>
          </View>
          <FontAwesome name="arrow-right" size={24} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  headerContainer: {
    padding: 20,
    flexDirection: 'row',
    backgroundColor: "#000",
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Bóng đổ nhẹ
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Đường phân cách nhẹ giữa các item
  },
  itemContent: {
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 18, // Làm chữ lớn hơn một chút
    fontWeight: "600",
    color: "#555",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#343A40", // Màu chữ mờ hơn
  },
  arrowIcon: {
    color: "#ccc", // Mũi tên màu xám nhạt
  },
});
