"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const db_1 = require("../config/db");
// User Registration
const createUser = async (req, res) => {
    try {
        const { user_name, email, password, phone } = req.body;
        if (!user_name || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newUser = { user_name, email, password, phone };
        const query = `
      INSERT INTO users (user_name, email, password, phone)
      VALUES (?, ?, ?, ?)
    `;
        const values = [newUser.user_name, newUser.email, newUser.password, newUser.phone];
        const [result] = await db_1.pool.execute(query, values);
        return res.status(201).json({
            message: 'User created successfully',
            user: { ...newUser, id: result.insertId },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.createUser = createUser;
