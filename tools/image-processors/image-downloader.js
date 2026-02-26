import fs from 'fs';
import path from 'path';
import { ensureDirectory } from '../utils/file-utils.js';

/**
 * 下载图片并保存到本地（带重试）
 * @param {string} url - 图片URL
 * @param {string} filePath - 保存路径
 * @param {number} maxRetries - 最大重试次数
 * @returns {Promise<boolean>} 是否下载成功
 */
export async function downloadImage(url, filePath, maxRetries = 3) {
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
            ensureDirectory(path.dirname(filePath));

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
 * 符合剧情的 Unsplash 图片 URL
 */
export const AVATAR_IMAGES = {
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

export const COVER_IMAGES = {
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
 * @param {string} characterId - 角色ID
 * @returns {string} 头像URL
 */
export function getAvatarUrl(characterId) {
  return AVATAR_IMAGES[characterId] || AVATAR_IMAGES['default-1'];
}

/**
 * 获取小说封面 URL
 * @param {string} novelId - 小说ID
 * @param {Array<string>} tags - 小说标签
 * @returns {string} 封面URL
 */
export function getCoverUrl(novelId, tags) {
  if (COVER_IMAGES[novelId]) {
    return COVER_IMAGES[novelId];
  }
  // 根据标签选择合适的封面
  if (tags?.some(t => t.includes('赛博朋克') || t.includes('科幻'))) {
    return COVER_IMAGES['default-cyberpunk'];
  }
  return COVER_IMAGES['default-scifi'];
}

export default {
    downloadImage,
    getAvatarUrl,
    getCoverUrl,
    AVATAR_IMAGES,
    COVER_IMAGES
};