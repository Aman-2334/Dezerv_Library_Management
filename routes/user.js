const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middleware/authMiddleware');

router.get('/profile/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).populate('borrowed.bookId', 'title description');;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password, ...userProfile } = user.toObject();
        res.status(200).json(userProfile);
    } catch (error) {
        console.error("get user profile error ", error);
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
});

module.exports = router;