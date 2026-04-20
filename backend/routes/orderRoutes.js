import express from 'express';
import { ObjectId } from 'mongodb';
import { 
    getSupplierOrdersCollection, 
    getQuotationsCollection, 
    getDealerOrdersCollection,
    getSuppliersCollection,
    getDealersCollection
} from '../src/db.js';

const router = express.Router();

// ---- Supplier Orders & Quotations ----

router.post('/supplier', async (req, res) => {
    try {
        const { supplierId, rawMaterialsDescription, quantity } = req.body;

        if (!supplierId || !rawMaterialsDescription || !quantity) {
            return res.status(400).json({ error: 'Supplier ID, raw materials description, and quantity are required' });
        }

        const suppliers = await getSuppliersCollection();
        const supplierObj = await suppliers.findOne({ supplierId });

        if (!supplierObj) {
             return res.status(404).json({ error: 'Supplier not found.' });
        }

        const supplierOrders = await getSupplierOrdersCollection();
        
        const orderDocument = {
            supplierId: supplierId,
            supplierName: supplierObj.name,
            rawMaterials: rawMaterialsDescription,
            quantity: Number(quantity),
            status: 'PENDING',
            createdAt: new Date(),
        };

        const result = await supplierOrders.insertOne(orderDocument);

        // Automatically generate a dummy Quotation based on user feedback
        const quotations = await getQuotationsCollection();
        const dummyAmount = Math.floor(Math.random() * 500000) + 10000;
        
        const quotationDoc = {
            supplierOrderId: result.insertedId.toString(),
            supplierId: supplierId,
            supplierName: supplierObj.name,
            amount: dummyAmount,
            status: 'Pending',
            date: new Date()
        };
        await quotations.insertOne(quotationDoc);

        res.status(201).json({
            message: 'Supplier order placed and mock quotation generated',
            order: { ...orderDocument, _id: result.insertedId }
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to place supplier order' });
    }
});

router.get('/quotations', async (req, res) => {
    try {
        const quotations = await getQuotationsCollection();
        const documents = await quotations.find({}, { sort: { date: -1 } }).toArray();

        res.json(documents.map(doc => ({
            id: doc._id.toString(),
            supplier: doc.supplierName || doc.supplierId,
            amount: `Rs ${(doc.amount).toLocaleString('en-IN')}`,
            date: new Date(doc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: doc.status
        })));
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch quotations' });
    }
});

router.put('/quotations/:id', async (req, res) => {
    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        const quotations = await getQuotationsCollection();
        
        let objectId;
        try {
            objectId = new ObjectId(req.params.id);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        await quotations.updateOne(
            { _id: objectId },
            { $set: { status: status } }
        );

        res.json({ message: `Quotation ${status.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Unable to update quotation status' });
    }
});

// ---- Dealer Billing ----

router.post('/dealer', async (req, res) => {
    try {
        const { dealerId, description, amount } = req.body;

        if (!dealerId || !description || !amount) {
            return res.status(400).json({ error: 'Dealer ID, description, and amount are required' });
        }

        const dealers = await getDealersCollection();
        const dealerObj = await dealers.findOne({ dealerId });

        if (!dealerObj) {
            return res.status(404).json({ error: 'Dealer not found.' });
        }

        const dealerOrders = await getDealerOrdersCollection();

        const billDocument = {
            dealerId: dealerId,
            dealerName: dealerObj.name,
            description: description,
            billAmount: Number(amount),
            status: 'COMPLETED',
            createdAt: new Date(),
        };

        const result = await dealerOrders.insertOne(billDocument);

        res.status(201).json({
            message: 'Dealer bill generated',
            bill: {
                id: result.insertedId.toString(),
                ...billDocument
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to generate bill' });
    }
});

router.get('/dealer', async (req, res) => {
    try {
        const dealerOrders = await getDealerOrdersCollection();
        const documents = await dealerOrders.find({ status: 'COMPLETED' }, { sort: { createdAt: -1 } }).toArray();

        res.json(documents.map(doc => ({
            id: doc._id.toString(),
            dealerId: doc.dealerId,
            dealerName: doc.dealerName,
            description: doc.description,
            amount: doc.billAmount,
            date: doc.createdAt
        })));
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch dealer bills' });
    }
});

export default router;
