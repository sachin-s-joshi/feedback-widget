import React from 'react';
import ReactDOM from 'react-dom/client';
import { FeedbackWidget } from './components/FeedbackWidget';
import { FeedbackManager } from './core/FeedbackManager';
import { WidgetConfig, FeedbackData } from './types';

declare global {
  interface Window {
    FeedbackWidget: typeof FeedbackWidgetSDK;
    feedbackWidget: FeedbackWidgetSDK;
  }
}

export class FeedbackWidgetSDK {
  private manager: FeedbackManager;
  private containers: Map<string, HTMLElement> = new Map();
  private roots: Map<string, any> = new Map();

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
    return this.manager.triggerWidget(id);
  }

  public hide(id: string): void {
    const container = this.containers.get(id);
    if (container) {
      container.style.display = 'none';
    }
  }

  public update(id: string, updates: Partial<WidgetConfig>): void {
    this.manager.updateWidget(id, updates);
    this.rerenderWidget(id);
  }

  public destroy(id: string): void {
    const root = this.roots.get(id);
    const container = this.containers.get(id);

    if (root) {
      root.unmount();
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
      existingRoot.unmount();
    }

    const root = ReactDOM.createRoot(container);
    this.roots.set(config.id, root);

    root.render(
      React.createElement(FeedbackWidget, {
        config,
        onSubmit: (data: FeedbackData) => {
          console.log('📊 Feedback submitted:', data);
          this.onFeedbackSubmit(config.id, data);
        },
        onClose: () => {
          console.log('👋 Widget closed:', config.id);
        }
      })
    );

    this.manager.setActiveWidget(config.id, {
      triggerManually: () => {
        container.style.display = 'block';
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

const sdk = new FeedbackWidgetSDK();

if (typeof window !== 'undefined') {
  window.FeedbackWidget = FeedbackWidgetSDK;
  window.feedbackWidget = sdk;
}

export default sdk;
export { FeedbackWidget } from './components/FeedbackWidget';
export { FeedbackManager } from './core/FeedbackManager';
export { DataLayerManager } from './core/DataLayerManager';
export { TriggerManager } from './core/TriggerManager';
export * from './types';

const autoInit = () => {
  if (typeof window !== 'undefined' && window.document) {
    const script = document.currentScript as HTMLScriptElement;
    const autoConfig = script?.getAttribute('data-config');

    if (autoConfig) {
      try {
        const config = JSON.parse(autoConfig);
        sdk.init(config);
      } catch (error) {
        console.error('❌ Failed to parse auto-config:', error);
      }
    }

    const configElement = document.querySelector('script[data-feedback-config]');
    if (configElement) {
      const configJson = configElement.textContent;
      if (configJson) {
        try {
          const config = JSON.parse(configJson);
          sdk.init(config);
        } catch (error) {
          console.error('❌ Failed to parse config from script element:', error);
        }
      }
    }
  }
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}