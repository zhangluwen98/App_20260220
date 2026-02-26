import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

export const CONFIG = {
  // 目录路径
  directories: {
    root: rootDir,
    src: path.join(rootDir, 'src'),
    public: path.join(rootDir, 'public'),
    novels: path.join(rootDir, 'novels'),
    publicNovels: path.join(rootDir, 'public', 'novels'),
    assets: path.join(rootDir, 'public', 'assets'),
    images: path.join(rootDir, 'public', 'assets', 'images'),
    covers: path.join(rootDir, 'public', 'assets', 'images', 'covers'),
    avatars: path.join(rootDir, 'public', 'assets', 'images', 'avatars'),
    tools: path.join(rootDir, 'tools')
  },
  
  // 文件路径
  files: {
    novelsList: path.join(rootDir, 'novels_list.json'),
    publicNovelsList: path.join(rootDir, 'public', 'novels_list.json')
  },
  
  // 资源路径（相对路径）
  resources: {
    covers: '/assets/images/covers',
    avatars: '/assets/images/avatars'
  }
};

export default CONFIG;