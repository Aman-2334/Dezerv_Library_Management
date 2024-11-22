require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const verifyToken = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokens = [];

const createAccessToken = (user) =>
    jwt.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '2d' });

const createRefreshToken = (user) =>
    jwt.sign({ userId: user._id }, refreshTokenSecret, { expiresIn: '14d' });

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            role: role || 'user',
            password: hashedPassword,
            borrowed: [],
        });

        await user.save();
        console.log("User created successfully with id:", user._id);
        return res.redirect(307, '/auth/login');
    } catch (error) {
        console.error("Register user error:", error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch || user.role != role) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);
        refreshTokens.push(refreshToken);

        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("Login user error:", error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.delete('/delete', verifyToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

router.post('/token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }
        const newAccessToken = createAccessToken(user);
        res.json({ accessToken: newAccessToken });
    });
});

module.exports = router;