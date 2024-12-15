import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, SafeAreaView } from "react-native";
import { useTranslation } from "react-i18next";
import i18next from "../../services/i18next";
import languagesList from "../../services/languagesList.json";
import { useFocusEffect } from "@react-navigation/native";

export default function Language({ navigation }) {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18next.language);

  const changeLanguage = (lang) => {
    i18next.changeLanguage(lang);
    setCurrentLanguage(lang);
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
        <Text style={styles.header}>{t("Languages")}</Text>
      </View>
      {/* <View style={styles.itemContainer}> */}
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
            <Text style={styles.languageText}>{i18next.t(item.nativeName)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
      {/* </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  headerContainer: {
    alignItems: "344E41",
    marginBottom: 10,
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
  },
  list: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },
  languageItem: {
    borderColor: "#495057",
    borderWidth: 2,
    padding: 15,
    marginBottom: 10,
    borderRadius: 20,
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },
  selectedLanguage: {
    backgroundColor: "#6C757D",
  },
  languageText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
});
