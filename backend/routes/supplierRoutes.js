import express from 'express';
import { getSuppliersCollection } from '../src/db.js';

const router = express.Router();

function normalizeSupplier(document) {
    return {
        id: document._id?.toString(),
        supplierId: document.supplierId,
        name: document.name,
        companyId: document.companyId,
        city: document.city,
        contactDetails: document.contactDetails,
        status: document.status,
        createdAt: document.createdAt,
    };
}

router.get('/', async (req, res) => {
    try {
        const suppliers = await getSuppliersCollection();
        const documents = await suppliers.find({}, { sort: { createdAt: -1 } }).toArray();
        res.json(documents.map(normalizeSupplier));
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch suppliers' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { supplierId, name, companyId, city, contactDetails } = req.body;

        if (!supplierId || !name || !companyId || !city || !contactDetails) {
            return res.status(400).json({ error: 'Supplier ID, name, company ID, city, and contact details are required' });
        }

        const suppliers = await getSuppliersCollection();
        const existingSupplier = await suppliers.findOne({
            $or: [{ supplierId: supplierId.trim() }, { companyId: companyId.trim() }],
        });

        if (existingSupplier) {
            return res.status(409).json({ error: 'Supplier ID or company ID already exists' });
        }

        const document = {
            supplierId: supplierId.trim(),
            name: name.trim(),
            companyId: companyId.trim(),
            city: city.trim(),
            contactDetails: contactDetails.trim(),
            status: 'Active',
            createdAt: new Date(),
        };

        const result = await suppliers.insertOne(document);
        res.status(201).json({
            message: 'Supplier added successfully',
            supplier: normalizeSupplier({ ...document, _id: result.insertedId }),
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to add supplier' });
    }
});

export default router;
