const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const User = require('../models/user');
const verifyToken = require('../middleware/authMiddleware');

// Get all books
router.get('/all', verifyToken, async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        console.error("Get all books error:", error);
        res.status(500).json({ error: 'Failed to retrieve all books' });
    }
});

// Get a specific book by ID
router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        console.error("Get book by ID error:", error);
        res.status(500).json({ error: 'Failed to retrieve book by ID' });
    }
});

// Add a new book
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { title, description, nonstock, likes, reviews } = req.body;

        const existingBook = await Book.findOne({ title });
        if (existingBook) {
            return res.status(400).json({ error: 'Book with the same title already exists' });
        }

        const book = new Book({ title, description, nonstock, likes, reviews });
        const savedBook = await book.save();
        console.log("Book created successfully with ID:", savedBook._id);
        res.status(201).json(savedBook);
    } catch (error) {
        console.error("Create book error:", error);
        res.status(500).json({ error: 'Adding book failed' });
    }
});

// Update book reviews
router.patch('/review/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { userId, review } = req.body;

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        book.reviews.push({ userId, review });
        await book.save();

        res.status(200).json({ message: 'Review added successfully', book });
    } catch (error) {
        console.error("Add review error:", error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// Like a book
router.patch('/like/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        book.likes.push(userId);
        await book.save();
        return res.status(200).json({ message: 'Book liked successfully', book });
    } catch (error) {
        console.error("Like book error:", error);
        res.status(500).json({ error: 'Failed to like book' });
    }
});

// Unlike a book
router.patch('/unlike/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        book.likes = book.likes.filter((id) => id.toString() !== userId.toString());
        await book.save();
        res.status(200).json({ message: 'Book unliked successfully', book });
    } catch (error) {
        console.error("Like book error:", error);
        res.status(500).json({ error: 'Failed to unlike book' });
    }
});

// Update the stock status of a book
router.patch('/updatestock/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nonstock } = req.body;

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        book.nonstock = nonstock;
        await book.save();

        res.status(200).json({ message: 'Book stock status updated successfully', book });
    } catch (error) {
        console.error("Update stock error:", error);
        res.status(500).json({ error: 'Failed to update book stock status' });
    }
});

// Delete a book
router.delete('/delete/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findByIdAndDelete(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({ message: 'Book deleted successfully', book });
    } catch (error) {
        console.error("Delete book error:", error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Borrow a book
router.patch('/borrow/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { userId, dueDate } = req.body;

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        if (book.nonstock) {
            return res.status(400).json({ error: 'Book is currently out of stock' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        book.nonstock = true;
        await book.save();

        user.borrowed.push({ bookId: id, due: dueDate });
        await user.save();

        res.status(200).json({ message: 'Book borrowed successfully', book, user });
    } catch (error) {
        console.error("Borrow book error:", error);
        res.status(500).json({ error: 'Failed to borrow book' });
    }
});

module.exports = router;