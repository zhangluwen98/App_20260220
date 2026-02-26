import { CONFIG } from '../config.js';
import { readJsonFile, fileExists } from '../utils/file-utils.js';

/**
 * 验证小说数据完整性
 * @param {Object} novel - 小说数据
 * @param {string} id - 小说ID
 */
export function validateNovelData(novel, id) {
    if (novel.id !== id) {
        throw new Error(`Novel ID mismatch inside file. Expected ${id}, got ${novel.id}`);
    }
    if (!novel.chapters || !Array.isArray(novel.chapters)) {
        throw new Error('Novel missing chapters array.');
    }

    // 构建角色映射表
    const characterMap = new Map();
    if (novel.characters && Array.isArray(novel.characters)) {
        novel.characters.forEach(char => {
            if (!char.id) {
                throw new Error('Character missing ID.');
            }
            if (!char.name) {
                throw new Error(`Character with ID ${char.id} missing name.`);
            }
            characterMap.set(char.name, char.id);
        });
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

    // 验证所有对话中的角色都在 characters 中定义
    const speakers = new Set();
    allParagraphs.forEach(p => {
        if (p.parts && Array.isArray(p.parts)) {
            p.parts.forEach(part => {
                if (part.type === 'dialogue' && part.speaker) {
                    // "我" 是主角，不需要在 characters 中定义
                    if (part.speaker !== '我') {
                        speakers.add(part.speaker);
                    }
                }
            });
        }
    });

    speakers.forEach(speakerName => {
        if (!characterMap.has(speakerName)) {
            throw new Error(
                `Speaker "${speakerName}" appears in dialogue but is not defined in characters array. ` +
                `Please add this character to the characters section.`
            );
        }
    });

    // 验证选择的nextParagraphs和死胡同
    allParagraphs.forEach(p => {
        if (p.choices && p.choices.length > 0) {
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
        } else {
            // 检查死胡同（没有选择）
            // 如果是线性流程的最后一个段落或明确标记为结束，则允许
            // 但理想情况下，每个段落都应该有出路，除非是"THE END"
        }
    });
}

/**
 * 验证小说列表
 * @param {Array} novelsList - 小说列表
 * @returns {boolean} 是否验证成功
 */
export function validateNovelsList(novelsList) {
    if (!Array.isArray(novelsList)) {
        throw new Error('Error: novels_list.json must be an array.');
    }

    const novelIds = new Set();
    
    for (const novelMeta of novelsList) {
        if (!novelMeta.id) {
             throw new Error('Error: Novel in list missing ID:', novelMeta);
        }
        if (novelIds.has(novelMeta.id)) {
            throw new Error('Error: Duplicate novel ID in list:', novelMeta.id);
        }
        novelIds.add(novelMeta.id);

        const novelFile = CONFIG.directories.publicNovels + `/${novelMeta.id}.json`;
        if (!fileExists(novelFile)) {
            throw new Error(`Error: Novel file not found for ID ${novelMeta.id}: ${novelFile}`);
        }

        try {
            const novelData = readJsonFile(novelFile);
            validateNovelData(novelData, novelMeta.id);
        } catch (e) {
             throw new Error(`Error validating novel ${novelMeta.id}:`, e);
        }
    }
    
    return true;
}

/**
 * 验证所有小说
 * @returns {boolean} 是否验证成功
 */
export function validateAllNovels() {
    console.log('Validating novels...');
    
    // 检查小说列表
    if (!fileExists(CONFIG.files.publicNovelsList)) {
        throw new Error('Error: novels_list.json not found!');
    }
    
    let novelsList;
    try {
        novelsList = readJsonFile(CONFIG.files.publicNovelsList);
    } catch (e) {
        throw new Error('Error parsing novels_list.json:', e);
    }

    validateNovelsList(novelsList);
    
    console.log('All novels validated successfully!');
    return true;
}

export default {
    validateNovelData,
    validateNovelsList,
    validateAllNovels
};