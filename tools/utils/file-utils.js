import fs from 'fs';
import path from 'path';

// 文件操作工具函数

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
export function ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * 读取JSON文件
 * @param {string} filePath - 文件路径
 * @returns {Object} 解析后的JSON对象
 */
export function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Error reading JSON file ${filePath}: ${error.message}`);
    }
}

/**
 * 写入JSON文件
 * @param {string} filePath - 文件路径
 * @param {Object} data - 要写入的数据
 */
export function writeJsonFile(filePath, data) {
    try {
        ensureDirectory(path.dirname(filePath));
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        throw new Error(`Error writing JSON file ${filePath}: ${error.message}`);
    }
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否存在
 */
export function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * 获取文件扩展名
 * @param {string} url - 文件URL或路径
 * @returns {string} 扩展名
 */
export function getFileExtension(url) {
    const match = url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i);
    return match ? match[1].toLowerCase() : 'jpg';
}

export default {
    ensureDirectory,
    readJsonFile,
    writeJsonFile,
    fileExists,
    getFileExtension
};