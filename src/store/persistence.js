import Alpine from 'alpinejs';

// 本地存储键名
const STORAGE_KEYS = {
    HISTORY: 'kira_history',
    RELATIONSHIP_HISTORY: 'kira_relationship_history'
};

// 从本地存储加载数据
export function loadFromStorage() {
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const savedRelHistory = localStorage.getItem(STORAGE_KEYS.RELATIONSHIP_HISTORY);
    
    return {
        history: savedHistory ? JSON.parse(savedHistory) : {},
        relationshipHistory: savedRelHistory ? JSON.parse(savedRelHistory) : {}
    };
}

// 设置存储监听器
export function setupStorageListeners(store) {
    // 监听history变化
    Alpine.effect(() => {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(store.history));
    });
    
    // 监听relationshipHistory变化
    Alpine.effect(() => {
        localStorage.setItem(STORAGE_KEYS.RELATIONSHIP_HISTORY, JSON.stringify(store.relationshipHistory));
    });
}

export default {
    loadFromStorage,
    setupStorageListeners
};