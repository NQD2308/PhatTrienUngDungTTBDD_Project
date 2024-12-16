import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, SafeAreaView } from "react-native";
import { useTranslation } from "react-i18next";
import i18next from "../../services/i18next";
import languagesList from "../../services/languagesList.json";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from '@react-navigation/native';


export default function Language() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18next.language);

  // Thay đổi ngôn ngữ
  const changeLanguage = (lang) => {
    if (lang !== currentLanguage) {
      i18next.changeLanguage(lang); // Thay đổi ngôn ngữ trong i18next
      setCurrentLanguage(lang); // Cập nhật trạng thái
    }
  };

  // Chuyển danh sách ngôn ngữ thành mảng cho FlatList
  const languages = Object.entries(languagesList).map(([key, value]) => ({
    key,
    nativeName: value.nativeName,
  }));

  useFocusEffect(
    useCallback(() => {
      // Cập nhật lại state khi màn hình được focus
      setCurrentLanguage(i18next.language);
    }, [])
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={26} color={"#000"} />
        </TouchableOpacity>
        <Text style={styles.header}>{t("Languages")}</Text>
      </View>
      <View style={styles.itemContainer}>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.languageItem,
                currentLanguage === item.key && styles.selectedLanguage,
              ]}
              onPress={() => changeLanguage(item.key)}
            >
              {currentLanguage === item.key && (
                <FontAwesome name="check" size={24} style={styles.arrowIcon} />
              )}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.languageText}>{i18next.t(item.nativeName)}</Text>
              </View>
              
              
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 14,
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
  // list: {
  //   width: "100%",
  //   alignItems: "center",
  //   marginTop: 10,
  //   padding: 10,
  // },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    // justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Đường phân cách nhẹ giữa các item
    // borderColor: "#495057",
    // borderWidth: 2,
    // padding: 15,
    // marginBottom: 10,
    // borderRadius: 20,
    // alignItems: "center",
    // width: "80%",
    // alignSelf: "center",
    // shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
    // elevation: 5, // Hiệu ứng bóng trên Android
  },
  languageText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  arrowIcon: {
    color: "#333",
  },
});
