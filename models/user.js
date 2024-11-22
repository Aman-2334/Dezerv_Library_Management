const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { 
            type: String, 
            enum: ['user', 'admin'],
            default: 'user' 
        },
        password: { type: String, required: true },
        borrowed: [
            {
                bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
                date: { type: Date, default: Date.now },
                due: { type: Date, required: true },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
