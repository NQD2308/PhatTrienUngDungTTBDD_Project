import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from "react-native";
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
    <ImageBackground source={{
      uri: "https://images.pexels.com/photos/8483478/pexels-photo-8483478.jpeg?auto=compress&cs=tinysrgb&w=600",
    }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t("Languages")}</Text>
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
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#00000",
  },
  list: {
    width: "100%",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#000",
    marginTop: 10,
    padding: 10,
  },
  languageItem: {
    backgroundColor: "#f0f0f0",
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
    backgroundColor: "#FF5733",
  },
  languageText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
