/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '../../docs/legal/newbe-privacy-policy-draft.txt');
const destination = path.resolve(__dirname, '../resources/privacy-policy.json');
const text = fs.readFileSync(source, 'utf8').replace(/^\uFEFF/, '');
if (!text.trim()) throw new Error('Privacy policy source is empty');
fs.writeFileSync(destination, JSON.stringify({ text }, null, 2) + '\n', 'utf8');
console.log('Updated resources/privacy-policy.json from the privacy policy TXT.');
