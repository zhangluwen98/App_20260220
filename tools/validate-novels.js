import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const novelsDir = path.join(__dirname, '../public/novels');
const novelsListFile = path.join(__dirname, '../public/novels_list.json');

function validateNovels() {
    console.log('Validating novels...');
    
    // Check novels list
    if (!fs.existsSync(novelsListFile)) {
        console.error('Error: novels_list.json not found!');
        process.exit(1);
    }
    
    let novelsList;
    try {
        novelsList = JSON.parse(fs.readFileSync(novelsListFile, 'utf8'));
    } catch (e) {
        console.error('Error parsing novels_list.json:', e);
        process.exit(1);
    }

    if (!Array.isArray(novelsList)) {
        console.error('Error: novels_list.json must be an array.');
        process.exit(1);
    }

    // Check individual novels
    const novelIds = new Set();
    
    for (const novelMeta of novelsList) {
        if (!novelMeta.id) {
             console.error('Error: Novel in list missing ID:', novelMeta);
             process.exit(1);
        }
        if (novelIds.has(novelMeta.id)) {
            console.error('Error: Duplicate novel ID in list:', novelMeta.id);
            process.exit(1);
        }
        novelIds.add(novelMeta.id);

        const novelFile = path.join(novelsDir, `${novelMeta.id}.json`);
        if (!fs.existsSync(novelFile)) {
            console.error(`Error: Novel file not found for ID ${novelMeta.id}: ${novelFile}`);
            process.exit(1);
        }

        try {
            const novelData = JSON.parse(fs.readFileSync(novelFile, 'utf8'));
            validateNovelData(novelData, novelMeta.id);
        } catch (e) {
             console.error(`Error validating novel ${novelMeta.id}:`, e);
             process.exit(1);
        }
    }
    
    console.log('All novels validated successfully!');
}

function validateNovelData(novel, id) {
    if (novel.id !== id) {
        throw new Error(`Novel ID mismatch inside file. Expected ${id}, got ${novel.id}`);
    }
    if (!novel.chapters || !Array.isArray(novel.chapters)) {
        throw new Error('Novel missing chapters array.');
    }

    const paragraphIds = new Set();
    const allParagraphs = [];

    novel.chapters.forEach((chapter, cIdx) => {
        if (!chapter.paragraphs) return;
        chapter.paragraphs.forEach(p => {
            if (!p.id) throw new Error(`Paragraph in chapter ${cIdx} missing ID.`);
            if (paragraphIds.has(p.id)) throw new Error(`Duplicate paragraph ID: ${p.id}`);
            paragraphIds.add(p.id);
            allParagraphs.push(p);
        });
        if (chapter.extendedParagraphs) {
            chapter.extendedParagraphs.forEach(p => {
                 if (!p.id) throw new Error(`Extended paragraph in chapter ${cIdx} missing ID.`);
                 if (paragraphIds.has(p.id)) throw new Error(`Duplicate paragraph ID: ${p.id}`);
                 paragraphIds.add(p.id);
                 allParagraphs.push(p);
            });
        }
    });

    // Validate choices nextParagraphs
    allParagraphs.forEach(p => {
        if (p.choices) {
            p.choices.forEach(c => {
                if (!c.nextParagraphs || !Array.isArray(c.nextParagraphs)) {
                     throw new Error(`Choice ${c.id} missing nextParagraphs array.`);
                }
                c.nextParagraphs.forEach(nextId => {
                    if (!paragraphIds.has(nextId)) {
                        throw new Error(`Choice ${c.id} points to non-existent paragraph ID: ${nextId}`);
                    }
                });
            });
        }
    });
}

validateNovels();
