import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, Text, Dimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import i18next from "./services/i18next";
import FontAwesome from "react-native-vector-icons/FontAwesome6";

// import { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseConfig";

// Account page
import Login from "./views/account/Login";
import SignUp from "./views/account/SignUp";
import ForgotPassword from "./views/account/ForgotPassword";
import User from "./views/account/User";

// Store page
import Home from "./views/store/Home";
import Cart from "./views/store/Cart";
import Detail from "./views/store/Detail";
import Payment from "./views/store/Payment";
import Purchase from "./views/store/Purchase";
import EditRecipient from "./views/store/EditRecipient";
import Wishlist from "./views/store/Wishlist";

// Scanner
import Scanner from "./views/scanner/Scanner";

// Setting page
import Profile from "./views/setting/Profile";
import Language from "./views/setting/Language";
import Contact from "./views/setting/Contact";
import BiometricAuthentication from "./views/setting/BiometricAuthentication";

// ========= Inital ========= //

// Navigation
const Stack = createStackNavigator();
const InsideStack = createStackNavigator();

//Bottom Navigation
const Tab = createBottomTabNavigator();

// ========= Function ========= //

//Buttom tab
function TabNavigator({ route }) {
  const { userId } = route.params || {}; // Nhận userId từ initialParams của InsideLayout
  const safeUserId = userId || "guest"; // Giá trị mặc định là "guest"

  console.log("userId tại App.js: " + safeUserId);

  const [cameraActive, setCameraActive] = useState(false); // Trạng thái camera

  // Hàm tắt camera
  const deactivateCamera = () => {
    console.log("Camera is turned off");
    setCameraActive(false);
  };

  // Hàm bật camera
  const activateCamera = () => {
    console.log("Camera is turned on");
    setCameraActive(true);
  };

  // Sử dụng useFocusEffect để tắt camera khi tab không còn focus
  useFocusEffect(
    React.useCallback(() => {
      // Khi tab được focus, bật camera
      activateCamera();

      // Khi tab không còn focus (unfocus), tắt camera
      return () => {
        deactivateCamera();
      };
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#f9f9f9",
          height: 60,
          justifyContent: "center",
          borderTopStartRadius: 18,
          borderTopEndRadius: 18,
          borderTopColor: "#00000",
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                marginTop: 14,
              }}
            >
              <FontAwesome
                name="house"
                size={22}
                style={{
                  width: 24,
                  height: 24,
                  color: focused ? "#212529" : "#ADB5BD",
                  tintColor: focused ? "#212529" : "#ADB5BD",
                }}
              />
              <Text
                style={{
                  color: focused ? "#212529" : "#ADB5BD",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                {i18next.t("Home")}
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                marginTop: 14,
              }}
            >
              <FontAwesome
                name="cart-shopping"
                size={22}
                style={{
                  width: 24,
                  height: 24,
                  color: focused ? "#212529" : "#ADB5BD",
                  tintColor: focused ? "#212529" : "#ADB5BD",
                }}
              />
              <Text
                style={{
                  color: focused ? "#212529" : "#ADB5BD",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                {i18next.t("Cart")}
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={Scanner}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                marginTop: 14,
              }}
            >
              <FontAwesome
                name="qrcode"
                size={22}
                style={{
                  width: 24,
                  height: 24,
                  color: focused ? "#212529" : "#ADB5BD",
                  tintColor: focused ? "#212529" : "#ADB5BD",
                }}
              />
              <Text
                style={{
                  color: focused ? "#212529" : "#ADB5BD",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                {i18next.t("Scanner")}
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Purchase"
        component={Purchase}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                marginTop: 14,
              }}
            >
              <FontAwesome
                name="bag-shopping"
                size={22}
                style={{
                  width: 24,
                  height: 24,
                  color: focused ? "#212529" : "#ADB5BD",
                  tintColor: focused ? "#212529" : "#ADB5BD",
                }}
              />
              <Text
                style={{
                  color: focused ? "#212529" : "#ADB5BD",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                {i18next.t("Purchase")}
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={User}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                marginTop: 14,
              }}
            >
              <FontAwesome
                name="user"
                solid
                size={22}
                style={{
                  width: 24,
                  height: 24,
                  color: focused ? "#212529" : "#ADB5BD",
                  tintColor: focused ? "#212529" : "#ADB5BD",
                }}
              />
              <Text
                style={{
                  color: focused ? "#212529" : "#ADB5BD",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                {i18next.t("User")}
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Inside views
function InsideLayout({ route }) {
  const { userId } = route.params || {}; // Nhận userId từ App.js
  const safeUserId = userId || "guest"; // Giá trị mặc định là "guest"

  console.log("User ID tại InsideLayout: ", safeUserId);

  return (
    <InsideStack.Navigator screenOptions={{ headerShown: false }}>
      <InsideStack.Screen
        name="TabNavigator"
        options={{ headerShown: false }}
        component={TabNavigator}
        initialParams={{ userId: safeUserId }} // Truyền userId thông qua initialParams
      />
      <InsideStack.Screen
        name="Payment"
        component={Payment}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen
        name="EditRecipient"
        component={EditRecipient}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen
        name="Cart"
        component={Cart}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen
        name="Profile"
        component={Profile}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen
        name="BiometricAuthentication"
        component={BiometricAuthentication}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen
        name="Detail"
        component={Detail}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen
        name="Wishlist"
        component={Wishlist}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen name="Language" component={Language} />
      <InsideStack.Screen name="Contact" component={Contact} />
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      // console.log("user ", currentUser);
      setUser(currentUser);
    });
  }, []);

  return (
    <>
      <Toast />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Inside">
          {user ? (
            <>
              <Stack.Screen
                name="Inside"
                component={InsideLayout}
                options={{
                  headerShown: false,
                  gestureEnabled: false, // Tắt thao tác vuốt quay lại
                }}
                initialParams={{ userId: user.uid }} // Truyền userId từ user.uid
              />
              {/* <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUp}
                options={{ headerShown: false }}
              /> */}
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUp}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPassword}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Inside"
                component={InsideLayout}
                options={{ headerShown: false }}
                initialParams={{ userId: "guest" }} // Giá trị mặc định là "guest"
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomTab: {
    backgroundColor: "#fff",
    height: 60,
    justifyContent: "center",
  },
});
