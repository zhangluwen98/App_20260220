# 工具使用指南

本文档详细说明 Kira 项目中各个工具的功能、使用方法和参数。

## 目录结构

```
tools/
├── config.js           # 工具配置文件
├── validate-novels.js  # 小说数据验证工具
├── download-images.js  # 图片下载和生成工具
├── utils/              # 通用工具函数
│   └── file-utils.js   # 文件操作工具
├── validators/         # 验证相关工具
│   └── novel-validator.js  # 小说数据验证器
└── image-processors/   # 图片处理工具
    └── image-downloader.js  # 图片下载器
```

## 1. 小说数据验证工具

### 功能说明
验证小说数据的完整性，确保小说文件符合预期的格式和结构。

### 使用方法

```bash
# 运行验证
npm run validate

# 或直接运行
node tools/validate-novels.js
```

### 验证内容
- 小说列表文件是否存在且格式正确
- 小说ID是否唯一
- 小说文件是否存在
- 小说ID与文件名是否匹配
- 小说章节和段落结构是否完整
- 对话中的角色是否在角色列表中定义
- 选择的下一段落ID是否存在
- 检查死胡同（没有选择的段落）

## 2. 图片下载和生成工具

### 功能说明
下载和本地化小说封面及角色头像，为没有图片的小说和角色生成默认图片。

### 使用方法

```bash
# 下载已有图片（从小说数据中的URL下载）
npm run images:download

# 生成新图片（为没有图片的小说和角色）
npm run images:generate

# 或直接运行
node tools/download-images.js download
node tools/download-images.js generate
```

### 参数说明
- `download`：下载模式，从小说数据中的URL下载图片并本地化
- `generate`：生成模式，为没有图片的小说和角色生成默认图片

### 工作流程
1. 读取小说列表文件
2. 处理每个小说的封面和角色头像
3. 下载或生成图片
4. 更新小说数据中的图片路径为本地路径
5. 保存更新后的小说数据

## 3. 通用工具函数

### file-utils.js

#### 功能说明
提供文件操作相关的通用函数。

#### 函数列表

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `ensureDirectory` | 确保目录存在，不存在则创建 | `dirPath` (string)：目录路径 | 无 |
| `readJsonFile` | 读取并解析JSON文件 | `filePath` (string)：文件路径 | 解析后的JSON对象 |
| `writeJsonFile` | 写入JSON文件 | `filePath` (string)：文件路径<br>`data` (object)：要写入的数据 | 无 |
| `fileExists` | 检查文件是否存在 | `filePath` (string)：文件路径 | boolean：是否存在 |
| `getFileExtension` | 获取文件扩展名 | `url` (string)：文件URL或路径 | string：扩展名 |

## 4. 图片处理工具

### image-downloader.js

#### 功能说明
处理图片下载和生成相关的功能。

#### 函数列表

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `downloadImage` | 下载图片并保存到本地（带重试） | `url` (string)：图片URL<br>`filePath` (string)：保存路径<br>`maxRetries` (number)：最大重试次数 | Promise<boolean>：是否下载成功 |
| `getAvatarUrl` | 获取角色头像URL | `characterId` (string)：角色ID | string：头像URL |
| `getCoverUrl` | 获取小说封面URL | `novelId` (string)：小说ID<br>`tags` (array)：小说标签 | string：封面URL |

#### 内置图片库
- **头像**：包含老板、星遥、Kira等角色的默认头像
- **封面**：包含赛博朋克和科幻风格的默认封面

## 5. 小说数据验证器

### novel-validator.js

#### 功能说明
验证小说数据的完整性和一致性。

#### 函数列表

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `validateNovelData` | 验证单个小说数据 | `novel` (object)：小说数据<br>`id` (string)：小说ID | 无（验证失败抛出错误） |
| `validateNovelsList` | 验证小说列表 | `novelsList` (array)：小说列表 | boolean：是否验证成功 |
| `validateAllNovels` | 验证所有小说 | 无 | boolean：是否验证成功 |

## 6. 配置文件

### config.js

#### 功能说明
统一管理工具和应用的路径配置，避免硬编码。

#### 配置结构
- `directories`：目录路径配置
- `files`：文件路径配置
- `resources`：资源路径配置
- `build`：构建配置

#### 使用方法

```javascript
import { CONFIG } from './config';

// 使用配置
const novelsDir = CONFIG.directories.novels;
const coversDir = CONFIG.directories.covers;
```

## 7. 常见问题

### Q: 验证失败怎么办？
A: 查看错误信息，根据提示修复小说数据中的问题。

### Q: 图片下载失败怎么办？
A: 检查网络连接，确保URL正确，或使用 `images:generate` 生成默认图片。

### Q: 如何添加新的小说？
A: 1. 在 `novels` 目录创建新的小说JSON文件
   2. 在 `novels_list.json` 中添加小说条目
   3. 运行 `npm run validate` 验证数据
   4. 运行 `npm run images:generate` 生成图片

## 8. 最佳实践

- 保持小说数据的一致性和完整性
- 使用工具生成和管理图片，避免手动修改路径
- 在修改小说数据后运行验证，确保数据正确
- 定期运行测试，确保工具功能正常
