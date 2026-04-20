import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const connectionString = process.env.MongoDB_URI || process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('Missing MongoDB connection string. Set MongoDB_URI or DATABASE_URL in backend/.env.');
}

let client;
let database;

function getDatabaseName() {
    const parsedUrl = new URL(connectionString);
    const databaseName = parsedUrl.pathname.replace(/^\/+/, '');

    if (!databaseName) {
        throw new Error('MongoDB connection string must include a database name.');
    }

    return databaseName;
}

async function connectToDatabase() {
    if (database) {
        return database;
    }

    client = new MongoClient(connectionString);
    await client.connect();
    database = client.db(getDatabaseName());

    return database;
}

async function getUsersCollection() {
    const db = await connectToDatabase();
    return db.collection('User');
}

async function getSuppliersCollection() {
    const db = await connectToDatabase();
    return db.collection('Supplier');
}

async function getDealersCollection() {
    const db = await connectToDatabase();
    return db.collection('Dealer');
}

async function getRawMaterialsCollection() {
    const db = await connectToDatabase();
    return db.collection('RawMaterial');
}

async function getSupplierOrdersCollection() {
    const db = await connectToDatabase();
    return db.collection('SupplierOrder');
}

async function getQuotationsCollection() {
    const db = await connectToDatabase();
    return db.collection('Quotation');
}

async function getDealerOrdersCollection() {
    const db = await connectToDatabase();
    return db.collection('DealerOrder');
}

export { 
    connectToDatabase, getUsersCollection, getSuppliersCollection, 
    getDealersCollection, getRawMaterialsCollection, 
    getSupplierOrdersCollection, getQuotationsCollection, getDealerOrdersCollection 
};
