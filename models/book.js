const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        nonstock: { type: Boolean, default: false },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        reviews: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                review: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Book', BookSchema);
