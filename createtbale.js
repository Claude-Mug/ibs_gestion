<<<<<<< HEAD
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// createtbale.js
// Script de création des tables pour PostgreSQL (Aiven)
// Exécutez avec : node createtbale.js

const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Utiliser l'URI complète depuis .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL non définie dans .env');
  process.exit(1);
}

console.log('🔄 Connexion à PostgreSQL...');

// ⚠️ Configuration SSL : accepte le certificat auto-signé d'Aiven
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false // ← C'est la clé !
  }
});

// Découpage des requêtes pour éviter les erreurs de taille
const SQL_QUERIES = [
  // Table clients
  `CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    company VARCHAR(255) DEFAULT NULL,
    tva_number VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // Table products
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'unité',
    tva_rate NUMERIC(5,2) NOT NULL DEFAULT 20.0,
    is_active SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // Table invoices
  `CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    client_id INTEGER NOT NULL,
    tva_rate NUMERIC(5,2) NOT NULL DEFAULT 20.0,
    status VARCHAR(20) NOT NULL DEFAULT 'impayée',
    payment_terms VARCHAR(255) NOT NULL DEFAULT 'Paiement sous 30 jours',
    notes TEXT DEFAULT NULL,
    signature_image_path VARCHAR(500) DEFAULT NULL,
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    currency_symbol VARCHAR(10) NOT NULL DEFAULT 'CDF',
    invoice_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('payée', 'impayée', 'partielle'))
  );`,

  // Table invoice_items
  `CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1.0,
    unit_price NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'unité',
    tva_rate NUMERIC(5,2) NOT NULL DEFAULT 20.0,
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
  );`,

  // Index
  `CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);`,
  `CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);`,
  `CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);`,
];

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL (Aiven)');

    console.log('🔄 Création des tables...');
    for (const sql of SQL_QUERIES) {
      try {
        await client.query(sql);
        const short = sql.replace(/\n/g, ' ').substring(0, 60);
        console.log(`   ✅ ${short}...`);
      } catch (err) {
        // Ignorer les "relation exists" (IF NOT EXISTS)
        if (!err.message.includes('already exists')) {
          console.error(`   ❌ Erreur : ${err.message}`);
        }
      }
    }

    // Vérification des tables
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('📋 Tables créées :');
    res.rows.forEach(row => console.log(`   - ${row.table_name}`));

    await client.end();
    console.log('✅ Script terminé.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    await client.end();
    process.exit(1);
  }
}

=======
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// createtbale.js
// Script de création des tables pour PostgreSQL (Aiven)
// Exécutez avec : node createtbale.js

const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Utiliser l'URI complète depuis .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL non définie dans .env');
  process.exit(1);
}

console.log('🔄 Connexion à PostgreSQL...');

// ⚠️ Configuration SSL : accepte le certificat auto-signé d'Aiven
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false // ← C'est la clé !
  }
});

// Découpage des requêtes pour éviter les erreurs de taille
const SQL_QUERIES = [
  // Table clients
  `CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    company VARCHAR(255) DEFAULT NULL,
    tva_number VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // Table products
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'unité',
    tva_rate NUMERIC(5,2) NOT NULL DEFAULT 20.0,
    is_active SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // Table invoices
  `CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    client_id INTEGER NOT NULL,
    tva_rate NUMERIC(5,2) NOT NULL DEFAULT 20.0,
    status VARCHAR(20) NOT NULL DEFAULT 'impayée',
    payment_terms VARCHAR(255) NOT NULL DEFAULT 'Paiement sous 30 jours',
    notes TEXT DEFAULT NULL,
    signature_image_path VARCHAR(500) DEFAULT NULL,
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    currency_symbol VARCHAR(10) NOT NULL DEFAULT 'CDF',
    invoice_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('payée', 'impayée', 'partielle'))
  );`,

  // Table invoice_items
  `CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1.0,
    unit_price NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'unité',
    tva_rate NUMERIC(5,2) NOT NULL DEFAULT 20.0,
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
  );`,

  // Index
  `CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);`,
  `CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);`,
  `CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);`,
];

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL (Aiven)');

    console.log('🔄 Création des tables...');
    for (const sql of SQL_QUERIES) {
      try {
        await client.query(sql);
        const short = sql.replace(/\n/g, ' ').substring(0, 60);
        console.log(`   ✅ ${short}...`);
      } catch (err) {
        // Ignorer les "relation exists" (IF NOT EXISTS)
        if (!err.message.includes('already exists')) {
          console.error(`   ❌ Erreur : ${err.message}`);
        }
      }
    }

    // Vérification des tables
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('📋 Tables créées :');
    res.rows.forEach(row => console.log(`   - ${row.table_name}`));

    await client.end();
    console.log('✅ Script terminé.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    await client.end();
    process.exit(1);
  }
}

>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
createTables();