#!/usr/bin/env node

/**
 * 测试入口文件
 */

import { spawn } from 'child_process';
import path from 'path';

const testFiles = [
    'test-file-utils.js'
];

console.log('🚀 运行所有测试...\n');

async function runTests() {
    let allPassed = true;
    
    for (const testFile of testFiles) {
        console.log(`📋 运行测试: ${testFile}`);
        
        await new Promise((resolve) => {
            const testPath = path.join('test', testFile);
            const testProcess = spawn('node', [testPath], {
                stdio: 'inherit',
                cwd: process.cwd()
            });
            
            testProcess.on('close', (code) => {
                if (code !== 0) {
                    allPassed = false;
                    console.error(`❌ 测试 ${testFile} 失败`);
                } else {
                    console.log(`✅ 测试 ${testFile} 通过`);
                }
                console.log('');
                resolve();
            });
        });
    }
    
    if (allPassed) {
        console.log('🎉 所有测试通过！');
        process.exit(0);
    } else {
        console.log('💥 部分测试失败');
        process.exit(1);
    }
}

runTests();
