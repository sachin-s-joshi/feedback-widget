# 🎯 Feedback Widget

A modern, configurable feedback collection widget built with React and TypeScript. Perfect replacement for third-party solutions like Hotjar, with full control over data and analytics integration.

## ✨ Features

- 🚀 **Modern Stack**: Built with React, TypeScript, and modern bundling
- 🎯 **Multiple Triggers**: Time-based, scroll, page-based, exit-intent, manual
- 📊 **Analytics Integration**: GA4, Adobe WebSDK, custom endpoints
- 🎨 **Fully Customizable**: Themes, colors, fonts, positioning
- 📱 **Responsive**: Mobile-first design with touch support
- 🔄 **Data Layer**: Push events to dataLayer for marketing analytics
- 📦 **NPM Ready**: Deploy as versioned packages
- ♿ **Accessible**: WCAG compliant with keyboard navigation
- 🌍 **Framework Agnostic**: Works with any website or application

## 🚀 Quick Start

### NPM Installation

```bash
npm install @yourorg/feedback-widget
```

### Basic Usage

```javascript
import feedbackWidget from '@yourorg/feedback-widget';

// Initialize with basic configuration
feedbackWidget.init({
  id: 'my-feedback-widget',
  version: '1.0.0',
  position: 'bottom-right',
  triggers: [
    {
      type: 'time',
      conditions: { timeDelay: 5000 }
    }
  ],
  fields: [
    {
      type: 'rating',
      label: 'How was your experience?',
      required: true
    },
    {
      type: 'text',
      label: 'Tell us more',
      required: false,
      placeholder: 'Your feedback...'
    }
  ]
});
```

### CDN Usage

```html
<script src="https://cdn.jsdelivr.net/npm/@yourorg/feedback-widget/dist/feedback-widget.min.js"></script>
<script>
  window.feedbackWidget.create('demo-widget', {
    triggers: [{ type: 'manual' }]
  });

  // Trigger manually
  window.feedbackWidget.show('demo-widget');
</script>
```

### Auto-Configuration

```html
<!-- Auto-initialize from script attribute -->
<script
  src="feedback-widget.min.js"
  data-config='{"id":"auto-widget","version":"1.0.0","triggers":[{"type":"time","conditions":{"timeDelay":3000}}],"fields":[{"type":"rating","label":"Rate us","required":true}]}'
></script>
```

## 📋 Configuration Reference

### Widget Config

```typescript
interface WidgetConfig {
  id: string;                    // Unique widget identifier
  version: string;               // Widget version for tracking
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  triggers: TriggerConfig[];     // When to show the widget
  appearance: AppearanceConfig;  // Visual customization
  fields: FieldConfig[];         // Form fields to display
  dataLayer: DataLayerConfig;    // Data layer integration
  analytics: AnalyticsConfig;    // Analytics integrations
}
```

### Trigger Types

```javascript
// Time-based trigger
{
  type: 'time',
  conditions: {
    timeDelay: 5000,           // Delay in milliseconds
    frequency: 'once'          // 'once', 'session', 'always'
  }
}

// Scroll-based trigger
{
  type: 'scroll',
  conditions: {
    scrollPercentage: 75,      // Trigger at 75% scroll
    frequency: 'session'
  }
}

// Page-based trigger
{
  type: 'page',
  conditions: {
    pages: ['/checkout', '/product/*'],  // Specific pages or patterns
    frequency: 'once'
  }
}

// Exit-intent trigger
{
  type: 'exit-intent',
  conditions: {
    frequency: 'session'
  }
}

// Element click trigger
{
  type: 'element-click',
  conditions: {
    elementSelector: '.feedback-button',
    frequency: 'always'
  }
}

// Manual trigger
{
  type: 'manual',
  conditions: {}
}
```

### Field Types

```javascript
// Rating field (1-5 stars)
{
  type: 'rating',
  label: 'Rate your experience',
  required: true
}

// NPS field (0-10 scale)
{
  type: 'nps',
  label: 'How likely are you to recommend us?',
  required: true
}

// Text area
{
  type: 'text',
  label: 'Additional feedback',
  required: false,
  placeholder: 'Tell us more...',
  validation: {
    minLength: 10,
    maxLength: 500
  }
}

// Email input
{
  type: 'email',
  label: 'Your email',
  required: false,
  placeholder: 'your@email.com'
}

// Category dropdown
{
  type: 'category',
  label: 'Feedback type',
  required: true,
  options: ['Bug Report', 'Feature Request', 'General']
}
```

### Appearance Customization

```javascript
appearance: {
  theme: 'light',              // 'light', 'dark', 'custom'
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#333333',
    border: '#e0e0e0'
  },
  borderRadius: 8,
  fontSize: '14px',
  fontFamily: 'Arial, sans-serif',
  animations: true,
  customCSS: '.my-widget { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }'
}
```

## 📊 Analytics Integration

### Google Analytics 4

```javascript
analytics: {
  ga4: {
    enabled: true,
    measurementId: 'G-XXXXXXXXXX',
    eventName: 'feedback_submitted'
  }
}
```

### Adobe Web SDK

```javascript
analytics: {
  adobeWebSDK: {
    enabled: true,
    eventType: 'web.webInteraction.linkClicks',
    schema: 'https://ns.adobe.com/yourorg/feedback'
  }
}
```

### Custom Endpoint

```javascript
analytics: {
  custom: {
    enabled: true,
    endpoint: 'https://api.yoursite.com/feedback',
    headers: {
      'Authorization': 'Bearer your-token',
      'X-API-Key': 'your-api-key'
    }
  }
}
```

### Data Layer Integration

```javascript
dataLayer: {
  enabled: true,
  eventName: 'feedback_submitted',
  objectName: 'dataLayer',
  customProperties: {
    source: 'feedback_widget',
    version: '1.0.0'
  }
}
```

The widget automatically pushes events to `window.dataLayer`:

```javascript
{
  event: 'feedback_submitted',
  feedback_data: {
    id: 'unique-id',
    type: 'rating',
    rating: 5,
    text: 'Great experience!',
    // ... other data
  },
  widget_config: {
    id: 'my-widget',
    version: '1.0.0',
    trigger: 'time_delay'
  },
  timestamp: 1634567890123
}
```

## 🔧 API Reference

### Core Methods

```javascript
// Initialize widget(s)
feedbackWidget.init(config);

// Create widget with default + custom config
feedbackWidget.create('widget-id', partialConfig);

// Show widget manually
feedbackWidget.show('widget-id');

// Hide widget
feedbackWidget.hide('widget-id');

// Update widget configuration
feedbackWidget.update('widget-id', updates);

// Destroy widget
feedbackWidget.destroy('widget-id');

// Get widget configuration
const config = feedbackWidget.getConfig('widget-id');

// Export configuration as JSON
const json = feedbackWidget.exportConfig('widget-id');

// Import configuration from JSON
const result = feedbackWidget.importConfig(jsonString);

// Get widget statistics
const stats = feedbackWidget.getStats();
```

### Event Handling

```javascript
// Listen for feedback submissions
feedbackWidget.on('feedbackSubmitted', (data) => {
  console.log('Feedback received:', data);

  // Send to your own analytics
  analytics.track('Feedback Submitted', {
    rating: data.data.rating,
    type: data.data.type,
    page: data.data.metadata.page
  });
});

// Remove event listener
feedbackWidget.off('feedbackSubmitted', callback);
```

## 🏗️ Development

### Setup

```bash
git clone https://github.com/yourorg/feedback-widget.git
cd feedback-widget
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the demo.

### Build for Production

```bash
# Build NPM package
npm run build:npm

# Build demo
npm run build
```

### Testing

```bash
npm test
npm run test:watch
```

## 📦 Deployment

### As NPM Package

1. Update version in `package.json`
2. Build the package: `npm run build:npm`
3. Publish: `npm publish`

### As CDN Asset

1. Build: `npm run build:npm`
2. Upload `dist/feedback-widget.min.js` to your CDN
3. Reference in HTML: `<script src="your-cdn/feedback-widget.min.js"></script>`

### Versioning Strategy

```javascript
// Use semantic versioning
{
  "version": "1.2.3",  // major.minor.patch
  "id": "widget-v1",   // Version-specific widget ID
}

// Deploy multiple versions simultaneously
feedbackWidget.init([
  { id: 'widget-v1', version: '1.0.0', /* config */ },
  { id: 'widget-v2', version: '2.0.0', /* config */ }
]);
```

## 🎨 Examples

### E-commerce Product Feedback

```javascript
feedbackWidget.create('product-feedback', {
  triggers: [
    {
      type: 'page',
      conditions: {
        pages: ['/product/*'],
        frequency: 'once'
      }
    }
  ],
  fields: [
    {
      type: 'rating',
      label: 'Rate this product',
      required: true
    },
    {
      type: 'category',
      label: 'Feedback about',
      required: true,
      options: ['Quality', 'Price', 'Shipping', 'Customer Service']
    },
    {
      type: 'text',
      label: 'Additional comments',
      required: false
    }
  ],
  dataLayer: {
    enabled: true,
    eventName: 'product_feedback',
    customProperties: {
      product_category: 'electronics'
    }
  }
});
```

### Blog Reading Experience

```javascript
feedbackWidget.create('blog-feedback', {
  triggers: [
    {
      type: 'scroll',
      conditions: {
        scrollPercentage: 90,
        frequency: 'session'
      }
    }
  ],
  fields: [
    {
      type: 'nps',
      label: 'How likely are you to recommend this article?',
      required: true
    },
    {
      type: 'text',
      label: 'What did you think of this article?',
      required: false,
      validation: { maxLength: 300 }
    }
  ],
  appearance: {
    position: 'center',
    colors: {
      primary: '#6f42c1'
    }
  }
});
```

### Customer Support Satisfaction

```javascript
feedbackWidget.create('support-satisfaction', {
  triggers: [
    {
      type: 'element-click',
      conditions: {
        elementSelector: '.chat-end-button',
        frequency: 'always'
      }
    }
  ],
  fields: [
    {
      type: 'rating',
      label: 'How satisfied were you with our support?',
      required: true
    },
    {
      type: 'category',
      label: 'Issue type',
      required: false,
      options: ['Technical', 'Billing', 'General Question', 'Bug Report']
    },
    {
      type: 'text',
      label: 'How can we improve?',
      required: false
    },
    {
      type: 'email',
      label: 'Follow-up email (optional)',
      required: false
    }
  ]
});
```

## 🔒 Privacy & Security

- All data is processed client-side before transmission
- No tracking cookies or persistent storage without consent
- Configurable data retention policies
- GDPR compliant data handling
- XSS protection through input sanitization
- CSP compatible implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://github.com/yourorg/feedback-widget/wiki)
- 🐛 [Issue Tracker](https://github.com/yourorg/feedback-widget/issues)
- 💬 [Discussions](https://github.com/yourorg/feedback-widget/discussions)
- 📧 Email: support@yourorg.com

---

Made with ❤️ for better user feedback collection