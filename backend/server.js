import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import dealerRoutes from './routes/dealerRoutes.js';
import rawMaterialRoutes from './routes/rawMaterialRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { connectToDatabase } from './src/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Route
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/rawMaterials', rawMaterialRoutes);
app.use('/api/orders', orderRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to WAMS API' });
});

// Database Connection Check
app.get('/api/health', async (req, res) => {
    try {
        const db = await connectToDatabase();
        await db.command({ ping: 1 });
        res.json({ status: 'Database connected successfully' });
    } catch (error) {
        res.status(500).json({ status: 'Database connection failed', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app };
