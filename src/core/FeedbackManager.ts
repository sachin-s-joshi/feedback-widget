import { WidgetConfig, FeedbackData } from '../types';
import { deepMerge } from '../utils/helpers';

export class FeedbackManager {
  private static instance: FeedbackManager;
  private configs: Map<string, WidgetConfig> = new Map();
  private activeWidgets: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager();
    }
    return FeedbackManager.instance;
  }

  public registerWidget(config: WidgetConfig): void {
    const mergedConfig = this.mergeWithDefaults(config);
    this.configs.set(config.id, mergedConfig);
    console.log(`📝 Feedback widget registered: ${config.id} (v${config.version})`);
  }

  public getWidget(id: string): WidgetConfig | undefined {
    return this.configs.get(id);
  }

  public updateWidget(id: string, updates: Partial<WidgetConfig>): void {
    const existing = this.configs.get(id);
    if (existing) {
      const updated = deepMerge(existing, updates);
      this.configs.set(id, updated);
      console.log(`🔄 Feedback widget updated: ${id}`);
    }
  }

  public removeWidget(id: string): void {
    this.configs.delete(id);
    this.activeWidgets.delete(id);
    console.log(`🗑️ Feedback widget removed: ${id}`);
  }

  public listWidgets(): WidgetConfig[] {
    return Array.from(this.configs.values());
  }

  public setActiveWidget(id: string, component: any): void {
    this.activeWidgets.set(id, component);
  }

  public getActiveWidget(id: string): any {
    return this.activeWidgets.get(id);
  }

  public triggerWidget(id: string): boolean {
    const widget = this.activeWidgets.get(id);
    if (widget && widget.triggerManually) {
      widget.triggerManually();
      return true;
    }
    return false;
  }

  private mergeWithDefaults(config: WidgetConfig): WidgetConfig {
    const defaults: Partial<WidgetConfig> = {
      position: 'bottom-right',
      appearance: {
        theme: 'light',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          background: '#ffffff',
          text: '#333333',
          border: '#e0e0e0'
        },
        borderRadius: 8,
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        animations: true
      },
      dataLayer: {
        enabled: true,
        eventName: 'feedback_submitted',
        objectName: 'dataLayer'
      },
      analytics: {}
    };

    return deepMerge(defaults, config);
  }

  public validateConfig(config: WidgetConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id) {
      errors.push('Widget ID is required');
    }

    if (!config.version) {
      errors.push('Widget version is required');
    }

    if (!config.fields || config.fields.length === 0) {
      errors.push('At least one field is required');
    }

    if (!config.triggers || config.triggers.length === 0) {
      errors.push('At least one trigger is required');
    }

    config.fields?.forEach((field, index) => {
      if (!field.type) {
        errors.push(`Field ${index + 1}: type is required`);
      }
      if (!field.label) {
        errors.push(`Field ${index + 1}: label is required`);
      }
    });

    config.triggers?.forEach((trigger, index) => {
      if (!trigger.type) {
        errors.push(`Trigger ${index + 1}: type is required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public createDefaultConfig(id: string): WidgetConfig {
    return {
      id,
      version: '1.0.0',
      position: 'bottom-right',
      triggers: [
        {
          type: 'time',
          conditions: {
            timeDelay: 5000,
            frequency: 'session'
          }
        }
      ],
      appearance: {
        theme: 'light',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          background: '#ffffff',
          text: '#333333',
          border: '#e0e0e0'
        },
        borderRadius: 8,
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        animations: true
      },
      fields: [
        {
          type: 'rating',
          label: 'How would you rate your experience?',
          required: true
        },
        {
          type: 'text',
          label: 'Tell us more about your experience',
          required: false,
          placeholder: 'Your feedback...',
          validation: {
            maxLength: 500
          }
        }
      ],
      dataLayer: {
        enabled: true,
        eventName: 'feedback_submitted',
        objectName: 'dataLayer'
      },
      analytics: {}
    };
  }

  public exportConfig(id: string): string | null {
    const config = this.configs.get(id);
    if (config) {
      return JSON.stringify(config, null, 2);
    }
    return null;
  }

  public importConfig(configJson: string): { success: boolean; error?: string; id?: string } {
    try {
      const config = JSON.parse(configJson);
      const validation = this.validateConfig(config);

      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid configuration: ${validation.errors.join(', ')}`
        };
      }

      this.registerWidget(config);
      return {
        success: true,
        id: config.id
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON format'
      };
    }
  }

  public getStats(): {
    totalWidgets: number;
    activeWidgets: number;
    configVersions: Record<string, string>;
  } {
    const configs = Array.from(this.configs.values());
    return {
      totalWidgets: configs.length,
      activeWidgets: this.activeWidgets.size,
      configVersions: configs.reduce((acc, config) => {
        acc[config.id] = config.version;
        return acc;
      }, {} as Record<string, string>)
    };
  }
}