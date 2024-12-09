import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
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
            <Text style={styles.languageText}>{i18next.t(item.nativeName) }</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, marginBottom: 20 },
  list: { width: "100%", alignItems: "center" },
  languageItem: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  selectedLanguage: {
    backgroundColor: "#cce5ff",
  },
  languageText: {
    fontSize: 16,
  },
});
