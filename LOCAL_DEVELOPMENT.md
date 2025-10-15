# 🛠️ Advanced Feedback Widget - Local Development Guide

**Version**: 1.2.0 - Modern React/TypeScript feedback widget with advanced triggers and animated UI

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### ✅ Working Demos (All Updated)

#### 1. Development Server Demo
```bash
npm install
npm run dev
# Visit http://localhost:3000 - Full React/TypeScript demo
```

#### 2. CDN Demo (Comprehensive Feature Testing)
```bash
python3 -m http.server 8001
# Visit http://localhost:8001/cdn-demo.html
# Features: Rage-click, confused navigation, dataLayer events, animated ratings
```

#### 3. Local Build Testing
```bash
npm run build
cd demo-dist && python3 -m http.server 8000
# Visit http://localhost:8000 - Production build demo
```

**Note:** All demos now work with the latest features including sequential star ratings and advanced triggers.

## Available Commands

### Core Development
- `npm run dev` - Start Vite dev server for demo (port 3000)
- `npm run build` - Build production TypeScript + Vite bundle
- `npm run preview` - Preview production build

### Package Building
- `npm run build:npm` - Build NPM package (CommonJS, ESM, UMD)
- `node build-widget.js` - Build standalone widget versions

### Quality Assurance
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## Demo Pages

### 1. Modern TypeScript Demo (`demo/index.html`) - ⚠️ CURRENTLY BROKEN
**URL:** http://localhost:3000 (when running `npm run dev`)

**Uses:** Attempts to use React/TypeScript SDK (`src/index.ts`)

**Status:** **NOT WORKING PROPERLY**
- The demo tries to use the TypeScript SDK but has configuration issues
- The SDK exists and is sophisticated, but the demo doesn't use it correctly
- Many buttons may not work or show errors in console
- This is a development/integration issue, not a fundamental problem

**Known Issues:**
- Widget creation methods may fail
- Configuration is incomplete for React components
- Missing proper initialization of React app structure

### 2. Simple Standalone Demo (`test.html`)
**Usage:** Open directly in browser or serve via HTTP

**Uses:** Simple standalone widget (`src/widget.js`)

**Features:**
- Basic widget integration example
- Multiple trigger testing (manual, auto, scroll, exit-intent)
- Simple control interface
- Console logging for debugging

**Test Controls:**
- "Show Widget" - Manual trigger
- "Test Auto Trigger" - Shows after 3 seconds
- "Test Scroll Trigger" - Activates after scrolling 200px
- "Test Exit Intent" - Triggers on mouse leave to top

## Widget Integration Methods

### 1. Modern TypeScript SDK (Recommended) - `src/index.ts`
**Used by:** `demo/index.html`

```typescript
// Development import
import feedbackWidget from './src/index.ts';

// Production import (after build)
import feedbackWidget from '@sachin-s-joshi/feedback-widget';

// Initialize widget
feedbackWidget.init({
  id: 'my-feedback-widget',
  position: 'bottom-right',
  triggers: [{ type: 'time', conditions: { timeDelay: 5000 } }],
  fields: [{ type: 'rating', label: 'Rate your experience', required: true }]
});
```

### 2. Simple Standalone Widget - `src/widget.js`
**Used by:** `test.html`

```html
<script>
window.feedbackConfig = {
  position: 'bottom-right',
  trigger: 'manual'
};
</script>
<script src="src/widget.js"></script>
```

### 3. Built Distribution Files
After running `npm run build:npm`:
```html
<!-- UMD Bundle -->
<script src="dist/feedback-widget.min.js"></script>

<!-- ES Module -->
<script type="module">
  import feedbackWidget from './dist/index.esm.js';
</script>
```

## Development Workflow

### 1. Setup
```bash
git clone <repository>
cd aep-services
npm install
```

### 2. Start Development
```bash
# Option A: Modern TypeScript SDK development (recommended)
npm run dev    # Serves demo/index.html at localhost:3000

# Option B: Simple standalone widget testing
# Open test.html directly in browser or serve via:
python -m http.server 8000  # Python
# or
npx serve .  # Node.js
# Then open http://localhost:8000/test.html
```

### 3. Testing Changes

**🟢 TypeScript SDK (demo/index.html):**
- **Live Reload:** Vite dev server automatically reloads on changes
- **Widget Testing:** Use interactive demo buttons to test configurations
- **Console Debugging:** Check browser console for detailed feedback data
- **Configuration Testing:** Use built-in JSON config editor

**🟡 Standalone Widget (test.html):**
- **Manual Refresh:** Refresh browser after changes to `src/widget.js`
- **Simple Controls:** Use basic show/hide/trigger buttons
- **Console Logging:** Basic feedback logging to console
- **Quick Testing:** Fast iteration for simple widget changes

### 4. Building for Production
```bash
# Build everything
npm run build        # TypeScript + Vite
npm run build:npm    # NPM package
node build-widget.js # Standalone versions

# Verify builds
npm run preview      # Test production build
```

## Project Structure

```
├── src/
│   ├── components/          # React components (TypeScript SDK)
│   │   └── FeedbackWidget.tsx
│   ├── core/               # Core functionality (TypeScript SDK)
│   │   ├── FeedbackManager.ts
│   │   ├── DataLayerManager.ts
│   │   └── TriggerManager.ts
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper utilities
│   ├── widget.js           # 🟡 Simple standalone widget (vanilla JS)
│   └── index.ts            # 🟢 Modern TypeScript SDK entry point
├── demo/
│   └── index.html          # 🟢 Uses TypeScript SDK (npm run dev)
├── test.html               # 🟡 Uses standalone widget (basic HTML)
├── dist/                   # Built files (npm run build)
├── vite.config.ts          # Vite configuration (for TypeScript SDK)
├── rollup.config.js        # Rollup configuration (for NPM package)
└── build-widget.js         # Standalone widget build script
```

**Two Different Approaches:**
- 🟢 **TypeScript SDK** (`src/index.ts`) - Modern React-based architecture
- 🟡 **Standalone Widget** (`src/widget.js`) - Simple vanilla JS implementation

## Widget Approaches Comparison

| Feature | 🟢 TypeScript SDK | 🟡 Standalone Widget |
|---------|-------------------|----------------------|
| **File** | `src/index.ts` | `src/widget.js` |
| **Demo** | `demo/index.html` ⚠️ **BROKEN** | `test.html` ✅ **WORKS** |
| **Status** | **Needs integration work** | **Ready to use** |
| **Technology** | React + TypeScript | Vanilla JavaScript |
| **Bundle Size** | ~50KB (with React) | ~15KB (standalone) |
| **Features** | Full-featured SDK (when working) | Basic feedback collection |
| **Configuration** | Complex JSON objects | Simple config object |
| **Triggers** | Advanced (time, scroll, page, exit) | Basic (manual, auto, scroll, exit) |
| **Field Types** | rating, nps, text, email, category | rating, text |
| **Theming** | Advanced theming system | Basic CSS styling |
| **Data Layer** | GA4, Adobe WebSDK integration | Console logging only |
| **Current Usability** | ❌ Demo not working | ✅ Fully functional |
| **Best For** | Future production (needs work) | Immediate use |

## Configuration Options

### 🟢 TypeScript SDK Configuration
```json
{
  "id": "unique-widget-id",
  "position": "bottom-right|bottom-left|top-right|top-left|center",
  "triggers": [
    {
      "type": "time|scroll|page|exit|manual",
      "conditions": {
        "timeDelay": 5000,
        "scrollPercentage": 75,
        "frequency": "session|always"
      }
    }
  ],
  "fields": [
    {
      "type": "rating|nps|text|email|category",
      "label": "Field label",
      "required": true,
      "validation": { "minLength": 10, "maxLength": 500 }
    }
  ],
  "appearance": {
    "theme": "light|dark",
    "colors": {
      "primary": "#007bff",
      "background": "#ffffff"
    }
  },
  "dataLayer": {
    "enabled": true,
    "eventName": "feedback_submitted"
  }
}
```

### 🟡 Standalone Widget Configuration
```javascript
window.feedbackConfig = {
  position: 'bottom-right|bottom-left',
  trigger: 'manual|auto|scroll|exit',
  delay: 3000,                    // for auto trigger
  apiEndpoint: 'https://...'      // optional API endpoint
};
```

## Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Change port in vite.config.ts or:
npm run dev -- --port 3001
```

**Widget not appearing:**
- Check browser console for errors
- Verify script loading order
- Ensure configuration is valid JSON

**Build failures:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
npm run type-check  # Check types
npm run lint        # Check code style
```

### Debug Mode
Enable detailed logging:
```javascript
window.feedbackWidget.setDebugMode(true);
```

## API Reference

### 🟢 TypeScript SDK API (`window.feedbackWidget`)

**Main Methods:**
- `feedbackWidget.init(config)` - Initialize widget(s)
- `feedbackWidget.create(id, config?)` - Create widget with default config
- `feedbackWidget.show(id)` - Show specific widget
- `feedbackWidget.hide(id)` - Hide specific widget
- `feedbackWidget.update(id, updates)` - Update widget configuration
- `feedbackWidget.destroy(id)` - Remove widget completely
- `feedbackWidget.getConfig(id)` - Get widget configuration
- `feedbackWidget.exportConfig(id)` - Export config as JSON string
- `feedbackWidget.importConfig(configJson)` - Import config from JSON
- `feedbackWidget.getStats()` - Get usage statistics
- `feedbackWidget.on(event, callback)` - Event listener

**Events:**
- `feedbackSubmitted` - Fired when feedback is submitted
- Custom events via `window.dispatchEvent`

### 🟡 Standalone Widget API (`window.feedbackWidget`)

**Main Methods:**
- `feedbackWidget.show()` - Show widget
- `feedbackWidget.hide()` - Hide widget
- `feedbackWidget.toggle()` - Toggle widget visibility
- `feedbackWidget.setRating(rating)` - Set rating (1-5)
- `feedbackWidget.submit()` - Submit feedback

**Configuration:**
- Set `window.feedbackConfig` before loading widget
- Or create new instance: `new window.FeedbackWidget(config)`

**Available Properties:**
- `feedbackWidget.config` - Current configuration
- `feedbackWidget.isVisible` - Visibility state
- `feedbackWidget.selectedRating` - Current rating

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Notes
- Widget bundle size: ~15KB minified + gzipped
- Zero external dependencies for standalone version
- Lazy loading support for React components
- Optimized for Core Web Vitals