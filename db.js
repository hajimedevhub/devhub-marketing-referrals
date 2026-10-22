const { MongoClient } = require('mongodb');

const uri = process.env.DATABASE_URL;
if (!uri) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

const client = new MongoClient(uri);
let db;

async function connectDB() {
  await client.connect();
  db = client.db('devhub'); // uses the database name in the URI

  // Create indexes once, idempotent
  await db.collection('partners').createIndex({ referral_code: 1 }, { unique: true });
  await db.collection('leads').createIndex({ partner_id: 1 });
  await db.collection('clicks').createIndex({ partner_id: 1 });

  console.log('✅ Connected to MongoDB Atlas');
  return db;
}

function getDB() {
  if (!db) throw new Error('DB not connected yet');
  return db;
}

module.exports = { connectDB, getDB };