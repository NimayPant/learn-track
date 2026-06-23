const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
const cleaned = source.replace(/^\s*\/\s*$/gm, '\n--END--\n');
const statements = cleaned
  .split('--END--')
  .map(s => s.trim())
  .filter(s => s.length > 0);
console.log('count', statements.length);
statements.forEach((s, i) => {
  console.log('---', i + 1, 'len', s.length);
  console.log(s.slice(0, 200).replace(/\n/g, '\\n'));
});
