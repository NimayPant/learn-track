const fs = require('fs');
const path = require('path');
const db = require('./oracle');

async function runSetup() {
  try {
    await db.init();
    const sqlFile = path.join(__dirname, 'setup.sql');
    const source = fs.readFileSync(sqlFile, 'utf8');
    const lines = source.split(/\r?\n/);
    const statements = [];
    let buffer = [];
    let inPlsql = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '/') {
        continue;
      }

      if (!inPlsql && /^\s*(BEGIN|CREATE\s+OR\s+REPLACE\s+(TRIGGER|PROCEDURE))/i.test(trimmed)) {
        inPlsql = true;
      }

      buffer.push(line);

      if (inPlsql && /^END;$/i.test(trimmed)) {
        statements.push(buffer.join('\n').trim());
        buffer = [];
        inPlsql = false;
      } else if (!inPlsql && trimmed.endsWith(';')) {
        statements.push(buffer.join('\n').trim());
        buffer = [];
      }
    }

    if (buffer.join('').trim()) {
      statements.push(buffer.join('\n').trim());
    }

    const connection = await db.getConnection();
    try {
      for (const statement of statements) {
        console.log('Executing statement...');
        await connection.execute(statement, {}, { autoCommit: false });
      }
      await connection.commit();
      console.log('Database setup completed successfully.');
    } finally {
      await connection.close();
    }
  } catch (err) {
    console.error('Database setup failed:', err);
    process.exit(1);
  }
}

runSetup();
