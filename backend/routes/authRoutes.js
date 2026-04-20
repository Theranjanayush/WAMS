import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUsersCollection } from '../src/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const users = await getUsersCollection();
        const user = await users.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id?.toString(), username: user.username, role: user.role, referenceId: user.referenceId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server configuration error or database unreachable' });
    }
});

// Seed an initial Manager for testing (Usually removed in production)
router.post('/seed', async (req, res) => {
    try {
        const users = await getUsersCollection();
        const existingManager = await users.findOne({ username: 'manager' });
        if (existingManager) return res.json({ message: 'Manager already exists' });

        const hashedPassword = await bcrypt.hash('password123', 10);
        await users.insertOne({
            username: 'manager',
            password: hashedPassword,
            role: 'MANAGER',
            createdAt: new Date(),
        });
        res.json({ message: 'Seed successful! Login with manager / password123' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
