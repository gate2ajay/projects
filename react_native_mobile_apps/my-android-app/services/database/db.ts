import * as SQLite from 'expo-sqlite';

export const getDBConnection = async () => {
    return await SQLite.openDatabaseAsync('ecommerce_app.db');
};
