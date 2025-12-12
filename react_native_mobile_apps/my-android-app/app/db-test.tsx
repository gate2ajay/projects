import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { resetDatabase } from '../services/database/DatabaseService';
import { getAllProducts, insertProduct, Product } from '../services/database/productService';

export default function DbTestPage() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [products, setProducts] = useState<Product[]>([]);

    const handleAddProduct = async () => {
        if (!name || !price || !stock) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await insertProduct(name, parseFloat(price), parseInt(stock, 10));
            Alert.alert('Success', 'Product added successfully');
            setName('');
            setPrice('');
            setStock('');
            handleGetProducts(); // Refresh list
        } catch (error) {
            Alert.alert('Error', 'Failed to add product');
        }
    };

    const handleGetProducts = async () => {
        try {
            const fetchedProducts = await getAllProducts();
            setProducts(fetchedProducts);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch products');
        }
    };

    const handleResetDatabase = async () => {
        Alert.alert(
            'Confirm Reset',
            'Are you sure you want to delete all data? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await resetDatabase();
                            setProducts([]);
                            Alert.alert('Success', 'Database reset successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset database');
                        }
                    },
                },
            ]
        );
    };

    const renderProductItem = ({ item }: { item: Product }) => (
        <View style={styles.row}>
            <Text style={[styles.cell, { flex: 1 }]}>{item.product_id}</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{item.name}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>${item.price.toFixed(2)}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{item.stock_quantity}</Text>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Database Test Page</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Product Name"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Price"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Stock"
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                />
                <Button title="Add Product" onPress={handleAddProduct} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Get Products" onPress={handleGetProducts} />
                <View style={styles.spacer} />
                <Button title="Reset Database" onPress={handleResetDatabase} color="red" />
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.subtitle}>Product List</Text>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerCell, { flex: 1 }]}>ID</Text>
                    <Text style={[styles.headerCell, { flex: 3 }]}>Name</Text>
                    <Text style={[styles.headerCell, { flex: 2 }]}>Price</Text>
                    <Text style={[styles.headerCell, { flex: 2 }]}>Stock</Text>
                </View>
                {products.length === 0 ? (
                    <Text style={styles.emptyText}>No products found.</Text>
                ) : (
                    products.map((item) => (
                        <View key={item.product_id} style={styles.row}>
                            <Text style={[styles.cell, { flex: 1 }]}>{item.product_id}</Text>
                            <Text style={[styles.cell, { flex: 3 }]}>{item.name}</Text>
                            <Text style={[styles.cell, { flex: 2 }]}>${item.price.toFixed(2)}</Text>
                            <Text style={[styles.cell, { flex: 2 }]}>{item.stock_quantity}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#f5f5f5',
        minHeight: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
    },
    inputContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    spacer: {
        width: 10,
    },
    listContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#eee',
        paddingBottom: 5,
        marginBottom: 5,
    },
    headerCell: {
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cell: {
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 10,
    },
});
