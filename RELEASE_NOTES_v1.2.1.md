# 🚀 Feedback Widget v1.2.1 Release Notes

**Release Date**: October 15, 2025
**NPM Package**: `@sjbhn/feedback-widget@1.2.1`

## 🐛 Critical Bug Fixes

### ✅ Manual Trigger Widget Visibility
**Issue**: Manual trigger widgets were not showing when `.show()` method was called
- **Root Cause**: React component was returning `null` when `isVisible` state was false, but UMD layer was only changing CSS display
- **Fix**: Added `forceVisible` prop to FeedbackWidget component and proper state management in UMD layer
- **Impact**: Manual triggers now work correctly for programmatic widget control

### ✅ NPS Rating Selection & Validation
**Issue**: NPS (0-10 scale) buttons were not responding to clicks and validation was failing
- **Root Cause**: Field mapping conflict between 'rating' and 'nps' field types, plus zero values treated as empty
- **Fix**: Proper field key mapping and numeric validation handling
- **Impact**: NPS ratings now work correctly, including score of 0

### ✅ Sequential Star Rating Behavior
**Issue**: Star rating only highlighted the selected star, not all stars up to selection
- **Root Cause**: Condition was checking `value === rating` instead of `rating <= value`
- **Fix**: Updated logic for sequential filling and enhanced TypeScript type safety
- **Impact**: Selecting 4 stars now properly fills stars 1-4 with golden glow animation

## 🧪 Quality Assurance

### ✅ Comprehensive Test Suite
- **Added**: Complete trigger validation test page (`trigger-validation-test-fixed.html`)
- **Coverage**: All trigger types, widget interactions, and edge cases
- **Validation**: Real-time status tracking and error reporting
- **Features Tested**:
  - Manual triggers with show/hide
  - Time-based triggers with countdown
  - Scroll percentage triggers
  - Rage-click detection
  - DataLayer event integration
  - Sequential star rating
  - NPS scoring (0-10)
  - Form validation

## 📖 Documentation Updates

### ✅ Enhanced README
- **Added**: Changelog section with version history
- **Updated**: Feature descriptions with latest capabilities
- **Fixed**: Code examples with correct version numbers
- **Added**: NPS rating documentation

### ✅ Updated Examples
- **Fixed**: CDN URLs with pinned version (`@1.2.1`)
- **Updated**: Configuration examples with proper typing
- **Added**: Comprehensive trigger validation examples

## 🔧 Technical Improvements

### ✅ Widget State Management
- **Enhanced**: External visibility control with `forceVisible` prop
- **Improved**: UMD layer widget lifecycle management
- **Added**: Proper state synchronization between React and UMD layers

### ✅ Form Validation
- **Fixed**: Numeric field validation (rating, NPS)
- **Improved**: Field mapping consistency
- **Enhanced**: Error handling for edge cases

### ✅ TypeScript Safety
- **Added**: Type checking for rating comparisons
- **Improved**: Field key mapping with proper typing
- **Enhanced**: Interface consistency

## 🚀 Usage

### NPM Installation
```bash
npm install @sjbhn/feedback-widget@1.2.1
```

### CDN Usage
```html
<script src="https://cdn.jsdelivr.net/npm/@sjbhn/feedback-widget@1.2.1/dist/feedback-widget.min.js"></script>
```

### Basic Example
```javascript
import feedbackWidget from '@sjbhn/feedback-widget';

feedbackWidget.init({
  id: 'my-widget',
  version: '1.2.1',
  triggers: [{ type: 'manual' }],
  fields: [
    { type: 'rating', label: 'Rate us', required: true },
    { type: 'nps', label: 'Recommend us?', required: true }
  ]
});

// Show widget manually
feedbackWidget.show('my-widget');
```

## 🧪 Testing

All features have been validated through comprehensive testing:
- ✅ Manual trigger show/hide functionality
- ✅ Sequential star rating (1-5 stars)
- ✅ NPS rating selection (0-10 scale)
- ✅ Form validation with numeric fields
- ✅ Time-based triggers with countdown
- ✅ Scroll percentage detection
- ✅ Rage-click frustration detection
- ✅ DataLayer event integration
- ✅ Cross-browser compatibility

## 🔄 Migration from v1.2.0

No breaking changes - this is a patch release with bug fixes:
- Existing configurations will work without changes
- No API modifications
- Enhanced functionality for existing features

## 🐛 Known Issues

None currently identified. All critical functionality has been validated.

## 📞 Support

- 📦 **NPM**: https://www.npmjs.com/package/@sjbhn/feedback-widget
- 📖 **Documentation**: Updated README with comprehensive examples
- 🧪 **Test Suite**: Available in repository for validation
- 📧 **Contact**: sachinj.work@gmail.com

---

**Made with ❤️ for better user feedback collection**