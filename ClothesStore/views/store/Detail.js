import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function Detail({ route }) {
  const { product } = route.params; // Nhận dữ liệu từ màn hình trước

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.images[0] }} style={styles.image} />
      <Text style={styles.name}>{product.productName}</Text>
      <Text style={styles.price}>
        {parseInt(product.price).toLocaleString('vi-VN')} {product.priceUnit}
      </Text>
      <Text style={styles.description}>{product.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: 'green',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
});
