import { getDBConnection } from './db';

export interface Product {
    product_id: number;
    name: string;
    price: number;
    stock_quantity: number;
    description?: string;
}

export const insertProduct = async (name: string, price: number, stock: number, description: string = '') => {
    const db = await getDBConnection();
    try {
        const result = await db.runAsync(
            'INSERT INTO products (name, price, stock_quantity, description) VALUES (?, ?, ?, ?)',
            name,
            price,
            stock,
            description
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('Error inserting product:', error);
        throw error;
    }
};

export const getAllProducts = async (): Promise<Product[]> => {
    const db = await getDBConnection();
    try {
        const allRows = await db.getAllAsync('SELECT * FROM products ORDER BY created_at DESC');
        return allRows as Product[];
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};
