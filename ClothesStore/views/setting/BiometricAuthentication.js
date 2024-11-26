import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function BiometricAuthentication({ route, navigation }) {
    const { userId } = route.params || {}; // Lấy userId từ route params
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // State để lưu thông tin người dùng hiện tại

    useEffect(() => {
        // Đọc thông tin người dùng từ AsyncStorage khi trang được render
        const getUserInfo = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setCurrentUser(storedUserId); // Lưu vào state
                }
            } catch (error) {
                console.error('Không thể đọc thông tin người dùng từ AsyncStorage', error);
            }
        };

        getUserInfo();
    }, []);

    // Hàm xử lý xác thực vân tay và lưu thông tin
    const handleBiometricLogin = async () => {
        try {
            setLoading(true); // Bật chế độ loading

            // Tiến hành xác thực vân tay
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Xác thực để đăng nhập",
                cancelLabel: "Hủy",
            });

            if (result.success) {
                // Nếu xác thực thành công, lưu thông tin người dùng vào AsyncStorage
                await AsyncStorage.setItem('userId', userId);

                // Hiển thị thông báo thành công
                Toast.show({
                    type: 'success',
                    text1: 'Xác thực thành công!',
                    text2: 'Thông tin tài khoản đã được lưu. Bạn có thể đăng nhập bằng vân tay lần sau.',
                });

                // Chuyển hướng người dùng đến trang chính hoặc màn hình cần thiết
                // navigation.replace('Home'); // Hoặc trang khác mà bạn muốn
            } else {
                // Nếu xác thực thất bại
                Toast.show({
                    type: 'error',
                    text1: 'Xác thực thất bại!',
                    text2: 'Vui lòng thử lại.',
                });
            }
        } catch (error) {
            console.error("Lỗi khi xác thực sinh trắc học: ", error);
            // Hiển thị thông báo lỗi khi có vấn đề xảy ra trong quá trình xác thực
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Đã xảy ra lỗi khi xác thực vân tay.',
            });
        } finally {
            setLoading(false); // Tắt chế độ loading sau khi hoàn tất
        }
    };

    // Hàm xử lý tắt chức năng xác thực vân tay
    const handleDisableBiometricAuthentication = async () => {
        try {
            await AsyncStorage.removeItem('userId'); // Xóa thông tin vân tay khỏi AsyncStorage

            Toast.show({
                type: 'success',
                text1: 'Tắt xác thực vân tay thành công!',
                text2: 'Tài khoản sẽ không còn sử dụng xác thực vân tay nữa.',
            });

            // Chuyển hướng người dùng về trang đăng nhập hoặc một trang khác
            // navigation.replace('Login'); // Thay đổi trang tùy theo ứng dụng của bạn
        } catch (error) {
            console.error('Lỗi khi tắt xác thực vân tay:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể tắt xác thực vân tay.',
            });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Biometric Authentication</Text>

            {/* Hiển thị thông tin người dùng hiện tại */}
            {currentUser ? (
                <Text style={styles.info}>Người dùng hiện tại: {currentUser}</Text>
            ) : (
                <Text style={styles.info}>Chưa có người dùng đăng nhập</Text>
            )}

            {/* Nút xác thực vân tay */}
            <TouchableOpacity
                style={styles.authButton}
                onPress={handleBiometricLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Đang xác thực..." : "Xác thực bằng vân tay"}
                </Text>
            </TouchableOpacity>

            {/* Nút tắt chức năng xác thực vân tay */}
            <TouchableOpacity
                style={styles.disableButton}
                onPress={handleDisableBiometricAuthentication}
            >
                <Text style={styles.buttonText}>Tắt xác thực vân tay</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    info: {
        fontSize: 18,
        marginBottom: 20,
    },
    authButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 10,
    },
    disableButton: {
        backgroundColor: '#f44336',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
