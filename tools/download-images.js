#!/usr/bin/env node

/**
 * 图片下载和本地化工具
 * 生成贴合剧情的小说封面和角色头像
 * 使用 Unsplash 作为可靠图片来源
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 配置
const CONFIG = {
  coversDir: 'public/assets/images/covers',
  avatarsDir: 'public/assets/images/avatars',
  novelsListPath: 'novels_list.json',
  novelsDir: 'novels'
};

// 符合剧情的 Unsplash 图片 URL
const AVATAR_IMAGES = {
  // 老板 - 市侩维修铺老板
  'boss': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop&h=200',
  // 星遥 - 温柔仿生人
  'xingyao': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop&h=200',
  // Kira - AI 实体
  'kira': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop&h=200',
  // 备用头像
  'default-1': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop&h=200',
  'default-2': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop&h=200',
  'default-3': 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop&h=200',
};

const COVER_IMAGES = {
  // 被当做零钱抵给你的抹布仿生人 - 赛博朋克风格
  'broken-android': 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=600&auto=format&fit=crop',
  // Kira: Genesis - 科幻风格
  'kira-genesis': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
  // 备用封面
  'default-cyberpunk': 'https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=600&auto=format&fit=crop',
  'default-scifi': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
};

/**
 * 获取角色头像 URL
 */
function getAvatarUrl(characterId) {
  return AVATAR_IMAGES[characterId] || AVATAR_IMAGES['default-1'];
}

/**
 * 获取小说封面 URL
 */
function getCoverUrl(novelId, tags) {
  if (COVER_IMAGES[novelId]) {
    return COVER_IMAGES[novelId];
  }
  // 根据标签选择合适的封面
  if (tags?.some(t => t.includes('赛博朋克') || t.includes('科幻'))) {
    return COVER_IMAGES['default-cyberpunk'];
  }
  return COVER_IMAGES['default-scifi'];
}

/**
 * 下载图片并保存到本地（带重试）
 */
async function downloadImage(url, filePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // 验证是否是有效图片
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('image/')) {
        throw new Error(`Not an image: ${contentType}`);
      }

      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);

      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 保存文件
      fs.writeFileSync(filePath, uint8Array);

      console.log(`✓ Downloaded: ${path.basename(filePath)} (${(uint8Array.length / 1024).toFixed(1)}KB)`);
      return true;

    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`✗ Failed to download ${path.basename(filePath)}: ${error.message}`);
        return false;
      }
      console.log(`⊘ Retry ${attempt}/${maxRetries} for ${path.basename(filePath)}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

/**
 * 获取文件扩展名
 */
function getExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

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

    const ext = getExtension(novel.cover);
    const fileName = `${novel.id}.${ext}`;
    const filePath = path.join(rootDir, CONFIG.coversDir, fileName);
    const localPath = `/assets/images/covers/${fileName}`;

    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
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
    const ext = getExtension(novel.cover);
    const fileName = `${novel.id}.${ext}`;
    const filePath = path.join(rootDir, CONFIG.coversDir, fileName);
    const localPath = `/assets/images/covers/${fileName}`;

    if (!fs.existsSync(filePath)) {
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

      const ext = getExtension(character.avatar);
      const fileName = `${character.id}.${ext}`;
      const filePath = path.join(rootDir, CONFIG.avatarsDir, fileName);
      const localPath = `/assets/images/avatars/${fileName}`;

      if (fs.existsSync(filePath)) {
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
    const novelFilePath = path.join(rootDir, CONFIG.novelsDir, `${novel.id}.json`);

    if (!fs.existsSync(novelFilePath)) {
      console.log(`⊘ Skipping ${novel.id}: Novel file not found`);
      continue;
    }

    const novelData = JSON.parse(fs.readFileSync(novelFilePath, 'utf-8'));

    // 检查是否需要生成封面
    const ext = 'jpg';
    const coverFileName = `${novel.id}.${ext}`;
    const coverFilePath = path.join(rootDir, CONFIG.coversDir, coverFileName);

    if (!fs.existsSync(coverFilePath)) {
      const coverUrl = getCoverUrl(novel.id, novel.tags);
      console.log(`Generating cover for ${novel.id}...`);
      const success = await downloadImage(coverUrl, coverFilePath);
      if (success) {
        novel.cover = `/assets/images/covers/${coverFileName}`;
      }
    } else {
      novel.cover = `/assets/images/covers/${coverFileName}`;
    }

    // 为每个角色生成头像
    if (novelData.characters) {
      for (const character of novelData.characters) {
        const avatarFileName = `${character.id}.jpg`;
        const avatarFilePath = path.join(rootDir, CONFIG.avatarsDir, avatarFileName);

        // 如果文件已存在但很小（可能是失败的下载），重新生成
        if (fs.existsSync(avatarFilePath)) {
          const stats = fs.statSync(avatarFilePath);
          if (stats.size < 1000) {
            console.log(`Regenerating ${character.name} (file too small)...`);
            fs.unlinkSync(avatarFilePath);
          }
        }

        if (!fs.existsSync(avatarFilePath)) {
          const avatarUrl = getAvatarUrl(character.id);
          console.log(`Generating avatar for ${character.name}...`);
          const success = await downloadImage(avatarUrl, avatarFilePath);
          if (success) {
            character.avatar = `/assets/images/avatars/${avatarFileName}`;
          }
        } else {
          character.avatar = `/assets/images/avatars/${avatarFileName}`;
        }
      }
    }

    // 保存更新后的小说文件
    fs.writeFileSync(novelFilePath, JSON.stringify(novelData, null, 2));
    console.log(`✓ Updated ${novel.id}.json`);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'download'; // 'download' 或 'generate'

  console.log('🖼️  Image Downloader & Generator\n');

  // 读取小说列表
  const novelsListPath = path.join(rootDir, CONFIG.novelsListPath);
  let novelsList = JSON.parse(fs.readFileSync(novelsListPath, 'utf-8'));

  if (mode === 'download') {
    // 下载已有图片
    novelsList = await processNovelList(novelsList);

    // 处理每个小说文件
    for (const novel of novelsList) {
      const novelFilePath = path.join(rootDir, CONFIG.novelsDir, `${novel.id}.json`);

      if (fs.existsSync(novelFilePath)) {
        const novelData = JSON.parse(fs.readFileSync(novelFilePath, 'utf-8'));
        const modified = await processNovelFile(novelData);

        if (modified) {
          fs.writeFileSync(novelFilePath, JSON.stringify(novelData, null, 2));
          console.log(`✓ Updated ${novel.id}.json`);
        }
      }
    }

    // 保存更新后的小说列表
    fs.writeFileSync(novelsListPath, JSON.stringify(novelsList, null, 2));
    console.log('\n✓ novels_list.json updated');

  } else if (mode === 'generate') {
    // 生成新图片
    await generateImages(novelsList);

    // 保存更新后的小说列表
    fs.writeFileSync(novelsListPath, JSON.stringify(novelsList, null, 2));
    console.log('\n✓ novels_list.json updated');
  }

  console.log('\n✅ Done!\n');
}

main().catch(console.error);
