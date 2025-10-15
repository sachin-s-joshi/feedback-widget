import { FeedbackData, DataLayerConfig, AnalyticsConfig, DataLayerEvent } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    alloy: any;
  }
}

export class DataLayerManager {
  private config: DataLayerConfig;
  private analyticsConfig: AnalyticsConfig;

  constructor(dataLayerConfig: DataLayerConfig, analyticsConfig: AnalyticsConfig) {
    this.config = dataLayerConfig;
    this.analyticsConfig = analyticsConfig;
    this.initializeDataLayer();
  }

  private initializeDataLayer(): void {
    if (typeof window !== 'undefined' && !window.dataLayer) {
      window.dataLayer = [];
    }
  }

  public pushEvent(feedbackData: FeedbackData, widgetId: string, version: string, trigger: string): void {
    if (!this.config.enabled) return;

    const event: DataLayerEvent = {
      event: this.config.eventName,
      feedback_data: feedbackData,
      widget_config: {
        id: widgetId,
        version: version,
        trigger: trigger
      },
      timestamp: Date.now(),
      ...this.config.customProperties
    };

    this.pushToDataLayer(event);
    this.sendToAnalytics(feedbackData, event);
  }

  private pushToDataLayer(event: DataLayerEvent): void {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(event);
      console.log('📊 Feedback event pushed to dataLayer:', event);
    }
  }

  private sendToAnalytics(feedbackData: FeedbackData, event: DataLayerEvent): void {
    this.sendToGA4(feedbackData, event);
    this.sendToAdobeWebSDK(feedbackData, event);
    this.sendToCustomEndpoint(feedbackData, event);
  }

  private sendToGA4(feedbackData: FeedbackData, event: DataLayerEvent): void {
    if (!this.analyticsConfig.ga4?.enabled) return;

    const ga4Config = this.analyticsConfig.ga4;

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', ga4Config.eventName, {
        feedback_type: feedbackData.type,
        feedback_rating: feedbackData.rating,
        feedback_category: feedbackData.category,
        page_location: feedbackData.metadata.page,
        custom_parameter_1: feedbackData.id,
        custom_parameter_2: event.widget_config.trigger,
        value: feedbackData.rating || 1
      });
      console.log('📈 Event sent to GA4');
    }
  }

  private sendToAdobeWebSDK(feedbackData: FeedbackData, event: DataLayerEvent): void {
    if (!this.analyticsConfig.adobeWebSDK?.enabled) return;

    const adobeConfig = this.analyticsConfig.adobeWebSDK;

    if (typeof window !== 'undefined' && window.alloy) {
      const xdmData = {
        eventType: adobeConfig.eventType,
        _experience: {
          analytics: {
            customDimensions: {
              eVars: {
                eVar1: feedbackData.type,
                eVar2: feedbackData.rating?.toString(),
                eVar3: event.widget_config.trigger
              }
            },
            event1to100: {
              event1: {
                value: 1
              }
            }
          }
        },
        web: {
          webPageDetails: {
            URL: feedbackData.metadata.page
          }
        },
        feedback: {
          id: feedbackData.id,
          type: feedbackData.type,
          rating: feedbackData.rating,
          text: feedbackData.text,
          category: feedbackData.category,
          timestamp: feedbackData.timestamp
        }
      };

      window.alloy('sendEvent', {
        type: adobeConfig.eventType,
        xdm: xdmData
      });
      console.log('🎯 Event sent to Adobe WebSDK');
    }
  }

  private async sendToCustomEndpoint(feedbackData: FeedbackData, event: DataLayerEvent): Promise<void> {
    if (!this.analyticsConfig.custom?.enabled) return;

    const customConfig = this.analyticsConfig.custom;

    try {
      const response = await fetch(customConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...customConfig.headers
        },
        body: JSON.stringify({
          feedback_data: feedbackData,
          widget_config: event.widget_config,
          timestamp: event.timestamp
        })
      });

      if (response.ok) {
        console.log('🔗 Event sent to custom endpoint');
      } else {
        console.error('Failed to send to custom endpoint:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending to custom endpoint:', error);
    }
  }

  public trackWidgetView(widgetId: string, trigger: string): void {
    if (!this.config.enabled) return;

    const viewEvent = {
      event: 'feedback_widget_view',
      feedback_data: {} as any,
      widget_config: {
        id: widgetId,
        version: '1.0.0',
        trigger: trigger
      },
      timestamp: Date.now()
    };

    this.pushToDataLayer(viewEvent);
  }

  public trackWidgetInteraction(action: string, widgetId: string): void {
    if (!this.config.enabled) return;

    const interactionEvent = {
      event: 'feedback_widget_interaction',
      feedback_data: {} as any,
      widget_config: {
        id: widgetId,
        version: '1.0.0',
        trigger: 'interaction'
      },
      timestamp: Date.now()
    };

    this.pushToDataLayer(interactionEvent);
  }
}