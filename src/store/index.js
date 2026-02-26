import Alpine from 'alpinejs';
import initialState from './state';
import { loadFromStorage, setupStorageListeners } from './persistence';
import { initializeIntimacy } from './intimacy';
import methods from './methods';

export default function store() {
    // 合并初始状态和从存储加载的状态
    const storageData = loadFromStorage();
    const state = {
        ...initialState,
        ...storageData
    };
    
    // 合并方法
    const storeInstance = {
        ...state,
        ...methods,
        initializeIntimacy,
        
        init() {
            // 设置存储监听器
            setupStorageListeners(this);
        }
    };
    
    return storeInstance;
}

export { store };