import express from 'express';
import { getRawMaterialsCollection } from '../src/db.js';

const router = express.Router();

function normalizeMaterial(document) {
    const stock = Number(document.stock) || 0;
    const reorderLevel = Number(document.reorderLevel) || 0;
    const state = stock < reorderLevel ? 'Reorder' : 'Healthy';

    return {
        id: document._id?.toString(),
        materialId: document.materialId,
        item: document.name,
        stock: stock,
        reorder: reorderLevel,
        state: state,
        createdAt: document.createdAt,
    };
}

router.get('/', async (req, res) => {
    try {
        const materials = await getRawMaterialsCollection();
        const documents = await materials.find({}, { sort: { createdAt: -1 } }).toArray();
        res.json(documents.map(normalizeMaterial));
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch raw materials' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { materialId, name, stock, reorderLevel } = req.body;

        if (!materialId || !name || stock === undefined || reorderLevel === undefined) {
            return res.status(400).json({ error: 'Material ID, name, stock, and reorder level are required' });
        }

        const materials = await getRawMaterialsCollection();
        const existingMaterial = await materials.findOne({ materialId: materialId.trim() });

        if (existingMaterial) {
            return res.status(409).json({ error: 'Material ID already exists' });
        }

        const document = {
            materialId: materialId.trim(),
            name: name.trim(),
            stock: Number(stock),
            reorderLevel: Number(reorderLevel),
            createdAt: new Date(),
        };

        const result = await materials.insertOne(document);
        res.status(201).json({
            message: 'Raw material added successfully',
            material: normalizeMaterial({ ...document, _id: result.insertedId }),
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to add raw material' });
    }
});

export default router;
