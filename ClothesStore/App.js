import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, Text, Dimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Toast from "react-native-toast-message";

// import { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseConfig";

// Account page
import Login from "./views/account/Login";
import SignUp from "./views/account/SignUp";
import User from "./views/account/User";

// Store page
import Home from "./views/store/Home";
import Cart from "./views/store/Cart";
import Detail from "./views/store/Detail";
import Payment from "./views/store/Payment";
import Purchase from "./views/store/Purchase";

// Setting page
import Profile from "./views/setting/Profile";
import Language from "./views/setting/Language";

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

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#ebf2f2",
          height: 60,
          justifyContent: "center",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
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
              <Image
                source={require("./assets/icons/house.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? "#3b82f6" : "#94a3b8",
                }}
              />
              <Text
                style={{
                  color: focused ? "#3b82f6" : "#94a3b8",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                Home
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
              <Image
                source={require("./assets/icons/shopping-cart.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? "#3b82f6" : "#94a3b8",
                }}
              />
              <Text
                style={{
                  color: focused ? "#3b82f6" : "#94a3b8",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                Cart
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
              <Image
                source={require("./assets/icons/Purchase2.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? "#3b82f6" : "#94a3b8",
                }}
              />
              <Text
                style={{
                  color: focused ? "#3b82f6" : "#94a3b8",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                Purchase
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
              <Image
                source={require("./assets/icons/user.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? "#3b82f6" : "#94a3b8",
                }}
              />
              <Text
                style={{
                  color: focused ? "#3b82f6" : "#94a3b8",
                  fontSize: 12,
                  width: 70,
                  textAlign: "center",
                }}
              >
                User
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
        name="Cart"
        component={Cart}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen
        name="Profile"
        component={Profile}
        initialParams={{ userId: safeUserId }}
      />
      <InsideStack.Screen name="Detail" component={Detail} />
      <InsideStack.Screen name="Language" component={Language} />
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
                options={{ headerShown: false }}
                initialParams={{ userId: user.uid || "guest" }} // Truyền userId từ user.uid
              />
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
});
