import Alpine from 'alpinejs';

export default function store() {
    return {
        view: 'home',
        novels: [],
        currentNovel: null,
        currentChapter: null,
        messages: [],
        isTyping: false,
        currentChoices: [],
        paragraphQueue: [],
        intimacy: {}, // { charId: { level, progress } }
        history: {}, // { novelId: { chapterId, paragraphId } }
        relationshipHistory: {}, // { novelId: { charId: { history: [] } } }
        selectedCharacter: null,
        showProfileModal: false,

        init() {
            // Load history from localStorage
            const savedHistory = localStorage.getItem('kira_history');
            if (savedHistory) this.history = JSON.parse(savedHistory);

            // Load relationship history from localStorage
            const savedRelHistory = localStorage.getItem('kira_relationship_history');
            if (savedRelHistory) this.relationshipHistory = JSON.parse(savedRelHistory);

            // Watch for changes to save history
            Alpine.effect(() => {
                localStorage.setItem('kira_history', JSON.stringify(this.history));
            });

            // Watch for changes to save relationship history
            Alpine.effect(() => {
                localStorage.setItem('kira_relationship_history', JSON.stringify(this.relationshipHistory));
            });
        },

        async loadLibrary() {
            try {
                const res = await fetch('/novels_list.json');
                if (!res.ok) throw new Error('Failed to load library');
                this.novels = await res.json();
                return true;
            } catch (e) {
                console.error(e);
                return false;
            }
        },

        async loadNovel(id) {
            try {
                const res = await fetch(`/novels/${id}.json`);
                if (!res.ok) throw new Error('Failed to load novel');
                this.currentNovel = await res.json();

                // Initialize intimacy if not exists
                if (!this.intimacy[id]) this.intimacy[id] = {};
                this.currentNovel.characters.forEach(c => {
                    if (!this.intimacy[id][c.id]) {
                        this.intimacy[id][c.id] = {
                            status: c.intimacy.currentStatus,
                            value: c.intimacy.value || 0
                        };
                    }

                    // Restore relationship history from localStorage
                    if (this.relationshipHistory[id] && this.relationshipHistory[id][c.id]) {
                        c.relationships.history = this.relationshipHistory[id][c.id].history || [];
                        // Also restore current status if saved
                        if (this.relationshipHistory[id][c.id].currentStatus) {
                            c.relationships.current = this.relationshipHistory[id][c.id].currentStatus;
                            c.intimacy.currentStatus = this.relationshipHistory[id][c.id].currentStatus;
                            this.intimacy[id][c.id].status = this.relationshipHistory[id][c.id].currentStatus;
                        }
                    }
                });

                // Restore progress or start new
                const saved = this.history[id];
                if (saved) {
                    // Logic to restore specific paragraph... for now just start chapter
                    // Ideally we should jump to saved.paragraphId
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

        startChapter(index) {
            const chapter = this.currentNovel.chapters[index];
            if (!chapter) return;
            this.currentChapter = chapter;
            this.messages = [];
            
            // Start with first paragraph
            const firstPara = chapter.paragraphs[0];
            if (firstPara) this.processParagraph(firstPara);
        },

        processParagraph(para) {
            // Update history
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

        processQueue() {
            if (this.paragraphQueue.length === 0) {
                if (this.pendingChoices.length > 0) {
                    this.currentChoices = this.pendingChoices;
                } else {
                    // Auto-next or "Tap to continue" logic could go here
                    // For now, if no choices, we might be at a dead end or need auto-next
                }
                this.scrollToBottom();
                return;
            }

            const part = this.paragraphQueue.shift();
            this.isTyping = true;
            this.scrollToBottom();

            // Dynamic typing speed
            // Using a simple timeout for now, can integrate typeWriter util later for finer control
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
                
                // Next part
                setTimeout(() => this.processQueue(), 500);
            }, delay);
        },

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

            // Check intimacy update
            // Logic to check if this choice ID matches any condition in character upgradePath
            this.checkIntimacy(choice.id);

            const nextId = choice.nextParagraphs[0];
            const nextPara = this.findParagraph(nextId);
            
            if (nextPara) {
                 setTimeout(() => this.processParagraph(nextPara), 800);
            }
        },

        checkIntimacy(choiceId) {
            if (!this.currentNovel) return;
            this.currentNovel.characters.forEach(char => {
                const upgradePath = char.intimacy.upgradePath;
                const match = upgradePath.find(u => u.condition && u.condition.type === 'choice' && u.condition.id === choiceId);
                if (match) {
                    const previousStatus = char.relationships.current;
                    const previousIntimacy = char.intimacy.currentStatus;

                    // Upgrade both intimacy status and relationship current status
                    this.intimacy[this.currentNovel.id][char.id].status = match.status;
                    this.intimacy[this.currentNovel.id][char.id].value = match.value || this.intimacy[this.currentNovel.id][char.id].value;

                    // Update character's relationships.current and intimacy.currentStatus
                    char.relationships.current = match.status;
                    char.intimacy.currentStatus = match.status;
                    char.intimacy.value = match.value || char.intimacy.value;

                    // Add to history if status changed
                    if (previousStatus !== match.status) {
                        const historyEntry = {
                            from: previousStatus,
                            to: match.status,
                            description: match.description,
                            type: match.type,
                            timestamp: new Date().toISOString()
                        };
                        char.relationships.history.unshift(historyEntry);

                        // Also save to relationshipHistory for localStorage persistence
                        if (!this.relationshipHistory[this.currentNovel.id]) {
                            this.relationshipHistory[this.currentNovel.id] = {};
                        }
                        if (!this.relationshipHistory[this.currentNovel.id][char.id]) {
                            this.relationshipHistory[this.currentNovel.id][char.id] = {};
                        }
                        this.relationshipHistory[this.currentNovel.id][char.id].history = char.relationships.history;
                        this.relationshipHistory[this.currentNovel.id][char.id].currentStatus = match.status;
                    }

                    // Show different toast based on ending type
                    const toastMessage = match.type === 'sweet'
                        ? `💕 ${char.name}: ${match.status} - ${match.description}`
                        : match.type === 'sad'
                        ? `💔 ${char.name}: ${match.status} - ${match.description}`
                        : `${char.name}: ${match.status} - ${match.description}`;
                    this.showToast(toastMessage);
                }
            });
        },

        findParagraph(id) {
            if (!this.currentChapter) return null;
            const all = [...(this.currentChapter.paragraphs || []), ...(this.currentChapter.extendedParagraphs || [])];
            return all.find(p => p.id === id);
        },
        
        scrollToBottom() {
            // Dispatch event for UI to handle scrolling
            window.dispatchEvent(new CustomEvent('scroll-bottom'));
        },

        showToast(msg) {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: msg }));
        },

        getAvatar(speakerName) {
            if (!this.currentNovel || !speakerName) return null;
            const character = this.currentNovel.characters.find(c => c.name === speakerName);
            return character ? character.avatar : null;
        },

        showCharacterProfile(characterId) {
            if (!this.currentNovel) return null;
            const character = this.currentNovel.characters.find(c => c.id === characterId);
            if (!character) return null;

            this.selectedCharacter = character;
            this.showProfileModal = true;
        },

        getCharacterId(speakerName) {
            if (!this.currentNovel || !speakerName) return null;
            const character = this.currentNovel.characters.find(c => c.name === speakerName);
            return character ? character.id : null;
        },

        closeCharacterProfile() {
            this.showProfileModal = false;
            this.selectedCharacter = null;
        }
    };
}
