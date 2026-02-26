#!/usr/bin/env node

/**
 * 文件工具函数测试
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { ensureDirectory, readJsonFile, writeJsonFile, fileExists, getFileExtension } from '../tools/utils/file-utils.js';

// 测试目录
const testDir = path.join('test', 'temp');

// 测试文件
const testJsonFile = path.join(testDir, 'test.json');
const testJsonData = { name: 'test', value: 123 };

console.log('🧪 测试文件工具函数...');

// 测试 ensureDirectory
console.log('1. 测试 ensureDirectory...');
try {
    ensureDirectory(testDir);
    assert.ok(fs.existsSync(testDir), '目录创建失败');
    console.log('   ✓ 目录创建成功');
} catch (error) {
    console.error('   ✗ 目录创建失败:', error.message);
}

// 测试 writeJsonFile
console.log('2. 测试 writeJsonFile...');
try {
    writeJsonFile(testJsonFile, testJsonData);
    assert.ok(fs.existsSync(testJsonFile), '文件写入失败');
    console.log('   ✓ 文件写入成功');
} catch (error) {
    console.error('   ✗ 文件写入失败:', error.message);
}

// 测试 readJsonFile
console.log('3. 测试 readJsonFile...');
try {
    const data = readJsonFile(testJsonFile);
    assert.deepStrictEqual(data, testJsonData, '数据读取错误');
    console.log('   ✓ 数据读取成功');
} catch (error) {
    console.error('   ✗ 数据读取失败:', error.message);
}

// 测试 fileExists
console.log('4. 测试 fileExists...');
try {
    const exists = fileExists(testJsonFile);
    assert.ok(exists, '文件存在检测失败');
    console.log('   ✓ 文件存在检测成功');
} catch (error) {
    console.error('   ✗ 文件存在检测失败:', error.message);
}

// 测试 getFileExtension
console.log('5. 测试 getFileExtension...');
try {
    const ext1 = getFileExtension('https://example.com/image.jpg');
    assert.strictEqual(ext1, 'jpg', '扩展名提取错误');
    
    const ext2 = getFileExtension('https://example.com/image.png?size=100x100');
    assert.strictEqual(ext2, 'png', '带参数的扩展名提取错误');
    
    const ext3 = getFileExtension('https://example.com/image');
    assert.strictEqual(ext3, 'jpg', '无扩展名默认值错误');
    
    console.log('   ✓ 扩展名提取成功');
} catch (error) {
    console.error('   ✗ 扩展名提取失败:', error.message);
}

// 清理测试文件
console.log('6. 清理测试文件...');
try {
    if (fs.existsSync(testJsonFile)) {
        fs.unlinkSync(testJsonFile);
    }
    if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir, { recursive: true });
    }
    console.log('   ✓ 清理成功');
} catch (error) {
    console.error('   ✗ 清理失败:', error.message);
}

console.log('\n✅ 文件工具函数测试完成！');
