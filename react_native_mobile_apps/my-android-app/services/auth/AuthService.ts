import { getDBConnection } from '../database/db';

// Mock sending function - in a real app, this would call an API
const sendMockNotification = async (type: 'email' | 'sms', recipient: string, code: string) => {
    const sender = type === 'email' ? 'gate2ajay@yahoo.com' : '2623993001';
    console.log(`[${type.toUpperCase()}] From: ${sender} To: ${recipient} | Code: ${code}`);
    // In a real device, we might use Linking to open SMS/Email app, but for auth codes we usually just send it.
    // For this demo, we will return it so the UI can alert it for testing.
    return code;
};

export const generateAndSendOTP = async (identifier: string, type: 'email' | 'sms') => {
    const db = await getDBConnection();
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins expiry

    try {
        await db.runAsync(
            'INSERT INTO otps (identifier, code, expires_at) VALUES (?, ?, ?)',
            identifier,
            code,
            expiresAt
        );
        return await sendMockNotification(type, identifier, code);
    } catch (error) {
        console.error('Error generating OTP:', error);
        throw error;
    }
};

export const verifyOTP = async (identifier: string, code: string) => {
    const db = await getDBConnection();
    try {
        const result = await db.getAllAsync<{ otp_id: number; expires_at: string }>(
            'SELECT * FROM otps WHERE identifier = ? AND code = ? ORDER BY created_at DESC LIMIT 1',
            identifier,
            code
        );

        if (result.length > 0) {
            const otp = result[0];
            const now = new Date();
            const expires = new Date(otp.expires_at);

            if (now < expires) {
                // Valid OTP, delete it (consume it)
                await db.runAsync('DELETE FROM otps WHERE otp_id = ?', otp.otp_id);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

export const registerUser = async (name: string, email: string, cell: string, password: string) => {
    const db = await getDBConnection();
    try {
        const result = await db.runAsync(
            'INSERT INTO users (name, email, cell_number, password_hash) VALUES (?, ?, ?, ?)',
            name,
            email,
            cell,
            password // In production, hash this password!
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const loginWithPassword = async (identifier: string, password: string) => {
    const db = await getDBConnection();
    try {
        // Check email or cell
        const users = await db.getAllAsync<{ user_id: number; name: string; email: string; cell_number: string }>(
            'SELECT user_id, name, email, cell_number FROM users WHERE (email = ? OR cell_number = ?) AND password_hash = ?',
            identifier,
            identifier,
            password
        );
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const getUserByIdentifier = async (identifier: string) => {
    const db = await getDBConnection();
    try {
        const users = await db.getAllAsync<{ user_id: number; name: string; email: string; cell_number: string }>(
            'SELECT user_id, name, email, cell_number FROM users WHERE email = ? OR cell_number = ?',
            identifier,
            identifier
        );
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};

export const updateUser = async (userId: number, name: string, email: string, cell: string) => {
    const db = await getDBConnection();
    try {
        await db.runAsync(
            'UPDATE users SET name = ?, email = ?, cell_number = ? WHERE user_id = ?',
            name,
            email,
            cell,
            userId
        );
        return { user_id: userId, name, email, cell_number: cell };
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};
