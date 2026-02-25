export function typeWriter(text, onChar, onComplete) {
    let index = 0;
    const baseSpeed = 30; // ms per char
    
    function type() {
        if (index < text.length) {
            const char = text.charAt(index);
            onChar(text.substring(0, index + 1));
            index++;
            
            // Dynamic speed: slow down for punctuation
            let delay = baseSpeed;
            if (['.', '!', '?', '。', '！', '？'].includes(char)) delay = 400;
            else if ([',', '，'].includes(char)) delay = 200;
            
            setTimeout(type, delay);
        } else {
            onComplete();
        }
    }
    
    type();
}
