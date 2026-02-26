import { validateAllNovels } from './validators/novel-validator.js';

try {
    validateAllNovels();
} catch (error) {
    console.error('Validation error:', error.message);
    process.exit(1);
}
