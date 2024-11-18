import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, Text, Dimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// import { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseConfig";

// Account page
import Login from "./views/account/Login";
import SignUp from "./views/account/SignUp";
import User from "./views/account/User";

// Store page
import Home from "./views/store/Home";
import Card from "./views/store/Card";
import Detail from "./views/store/Detail";

// ========= Inital ========= //

// Navigation
const Stack = createStackNavigator();
const InsideStack = createStackNavigator();

//Bottom Navigation
const Tab = createBottomTabNavigator();

// ========= Function ========= //

//Buttom tab
function TabNavigator() {
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
                marginTop: 14 
              }}
            >
              <Image
                source={require("./assets/icons/home.png")}
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
        name="Card"
        component={Card}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                marginTop: 14
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
                Card
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={User}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                marginTop: 14
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
function InsideLayout() {
  return (
    <InsideStack.Navigator screenOptions={{ headerShown: false }}>
      <InsideStack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <InsideStack.Screen name="Detail" component={Detail}/>
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      // console.log("user ", user);
      setUser(user);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {user ? (
          <Stack.Screen
            name="Inside"
            component={InsideLayout}
            options={{ headerShown: false }}
          />
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
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
