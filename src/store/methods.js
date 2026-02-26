import { checkIntimacy } from './intimacy';

// 主要方法实现
export const methods = {
    // 加载小说库
    async loadLibrary(filePath = '/novels_list.json') {
        try {
            const res = await fetch(filePath);
            if (!res.ok) throw new Error('Failed to load library');
            this.novels = await res.json();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // 加载小说
    async loadNovel(id) {
        try {
            const res = await fetch(`/${id}.json`);
            if (!res.ok) throw new Error('Failed to load novel');
            this.currentNovel = await res.json();

            // 初始化亲密关系
            if (this.currentNovel.characters) {
                this.initializeIntimacy(this.currentNovel.id, this.currentNovel.characters);
            }

            // 恢复进度或开始新的
            const saved = this.history[id];
            if (saved) {
                // 逻辑恢复到特定段落...现在只是开始章节
                const chapterIndex = this.currentNovel.chapters.findIndex(c => c.id === saved.chapterId);
                this.startChapter(chapterIndex >= 0 ? chapterIndex : 0);
            } else {
                this.startChapter(0);
            }

            this.view = 'reader';
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // 开始章节
    startChapter(index) {
        const chapter = this.currentNovel.chapters[index];
        if (!chapter) return;
        this.currentChapter = chapter;
        this.messages = [];
        
        // 从第一个段落开始
        const firstPara = chapter.paragraphs[0];
        if (firstPara) this.processParagraph(firstPara);
    },

    // 处理段落
    processParagraph(para) {
        // 更新历史
        if (this.currentNovel) {
            this.history[this.currentNovel.id] = {
                chapterId: this.currentChapter.id,
                paragraphId: para.id
            };
        }

        this.paragraphQueue = [...(para.parts || [])];
        if (para.choices && para.choices.length > 0) {
            this.pendingChoices = para.choices;
        } else {
            this.pendingChoices = [];
        }
        this.processQueue();
    },

    // 处理队列
    processQueue() {
        if (this.paragraphQueue.length === 0) {
            if (this.pendingChoices.length > 0) {
                this.currentChoices = this.pendingChoices;
            } else {
                // 自动下一步或"点击继续"逻辑可以在这里
            }
            this.scrollToBottom();
            return;
        }

        const part = this.paragraphQueue.shift();
        this.isTyping = true;
        this.scrollToBottom();

        // 动态打字速度
        const delay = Math.min(1500, Math.max(800, part.text.length * 30));
        
        setTimeout(() => {
            this.isTyping = false;
            this.messages.push({
                id: Date.now(),
                type: part.type,
                text: part.text,
                speaker: part.speaker,
                isUser: false
            });
            this.scrollToBottom();
            
            // 下一部分
            setTimeout(() => this.processQueue(), 500);
        }, delay);
    },

    // 处理选择
    handleChoice(choice) {
        this.currentChoices = [];
        this.messages.push({
            id: Date.now(),
            type: 'dialogue',
            text: choice.text,
            speaker: '我',
            sourceType: 'choice', // 区分是用户点击的选项还是故事的对话
            isUser: true
        });
        this.scrollToBottom();

        // 检查亲密关系更新
        checkIntimacy(this, choice.id);

        const nextId = choice.nextParagraphs[0];
        const nextPara = this.findParagraph(nextId);
        
        if (nextPara) {
             setTimeout(() => this.processParagraph(nextPara), 800);
        }
    },

    // 查找段落
    findParagraph(id) {
        if (!this.currentChapter) return null;
        const all = [...(this.currentChapter.paragraphs || []), ...(this.currentChapter.extendedParagraphs || [])];
        return all.find(p => p.id === id);
    },
    
    // 滚动到底部
    scrollToBottom() {
        // 触发事件让UI处理滚动
        window.dispatchEvent(new CustomEvent('scroll-bottom'));
    },

    // 显示提示
    showToast(msg) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: msg }));
    },

    // 获取头像
    getAvatar(speakerName) {
        if (!this.currentNovel || !speakerName) return null;
        const character = this.currentNovel.characters.find(c => c.name === speakerName);
        return character ? character.avatar : null;
    },

    // 显示角色资料
    showCharacterProfile(characterId) {
        if (!this.currentNovel) return null;
        const character = this.currentNovel.characters.find(c => c.id === characterId);
        if (!character) return null;

        this.selectedCharacter = character;
        this.showProfileModal = true;
    },

    // 获取角色ID
    getCharacterId(speakerName) {
        if (!this.currentNovel || !speakerName) return null;
        const character = this.currentNovel.characters.find(c => c.name === speakerName);
        return character ? character.id : null;
    },

    // 关闭角色资料
    closeCharacterProfile() {
        this.showProfileModal = false;
        this.selectedCharacter = null;
    }
};

export default methods;