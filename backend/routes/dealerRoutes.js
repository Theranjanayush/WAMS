import express from 'express';
import { getDealersCollection } from '../src/db.js';

const router = express.Router();

function normalizeDealer(document) {
    return {
        id: document._id?.toString(),
        dealerId: document.dealerId,
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
        const dealers = await getDealersCollection();
        const documents = await dealers.find({}, { sort: { createdAt: -1 } }).toArray();
        res.json(documents.map(normalizeDealer));
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch dealers' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { dealerId, name, companyId, city, contactDetails } = req.body;

        if (!dealerId || !name || !companyId || !city || !contactDetails) {
            return res.status(400).json({ error: 'Dealer ID, name, company ID, city, and contact details are required' });
        }

        const dealers = await getDealersCollection();
        const existingDealer = await dealers.findOne({
            $or: [{ dealerId: dealerId.trim() }, { companyId: companyId.trim() }],
        });

        if (existingDealer) {
            return res.status(409).json({ error: 'Dealer ID or company ID already exists' });
        }

        const document = {
            dealerId: dealerId.trim(),
            name: name.trim(),
            companyId: companyId.trim(),
            city: city.trim(),
            contactDetails: contactDetails.trim(),
            status: 'Onboarded',
            createdAt: new Date(),
        };

        const result = await dealers.insertOne(document);
        res.status(201).json({
            message: 'Dealer added successfully',
            dealer: normalizeDealer({ ...document, _id: result.insertedId }),
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to add dealer' });
    }
});

export default router;
