const db = require('./db');

async function setup() {
    try {
        console.log('Initializing SQLite Database...');
        // Just run a dummy query to trigger the init Db logic
        await db.query('SELECT 1');
        console.log('Database setup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Database setup failed:', err);
        process.exit(1);
    }
}

setup();
