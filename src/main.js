import Alpine from 'alpinejs';
import { typeWriter } from './utils/type-writer';
import store from './store';

// Register global store
Alpine.store('app', store());

// Start Alpine
window.Alpine = Alpine;
Alpine.start();

// Custom scroll handling
window.addEventListener('scroll-bottom', () => {
    const container = document.getElementById('chat-container');
    if (container) {
        requestAnimationFrame(() => {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        });
    }
});

// Toast handling
window.addEventListener('show-toast', (e) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-down';
    toast.innerText = e.detail;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
});
