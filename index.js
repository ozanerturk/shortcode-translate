

import fs from 'fs';
import path from 'path';
const filePath = path.join(__dirname, 'raw_content.txt');
let content = fs.readFileSync(filePath, 'utf8');

import translate from './translate.js';
const fromLang = 'en';
const toLang = 'tr';

//translate content
translate(content).then(x => {
    fs.writeFileSync('translated_content.txt', x);
});
