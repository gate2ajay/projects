import { getDBConnection } from './db';
import { createTables } from './schema';

export const initializeDatabase = async () => {
    try {
        const db = await getDBConnection();
        await createTables(db);
        return db;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};

export const resetDatabase = async () => {
    try {
        const db = await getDBConnection();
        await db.execAsync('DROP TABLE IF EXISTS order_items');
        await db.execAsync('DROP TABLE IF EXISTS orders');
        await db.execAsync('DROP TABLE IF EXISTS cart_items');
        await db.execAsync('DROP TABLE IF EXISTS products');
        await db.execAsync('DROP TABLE IF EXISTS users');
        await createTables(db);
        console.log('Database reset successfully');
    } catch (error) {
        console.error('Failed to reset database:', error);
        throw error;
    }
};
