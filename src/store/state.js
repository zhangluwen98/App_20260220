// 初始状态定义
export const initialState = {
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
    showProfileModal: false
};

export default initialState;