import React from 'react';
import ReactDOM from 'react-dom/client';
import { FeedbackWidget } from './components/FeedbackWidget';
import { FeedbackManager } from './core/FeedbackManager';
import { WidgetConfig, FeedbackData } from './types';

class FeedbackWidgetSDK {
  private manager: FeedbackManager;
  private containers: Map<string, HTMLElement> = new Map();
  private roots: Map<string, any> = new Map();
  private widgetVisibility: Map<string, boolean> = new Map();

  constructor() {
    this.manager = FeedbackManager.getInstance();
    console.log('🚀 Feedback Widget SDK initialized');
  }

  public init(config: WidgetConfig | WidgetConfig[]): void {
    const configs = Array.isArray(config) ? config : [config];

    configs.forEach(cfg => {
      const validation = this.manager.validateConfig(cfg);
      if (!validation.valid) {
        console.error(`❌ Invalid widget configuration for ${cfg.id}:`, validation.errors);
        return;
      }

      this.manager.registerWidget(cfg);
      this.renderWidget(cfg);
    });
  }

  public create(id: string, config?: Partial<WidgetConfig>): void {
    const baseConfig = this.manager.createDefaultConfig(id);
    const finalConfig = config ? { ...baseConfig, ...config, id } : baseConfig;

    this.init(finalConfig);
  }

  public show(id: string): boolean {
    this.widgetVisibility.set(id, true);
    this.rerenderWidget(id);
    return true;
  }

  public hide(id: string): void {
    this.widgetVisibility.set(id, false);
    this.rerenderWidget(id);
  }

  public update(id: string, updates: Partial<WidgetConfig>): void {
    this.manager.updateWidget(id, updates);
    this.rerenderWidget(id);
  }

  public destroy(id: string): void {
    const root = this.roots.get(id);
    const container = this.containers.get(id);

    if (root) {
      if (typeof root.unmount === 'function') {
        root.unmount();
      }
      this.roots.delete(id);
    }

    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      this.containers.delete(id);
    }

    this.manager.removeWidget(id);
  }

  public getConfig(id: string): WidgetConfig | undefined {
    return this.manager.getWidget(id);
  }

  public exportConfig(id: string): string | null {
    return this.manager.exportConfig(id);
  }

  public importConfig(configJson: string): { success: boolean; error?: string; id?: string } {
    const result = this.manager.importConfig(configJson);
    if (result.success && result.id) {
      const config = this.manager.getWidget(result.id);
      if (config) {
        this.renderWidget(config);
      }
    }
    return result;
  }

  public getStats(): any {
    return this.manager.getStats();
  }

  private renderWidget(config: WidgetConfig): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('⚠️ Widget can only be rendered in browser environment');
      return;
    }

    let container = this.containers.get(config.id);

    if (!container) {
      container = document.createElement('div');
      container.id = `feedback-widget-${config.id}`;
      container.style.position = 'fixed';
      container.style.zIndex = '10000';
      document.body.appendChild(container);
      this.containers.set(config.id, container);
    }

    const existingRoot = this.roots.get(config.id);
    if (existingRoot) {
      if (typeof existingRoot.unmount === 'function') {
        existingRoot.unmount();
      }
    }

    const element = React.createElement(FeedbackWidget, {
      config,
      forceVisible: this.widgetVisibility.get(config.id) || false,
      onSubmit: (data: FeedbackData) => {
        console.log('📊 Feedback submitted:', data);
        this.onFeedbackSubmit(config.id, data);
      },
      onClose: () => {
        console.log('👋 Widget closed:', config.id);
      }
    });

    // Try React 18 createRoot first, fallback to legacy render
    try {
      if (ReactDOM.createRoot && typeof ReactDOM.createRoot === 'function') {
        const root = ReactDOM.createRoot(container);
        this.roots.set(config.id, root);
        root.render(element);
      } else {
        // Fallback to legacy ReactDOM.render
        const legacyRender = (ReactDOM as any).render;
        if (legacyRender) {
          legacyRender(element, container);
          this.roots.set(config.id, { unmount: () => {
            const legacyUnmount = (ReactDOM as any).unmountComponentAtNode;
            if (legacyUnmount) {
              legacyUnmount(container);
            }
          }});
        } else {
          console.error('❌ No React render method available');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Failed to render widget:', error);
      return;
    }

    this.manager.setActiveWidget(config.id, {
      triggerManually: () => {
        this.show(config.id);
      }
    });
  }

  private rerenderWidget(id: string): void {
    const config = this.manager.getWidget(id);
    if (config) {
      this.renderWidget(config);
    }
  }

  private onFeedbackSubmit(widgetId: string, data: FeedbackData): void {
    const event = new CustomEvent('feedbackSubmitted', {
      detail: { widgetId, data }
    });
    window.dispatchEvent(event);
  }

  public on(event: 'feedbackSubmitted', callback: (data: { widgetId: string; data: FeedbackData }) => void): void {
    window.addEventListener('feedbackSubmitted', (e: any) => {
      callback(e.detail);
    });
  }

  public off(event: 'feedbackSubmitted', callback?: Function): void {
    if (callback) {
      window.removeEventListener('feedbackSubmitted', callback as EventListener);
    }
  }
}

// Create SDK instance
const sdk = new FeedbackWidgetSDK();

// Create the object that will be assigned to the global FeedbackWidget
const globalExport = {
  feedbackWidget: sdk,
  create: sdk.create.bind(sdk),
  show: sdk.show.bind(sdk),
  hide: sdk.hide.bind(sdk),
  init: sdk.init.bind(sdk),
  destroy: sdk.destroy.bind(sdk),
  on: sdk.on.bind(sdk),
  off: sdk.off.bind(sdk),
  getStats: sdk.getStats.bind(sdk),
  SDK: FeedbackWidgetSDK,

  // Add init function that sets up window globals
  setupGlobals() {
    if (typeof window !== 'undefined') {
      console.log('🔧 Setting up window globals...');
      (window as any).FeedbackWidget = this;
      (window as any).feedbackWidget = this.feedbackWidget;
      console.log('✅ Window globals set');
      return true;
    }
    return false;
  }
};

// Auto-setup globals immediately after module load
if (typeof window !== 'undefined') {
  (window as any).FeedbackWidget = globalExport;
  (window as any).feedbackWidget = globalExport.feedbackWidget;
}

// Export the global object for UMD
export default globalExport;