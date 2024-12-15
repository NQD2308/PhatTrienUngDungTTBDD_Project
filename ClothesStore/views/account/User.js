import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
} from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import i18next from "../../services/i18next";
import { useCallback, useEffect, useState } from "react";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore"; // Import các hàm Firestore
import Toast from "react-native-toast-message";
import FontAwesome from "react-native-vector-icons/FontAwesome6";

export default function User({ navigation, route }) {
  const { userId } = route.params || {}; // Nhận userId từ route.params
  const safeUserId = userId || "guest"; // Giá trị mặc định nếu không có userId
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null); // Lưu thông tin người dùng
  const [countWishList, setCountWishList] = useState(null); // Lưu số lượng sản phẩm yêu thích
  const [countOrder, setCountOrder] = useState(null); // Lưu số lượng sản phẩm yêu thích

  console.log("User ID tại User.js: ", safeUserId);

  // Sử dụng useFocusEffect để refresh lại dữ liệu mỗi khi tab được focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData(); // Gọi hàm lấy dữ liệu
      fetchWishListData();
      fetchBillCount();

      return () => {
        console.log("Tab bị unfocus!");
      };
    }, [])
  );

  useEffect(() => {
    if (safeUserId !== "guest") {
      fetchUserData(); // Gọi hàm lấy dữ liệu
      fetchWishListData();
      fetchBillCount();
    } else {
      setLoading(false); // Không cần tải dữ liệu nếu là guest
    }
  }, [safeUserId]);

  const fetchUserData = async () => {
    try {
      // Truy vấn người dùng theo UID
      const userQuery = query(
        collection(FIREBASE_DB, "User"), // Collection 'users'
        where("uid", "==", safeUserId) // Tìm document có trường 'uid' trùng với userId
      );

      const querySnapshot = await getDocs(userQuery); // Thực thi truy vấn

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setUserData(doc.data()); // Lưu dữ liệu vào state
        });
      } else {
        Toast.show({
          type: "error",
          text1: i18next("Error"),
          text2: i18next("User not found!"),
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng: ", error);
      Toast.show({
        type: "error",
        text1: i18next("Error"),
        text2: i18next("Unable to load user information!"),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWishListData = async () => {
    try {
      // Truy vấn collection Wishlist
      const wishlistQuery = collection(FIREBASE_DB, "Wishlist");
      const wishlistSnapshot = await getDocs(wishlistQuery);

      let count = 0; // Biến đếm số lượng sản phẩm có status == true

      wishlistSnapshot.docs.forEach((doc) => {
        // Kiểm tra xem doc.id có trùng với userId không
        if (doc.id === userId) {
          const wishlistData = doc.data();
          // Kiểm tra mảng products có tồn tại
          if (wishlistData.products) {
            // Lọc và đếm các sản phẩm có status === true
            count += wishlistData.products.filter(
              (product) => product.status === true
            ).length;
          }
        }
      });
      setCountWishList(count);
      console.log("Số lượng sản phẩm yêu thích: ", count);


      console.log(`Tổng số sản phẩm có status == true: ${count}`);
      return count; // Trả về số lượng sản phẩm
    } catch (e) {
      console.error("Lỗi khi lấy dữ liệu Wishlist:", e);
      return 0; // Trả về 0 trong trường hợp xảy ra lỗi
    }
  };

  const fetchBillCount = async () => {
    try {
      // Truy vấn các đơn hàng của người dùng theo userId
      const userQuery = query(
        collection(FIREBASE_DB, "Bill"), // Collection 'Bill'
        where("userId", "==", safeUserId) // Lọc các document có trường 'userId' trùng với safeUserId
      );

      const querySnapshot = await getDocs(userQuery);

      // Đếm số lượng đơn hàng
      const billCount = querySnapshot.size; // `size` trả về số lượng document trong querySnapshot
      setCountOrder(billCount);

      if (billCount > 0) {
        console.log(`Người dùng hiện có ${billCount} đơn hàng.`);
      } else {

        console.log("Người dùng không có đơn hàng.");
        // Toast.show({
        //   type: "info",
        //   text1: i18next("Message"),
        //   text2: i18next("Bạn chưa có đơn hàng nào."),
        // });
      }

      return billCount; // Trả về số lượng đơn hàng nếu cần sử dụng tiếp
    } catch (error) {
      console.error("Lỗi khi đếm đơn hàng:", error);
      // Toast.show({
      //   type: "error",
      //   text1: i18next("Error"),
      //   text2: i18next()"Không thể đếm đơn hàng. Vui lòng thử lại sau.",
      // });
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6b7280" />
      </SafeAreaView>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      // Toast.show({
      //   type: "success",
      //   text1: "Thành công",
      //   text2: "Đăng xuất thành công!",
      // });
      navigation.replace("Inside");

      // Reset toàn bộ điều hướng
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Inside" }], // Điều hướng về màn hình Login
        })
      );
      // navigation.navigate('Inside')
    } catch (error) {
      console.error("Lỗi khi đăng xuất: ", error);
      Toast.show({
        type: "error",
        text1: i18next("Error"),
        text2: i18next("An error occurred while logging out. Please try again!"),
      });
    }
  };

  if (userId === "guest") {
    // Nếu chưa đăng nhập, hiển thị nút Đăng Nhập
    return (
      <ImageBackground
        style={styles.backgroundGuest}
        source={{
          uri: "https://plus.unsplash.com/premium_photo-1669703777431-0aaca97d2c53?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Link ảnh nền của bạn
        }}
      >
        <View style={styles.brandView}>
          <FontAwesome
            name="shopware"
            style={{ color: "#fff", fontSize: 60 }}
          />
        </View>
        {/* Change Languge Button */}
        <TouchableOpacity
          style={styles.languageBtnGuest}
          onPress={() => navigation.navigate("Language")}
        >
          <FontAwesome name="earth-americas" size={25} color="#ffff" />
        </TouchableOpacity>
        <Text style={styles.titleGuest}>Clothes's Store</Text>
        <Text style={styles.subtitleGuest}>{i18next.t("Begin to experience with us")}</Text>
        <TouchableOpacity
          style={styles.loginBtnGuest}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>{i18next.t("Get Started")}</Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }

  const handleDeleteAccount = async () => {
    const user = FIREBASE_AUTH.currentUser;

    if (user) {
      Alert.alert(
        i18next.t("Confirm account deletion"),
        i18next.t("Are you sure you want to delete this account? This action cannot be undone."),
        [
          {
            text: i18next.t("Cancel"), // Nút hủy
            style: "cancel",
          },
          {
            text: i18next.t("Confirm"), // Nút đồng ý
            onPress: async () => {
              try {
                const uid = user.uid;

                const userCollection = collection(FIREBASE_DB, "User");
                const q = query(userCollection, where("uid", "==", uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                  // Duyệt qua các tài liệu tìm được (thường chỉ có 1 tài liệu với uid là duy nhất)
                  querySnapshot.forEach(async (docSnap) => {
                    const docRef = doc(FIREBASE_DB, "User", docSnap.id);
                    console.log(docSnap.id);


                    // Xóa tài liệu
                    await deleteDoc(docRef);
                    console.log("Tài liệu đã bị xóa:", docSnap.id);
                  });

                  alert(i18next.t("The account has been deleted."));
                } else {
                  alert(i18next.t("The current user's account could not be found!"));
                }

                // Xóa tài khoản trong Firebase Authentication
                await deleteUser(user);

                // Đăng xuất người dùng
                handleSignOut();

              } catch (error) {
                console.error("Lỗi khi xóa tài khoản: ", error);
                if (error.code === "auth/requires-recent-login") {
                  alert(i18next.t("Please log in again to perform this action."));
                  // Điều hướng về màn hình đăng nhập
                  // navigation.navigate("Login");
                } else {
                  alert(i18next.t("An error occurred. Please try again."));
                }
              }
            },
          },
        ]
      );
    } else {
      alert(i18next.t("Current user not found!"));
    }
  };

  return (
    <View style={styles.container}>
      {/* Upper Section: ImageBackground */}
      <ImageBackground
        source={{
          uri: "https://images.pexels.com/photos/9594144/pexels-photo-9594144.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        }} // Link ảnh nền
        style={styles.background}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://images.pexels.com/photos/29571067/pexels-photo-29571067/free-photo-of-moody-black-and-white-portrait-of-tattooed-man.jpeg?auto=compress&cs=tinysrgb&w=600",
            }} // Link ảnh đại diện
            style={styles.profileImage}
          />
          {userData ? (
            <>
              <Text style={styles.title}>{userData.username}</Text>
              <Text style={styles.subtitle}>{userData.email}</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Email</Text>
              <Text style={styles.subtitle}>example@email.com</Text>
            </>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {/* Tổng số đơn hàng */}
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("Purchase")}>
            <Text style={styles.statValue}>{countOrder}</Text>
            <Text style={styles.statLabel}>{i18next.t("Orders")}</Text>{" "}
          </TouchableOpacity>
          {/* Lượt thích sản phẩm */}
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>400</Text>
            <Text style={styles.statLabel}>{i18next.t("Likes")}</Text>{" "}
          </TouchableOpacity>
          {/* Sản phẩm trong wishlist */}
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("Wishlist")}>
            <Text style={styles.statValue}>{countWishList}</Text>
            <Text style={styles.statLabel}>{i18next.t("Wishlist")}</Text>{" "}
          </TouchableOpacity>

        </View>
      </ImageBackground>

      {/* Change Languge Button */}
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => navigation.navigate("Language")}
      >
        <FontAwesome name="earth-americas" size={25} color="#ffff" />
      </TouchableOpacity>

      {/* Contact Info*/}
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => navigation.navigate("Contact")}
      >
        <FontAwesome name="circle-info" size={25} color="#ffff" />
      </TouchableOpacity>

      {/* Divider: LogOut Button and Method Icons */}
      <View style={styles.centerContainer}>
        <View style={styles.socialIcons}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.followText}>{i18next.t("Log Out")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("Profile", { userId: safeUserId })
            }
          >
            <FontAwesome name="user" size={25} color="white" solid />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("BiometricAuthentication", {
                userId: safeUserId,
              })
            }
          >
            <FontAwesome name="fingerprint" size={25} color="white" />
          </TouchableOpacity>
        </View>
      </View>
 
      {/* Lower Section: About Me */}
      <View style={styles.itemContainer}>
        <ScrollView>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Wishlist")}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome name="heart" solid size={24} color="red" />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{i18next.t("Wishlist")}</Text>
              </View>
            </View>
            <FontAwesome name="arrow-right" size={24} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Contact")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome name="circle-info" size={24} color="#3b5998" />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{i18next.t("Contact")}</Text>
              </View>
            </View>
            <FontAwesome name="arrow-right" size={24} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={handleDeleteAccount}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome name="user-minus" size={24} color="#000" />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{i18next.t("Delete Account")}</Text>
              </View>
            </View>
            <FontAwesome name="arrow-right" size={24} style={styles.arrowIcon} />
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  //Guest
  backgroundGuest: {
    flex: 1,
    resizeMode: "cover", // Để ảnh nền tự động điều chỉnh theo màn hình
    justifyContent: "center",
    alignItems: "center",
  },
  // container: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "#fff",
  //   padding: 20,
  // },
  titleGuest: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 20,
    marginBottom: 5,
  },
  subtitleGuest: {
    fontSize: 16,
    color: "white",
    marginBottom: 5,
  },
  loginBtnGuest: {
    backgroundColor: "#343A40",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  brandView: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  languageBtnGuest: {
    position: "absolute", // Đặt nút ở góc phải
    top: 30, // Khoảng cách từ trên xuống (điều chỉnh tùy thiết kế)
    right: 5, // Khoảng cách từ phải sang
    width: 50, // Chiều rộng nút
    height: 50, // Chiều cao nút
    borderRadius: 25, // Bo tròn thành hình tròn (bằng 50% width/height)
    justifyContent: "center", // Căn giữa icon theo chiều dọc
    alignItems: "center", // Căn giữa icon theo chiều ngang
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },

  //User ViewView
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    width: "100%",
    height: 500,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 100,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: "#fff",
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: "#fff",
  },
  centerContainer: {
    position: "absolute", // Đặt giữa ImageBackground và phần dưới
    top: 480, // Tùy chỉnh vị trí từ trên xuống
    left: 0,
    right: 0,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#212529",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: "flex-start",
    marginBottom: 10,
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  followText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    // marginVertical: 10,
  },
  iconButton: {
    backgroundColor: "#6C757D", // Màu nền cho nút
    width: 40, // Chiều rộng của hình tròn
    height: 40, // Chiều cao của hình tròn (bằng width)
    borderRadius: 20, // Bán kính tròn (bằng width / 2)
    justifyContent: "center", // Căn giữa nội dung theo chiều dọc
    alignItems: "center", // Căn giữa nội dung theo chiều ngang
    marginHorizontal: 5, // Khoảng cách dưới nút
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Language & Info Button
  languageButton: {
    position: "absolute", // Đặt nút ở góc phải
    top: 30, // Khoảng cách từ trên xuống (điều chỉnh tùy thiết kế)
    right: 5, // Khoảng cách từ phải sang
    width: 50, // Chiều rộng nút
    height: 50, // Chiều cao nút
    borderRadius: 25, // Bo tròn thành hình tròn (bằng 50% width/height)
    justifyContent: "center", // Căn giữa icon theo chiều dọc
    alignItems: "center", // Căn giữa icon theo chiều ngang
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },
  infoButton: {
    position: "absolute", // Đặt nút ở góc phải
    top: 30, // Khoảng cách từ trên xuống (điều chỉnh tùy thiết kế)
    left: 5, // Khoảng cách từ phải sang
    width: 50, // Chiều rộng nút
    height: 50, // Chiều cao nút
    borderRadius: 25, // Bo tròn thành hình tròn (bằng 50% width/height)
    justifyContent: "center", // Căn giữa icon theo chiều dọc
    alignItems: "center", // Căn giữa icon theo chiều ngang
    shadowColor: "#000", // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng bóng trên Android
  },

  // Section item bottom
  itemContainer: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 30,
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Đường phân cách nhẹ giữa các item
  },
  itemContent: {
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
  },
  arrowIcon: {
    color: "#ccc",
  },

});
