const Database = require("better-sqlite3");

const db = new Database("tasks.db");

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        priority TEXT DEFAULT 'Medium',
        due_date TEXT DEFAULT '',
        completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);


// Migration for an older tasks.db
const columns = db
    .prepare("PRAGMA table_info(tasks)")
    .all()
    .map(column => column.name);

if (!columns.includes("description")) {
    db.exec(`
        ALTER TABLE tasks
        ADD COLUMN description TEXT DEFAULT ''
    `);
}

if (!columns.includes("priority")) {
    db.exec(`
        ALTER TABLE tasks
        ADD COLUMN priority TEXT DEFAULT 'Medium'
    `);
}

if (!columns.includes("due_date")) {
    db.exec(`
        ALTER TABLE tasks
        ADD COLUMN due_date TEXT DEFAULT ''
    `);
}

module.exports = db;