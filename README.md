# Kira: Immersive Interactive Novel Engine

A production-ready, data-driven interactive fiction engine optimized for Cloudflare Pages.

## Features
- **Mobile-First Design**: Mimics modern chat applications for immersive storytelling.
- **Data-Driven**: Entirely powered by static JSON files (no database required).
- **Immersive Reader**: 
  - Dynamic typing speed based on text length and punctuation.
  - Visual feedback for characters.
  - Smooth scrolling and polished UI transitions.
- **Interaction Integrity**:
  - State persistence via localStorage.
  - Input masking to guide user interaction.
  - Dead-end detection in validation pipeline.
- **Emotional Connection**:
  - Intimacy system with toast notifications.
  - Character details and progression tracking.
- **Validation Pipeline**: Built-in tools to ensure novel data integrity before deployment.
- **Cloudflare Ready**: Standardized structure for zero-config deployment.
- **Modular Architecture**: Clean, maintainable codebase with clear separation of concerns.

## Project Structure
```
/kira
├── index.html               # App entry point
├── src/                     # Source code
│   ├── config.js            # Application configuration
│   ├── main.js              # App initialization
│   ├── store/               # State management (modular)
│   │   ├── index.js         # Store main entry
│   │   ├── state.js         # State definitions
│   │   ├── methods.js       # Method implementations
│   │   ├── persistence.js   # Local storage handling
│   │   └── intimacy.js      # Intimacy system
│   └── utils/               # Utilities
│       └── type-writer.js   # Typewriter effect
├── novels/                  # Source novel data
├── public/                  # Static assets & output directory
│   ├── assets/              # Images and other assets
│   │   └── images/          # Image files
│   │       ├── avatars/     # Character avatars
│   │       └── covers/      # Novel covers
│   ├── novels/              # Built novel JSON data
│   └── novels_list.json     # Library index
├── tools/                   # Development tools
│   ├── config.js            # Tool configuration
│   ├── validate-novels.js   # Novel validation entry
│   ├── download-images.js   # Image download/generation entry
│   ├── utils/               # Utility functions
│   │   └── file-utils.js    # File operations
│   ├── validators/          # Validation modules
│   │   └── novel-validator.js # Novel data validator
│   └── image-processors/    # Image processing modules
│       └── image-downloader.js # Image downloader
├── test/                    # Unit tests
│   ├── index.js             # Test runner
│   └── test-file-utils.js   # File utils tests
├── docs/                    # Documentation
│   └── tools-guide.md       # Tools usage guide
└── package.json             # Build configuration
```

## Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start local server:
   ```bash
   npm run dev
   ```
3. Run validation manually:
   ```bash
   npm run validate
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Download/generate images:
   ```bash
   # Download existing images from URLs
   npm run images:download
   
   # Generate default images for novels/characters
   npm run images:generate
   ```

## Deployment
This project is configured for **Cloudflare Pages**.

1. Connect your GitHub repository to Cloudflare Pages.
2. Configure build settings:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Deploy!

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-username/kira)

## Adding Novels
1. Create a new JSON file in `novels/` directory (source data).
2. Follow the schema defined in the existing novel files.
3. Add an entry to `novels_list.json`.
4. Run validation to ensure data integrity:
   ```bash
   npm run validate
   ```
5. Generate images for the new novel:
   ```bash
   npm run images:generate
   ```

## Project Architecture

### Core Modules
- **Store**: Modular state management with separate concerns for state, methods, persistence, and intimacy.
- **Tools**: Modular tooling for validation and image processing.
- **Configuration**: Centralized configuration management to avoid hardcoding.
- **Tests**: Unit tests to ensure tool functionality.

### Key Features
- **Modular Design**: Clear separation of concerns for better maintainability.
- **Data Validation**: Comprehensive validation to ensure novel data integrity.
- **Image Management**: Automated image download and generation.
- **State Persistence**: Local storage integration for progress tracking.
- **Intimacy System**: Character relationship tracking and progression.

## Documentation
- **Tools Guide**: Detailed documentation for all development tools in `docs/tools-guide.md`.
- **Code Structure**: Modular architecture with clear folder organization.
- **Best Practices**: Follow the guidelines in the tools guide for optimal usage.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure functionality
5. Submit a pull request

## License
MIT License - see the LICENSE file for details.
