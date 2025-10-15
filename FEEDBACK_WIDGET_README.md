# 🚀 Advanced Feedback Widget - Enterprise Hotjar Alternative

A modern, feature-rich feedback widget built with React and TypeScript. Designed for enterprise use with advanced triggers, analytics integration, and complete customization control.

## ✨ Features

- **🎯 Advanced Triggers**: Time-based, scroll, page patterns, exit-intent, rage-click detection, confused navigation analysis, dataLayer events
- **📊 Analytics Integration**: Google Analytics 4, Adobe Web SDK, custom endpoints, dataLayer events
- **⭐ Modern UI**: Animated star ratings with sequential selection, smooth transitions, and golden glow effects
- **🌟 Custom Feedback Leaf**: Fully customizable minimized trigger button with shapes, animations, and positioning
- **🎨 Complete Theming**: Dark/light themes, custom colors, fonts, CSS overrides
- **📱 Mobile Optimized**: Responsive design with touch-friendly interactions
- **🔒 Privacy First**: Client-side processing, GDPR compliant, configurable data handling
- **📦 NPM Package**: Published as @sjbhn/feedback-widget for easy integration
- **🌍 Framework Agnostic**: Works with React, Vue, Angular, vanilla HTML

## 🎯 Demo & Testing

### Local Demo
```bash
npm run dev          # Start development server
# Visit http://localhost:3000

# Or serve built demo
npm run build && cd demo-dist && python3 -m http.server 8000
# Visit http://localhost:8000
```

### CDN Demo
Open `cdn-demo.html` to test all advanced features including:
- Rage-click detection
- Confused navigation analysis
- DataLayer event triggers
- Modern animated star ratings

## 🚀 Quick Start

### NPM Installation (Recommended)

```bash
npm install @sjbhn/feedback-widget
```

```javascript
import feedbackWidget from '@sjbhn/feedback-widget';

feedbackWidget.init({
  id: 'my-feedback-widget',
  version: '1.2.0',
  position: 'bottom-right',
  triggers: [{
    type: 'time',
    conditions: { timeDelay: 5000 }
  }],
  fields: [
    {
      type: 'rating',
      label: 'How was your experience?',
      required: true
    }
  ]
});
```

### CDN Integration

```html
<script src="https://cdn.jsdelivr.net/npm/@sjbhn/feedback-widget@1.2.0/dist/feedback-widget.min.js"></script>
<script>
window.feedbackWidget.create('demo-widget', {
  triggers: [{ type: 'manual' }],
  fields: [{ type: 'rating', label: 'Rate us', required: true }]
});
</script>
```

## ⚙️ Configuration Options

```javascript
window.feedbackConfig = {
    // Widget position
    position: 'bottom-right',  // 'bottom-right' | 'bottom-left'

    // Trigger behavior
    trigger: 'manual',         // 'manual' | 'auto' | 'scroll' | 'exit'
    delay: 3000,              // Delay for auto trigger (milliseconds)

    // API endpoint for sending feedback
    apiEndpoint: null         // Your feedback collection endpoint
};
```

### Trigger Types

- **manual**: Show widget only when user clicks the tab
- **auto**: Show widget automatically after specified delay
- **scroll**: Show widget when user scrolls down 200px
- **exit**: Show widget on exit intent (mouse moves to top of browser)

## 📊 Data Format

When feedback is submitted, the following data is collected:

```javascript
{
    rating: 5,                    // 1-5 star rating
    comment: "Great experience!", // Optional user comment
    url: "https://example.com",   // Current page URL
    userAgent: "Mozilla/5.0...",  // User's browser
    timestamp: "2023-10-07T...",  // ISO timestamp
    viewport: {
        width: 1920,              // Browser width
        height: 1080              // Browser height
    }
}
```

## 🔧 API Integration

To collect feedback data, set up an endpoint that accepts POST requests:

```javascript
// Example with fetch
window.feedbackConfig = {
    apiEndpoint: 'https://api.yoursite.com/feedback'
};

// Your endpoint should handle:
// POST /feedback
// Content-Type: application/json
// Body: { rating, comment, url, userAgent, timestamp, viewport }
```

### Example Backend (Node.js/Express)

```javascript
app.post('/feedback', (req, res) => {
    const feedback = req.body;

    // Validate and save feedback
    console.log('Feedback received:', feedback);

    // Save to database, send email, etc.

    res.json({ success: true });
});
```

## 🆚 Hotjar Comparison

| Feature | This Widget | Hotjar |
|---------|-------------|--------|
| Setup | Single script tag | Complex integration |
| Size | 7KB | ~100KB+ |
| Cost | Free | $39+/month |
| Customization | Full control | Limited |
| Data ownership | Your servers | Third-party |
| Privacy | No tracking | Extensive tracking |

---

**Made with ❤️ as a lightweight alternative to Hotjar**