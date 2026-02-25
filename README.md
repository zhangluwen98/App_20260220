# Kira: Immersive Interactive Novel Engine

A production-ready, data-driven interactive fiction engine optimized for Cloudflare Pages.

## Features
- **Mobile-First Design**: Mimics modern chat applications for immersive storytelling.
- **Data-Driven**: Entirely powered by static JSON files (no database required).
- **Validation Pipeline**: Built-in tools to ensure novel data integrity before deployment.
- **Cloudflare Ready**: Standardized structure for zero-config deployment.

## Project Structure
```
/kira
├── public/                  # Static assets & output directory
│   ├── novels/              # Novel JSON data
│   └── novels_list.json     # Library index
├── tools/                   # Development tools
│   └── validate-novels.js   # CI/CD validation script
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

## Deployment
This project is configured for **Cloudflare Pages**.

1. Connect your GitHub repository to Cloudflare Pages.
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `public`
3. Deploy!

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-username/kira)

## Adding Novels
1. Create a new JSON file in `public/novels/`.
2. Follow the schema defined in `tools/validate-novels.js`.
3. Add an entry to `public/novels_list.json`.
