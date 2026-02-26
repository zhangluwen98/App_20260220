#!/usr/bin/env node

/**
 * 图片下载和本地化工具
 * 生成贴合剧情的小说封面和角色头像
 * 使用 Unsplash 作为可靠图片来源
 */

import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';
import { readJsonFile, writeJsonFile, fileExists } from './utils/file-utils.js';
import { downloadImage, getAvatarUrl, getCoverUrl } from './image-processors/image-downloader.js';

/**
 * 处理小说列表中的封面
 */
async function processNovelList(novelsList) {
  console.log('\n=== Processing Novel Covers ===\n');

  for (const novel of novelsList) {
    if (!novel.cover || novel.cover.startsWith('/')) {
      console.log(`⊘ Skipping ${novel.id}: Already local or no cover`);
      continue;
    }

    const ext = getFileExtension(novel.cover);
    const fileName = `${novel.id}.${ext}`;
    const filePath = path.join(CONFIG.directories.covers, fileName);
    const localPath = `${CONFIG.resources.covers}/${fileName}`;

    // 检查文件是否已存在
    if (fileExists(filePath)) {
      console.log(`⊘ Skipping ${novel.id}: File already exists`);
      novel.cover = localPath;
      continue;
    }

    // 下载图片
    const success = await downloadImage(novel.cover, filePath);

    if (success) {
      novel.cover = localPath;
    }
  }

  return novelsList;
}

/**
 * 处理单个小说文件
 */
async function processNovelFile(novel) {
  console.log(`\n=== Processing Novel: ${novel.id} ===\n`);

  let modified = false;

  // 处理封面
  if (novel.cover && !novel.cover.startsWith('/')) {
    const ext = getFileExtension(novel.cover);
    const fileName = `${novel.id}.${ext}`;
    const filePath = path.join(CONFIG.directories.covers, fileName);
    const localPath = `${CONFIG.resources.covers}/${fileName}`;

    if (!fileExists(filePath)) {
      const success = await downloadImage(novel.cover, filePath);
      if (success) {
        novel.cover = localPath;
        modified = true;
      }
    } else {
      novel.cover = localPath;
      modified = true;
    }
  }

  // 处理角色头像
  if (novel.characters) {
    for (const character of novel.characters) {
      if (!character.avatar) continue;

      if (character.avatar.startsWith('/')) {
        console.log(`⊘ Skipping ${character.id}: Already local`);
        continue;
      }

      const ext = getFileExtension(character.avatar);
      const fileName = `${character.id}.${ext}`;
      const filePath = path.join(CONFIG.directories.avatars, fileName);
      const localPath = `${CONFIG.resources.avatars}/${fileName}`;

      if (fileExists(filePath)) {
        console.log(`⊘ Skipping ${character.id}: File already exists`);
        character.avatar = localPath;
        modified = true;
        continue;
      }

      const success = await downloadImage(character.avatar, filePath);

      if (success) {
        character.avatar = localPath;
        modified = true;
      }
    }
  }

  return modified;
}

/**
 * 生成新图片（为没有图片的小说和角色）
 */
async function generateImages(novelsList) {
  console.log('\n=== Generating New Images ===\n');

  for (const novel of novelsList) {
    // 读取小说详情
    const novelFilePath = path.join(CONFIG.directories.novels, `${novel.id}.json`);

    if (!fileExists(novelFilePath)) {
      console.log(`⊘ Skipping ${novel.id}: Novel file not found`);
      continue;
    }

    const novelData = readJsonFile(novelFilePath);

    // 检查是否需要生成封面
    const ext = 'jpg';
    const coverFileName = `${novel.id}.${ext}`;
    const coverFilePath = path.join(CONFIG.directories.covers, coverFileName);

    if (!fileExists(coverFilePath)) {
      const coverUrl = getCoverUrl(novel.id, novel.tags);
      console.log(`Generating cover for ${novel.id}...`);
      const success = await downloadImage(coverUrl, coverFilePath);
      if (success) {
        novel.cover = `${CONFIG.resources.covers}/${coverFileName}`;
      }
    } else {
      novel.cover = `${CONFIG.resources.covers}/${coverFileName}`;
    }

    // 为每个角色生成头像
    if (novelData.characters) {
      for (const character of novelData.characters) {
        const avatarFileName = `${character.id}.jpg`;
        const avatarFilePath = path.join(CONFIG.directories.avatars, avatarFileName);

        // 如果文件已存在但很小（可能是失败的下载），重新生成
        if (fileExists(avatarFilePath)) {
          const stats = fs.statSync(avatarFilePath);
          if (stats.size < 1000) {
            console.log(`Regenerating ${character.name} (file too small)...`);
            fs.unlinkSync(avatarFilePath);
          }
        }

        if (!fileExists(avatarFilePath)) {
          const avatarUrl = getAvatarUrl(character.id);
          console.log(`Generating avatar for ${character.name}...`);
          const success = await downloadImage(avatarUrl, avatarFilePath);
          if (success) {
            character.avatar = `${CONFIG.resources.avatars}/${avatarFileName}`;
          }
        } else {
          character.avatar = `${CONFIG.resources.avatars}/${avatarFileName}`;
        }
      }
    }

    // 保存更新后的小说文件
    writeJsonFile(novelFilePath, novelData);
    console.log(`✓ Updated ${novel.id}.json`);
  }
}

/**
 * 获取文件扩展名
 */
function getFileExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'download'; // 'download' 或 'generate'

  console.log('🖼️  Image Downloader & Generator\n');

  // 读取小说列表
  const novelsListPath = CONFIG.files.novelsList;
  let novelsList = readJsonFile(novelsListPath);

  if (mode === 'download') {
    // 下载已有图片
    novelsList = await processNovelList(novelsList);

    // 处理每个小说文件
    for (const novel of novelsList) {
      const novelFilePath = path.join(CONFIG.directories.novels, `${novel.id}.json`);

      if (fileExists(novelFilePath)) {
        const novelData = readJsonFile(novelFilePath);
        const modified = await processNovelFile(novelData);

        if (modified) {
          writeJsonFile(novelFilePath, novelData);
          console.log(`✓ Updated ${novel.id}.json`);
        }
      }
    }

    // 保存更新后的小说列表
    writeJsonFile(novelsListPath, novelsList);
    console.log('\n✓ novels_list.json updated');

  } else if (mode === 'generate') {
    // 生成新图片
    await generateImages(novelsList);

    // 保存更新后的小说列表
    writeJsonFile(novelsListPath, novelsList);
    console.log('\n✓ novels_list.json updated');
  }

  console.log('\n✅ Done!\n');
}

main().catch(console.error);
