import { Request, Response } from 'express';
import { pool } from '../config/db';
import { User } from '../interfaces/user.interface';
import bcrypt from 'bcryptjs';
import * as Jwt  from 'jsonwebtoken';
import { sendResetEmail } from '../utils/sendEmail';



//User Registeration
export const createUser = async (req: Request, res: Response) => {
  try {
    const { user_name, email, password, phone } = req.body;


    // Basic check — you can later add more validation
    if (!user_name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }
      

    const hashedPassword = await bcrypt.hash(password, 10); // saltRounds = 10
    
const newUser: User = {
  user_name,
  email,
  password: hashedPassword,
  phone,
};

  

    const query = `
      INSERT INTO users (user_name, email, password, phone)
      VALUES (?, ?, ?, ?)
    `;

const values = [newUser.user_name, newUser.email, newUser.password, newUser.phone];

    const [result] = await pool.execute(query, values);

    res.status(201).json({
      message: 'User created successfully',
      user: { ...newUser, id: (result as any).insertId }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



////Login 

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create token
    const token = Jwt.sign({ id: user.id, email: user.email,  user_name: user.user_name, }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = (rows as any)[0];

    if (!user) return res.status(404).json({ message: 'Email not found' });

    const token = Jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await sendResetEmail(email, resetLink);
    res.status(200).json({ message: 'Reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded: any = Jwt.verify(token, process.env.JWT_SECRET!);
    const hash = await bcrypt.hash(password, 10);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, decoded.id]);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset token error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};
