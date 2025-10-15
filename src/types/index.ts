export interface FeedbackData {
  id: string;
  timestamp: number;
  type: 'rating' | 'text' | 'category' | 'nps';
  rating?: number;
  text?: string;
  category?: string;
  email?: string;
  metadata: {
    page: string;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
    trigger: string;
    sessionId?: string;
  };
}

export interface WidgetConfig {
  id: string;
  version: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  triggers: TriggerConfig[];
  appearance: AppearanceConfig;
  fields: FieldConfig[];
  dataLayer: DataLayerConfig;
  analytics: AnalyticsConfig;
}

export interface TriggerConfig {
  type: 'page' | 'time' | 'scroll' | 'exit-intent' | 'element-click' | 'manual' | 'rage-click' | 'confused-navigation' | 'datalayer-event';
  conditions: {
    pages?: string[];
    timeDelay?: number;
    scrollPercentage?: number;
    elementSelector?: string;
    frequency?: 'once' | 'session' | 'always';
    // Rage click conditions
    rageClick?: {
      clickThreshold?: number;     // Number of clicks to trigger (default: 3)
      timeWindow?: number;         // Time window in ms (default: 2000)
      elementSelector?: string;    // Specific element or any clickable
      excludeSelectors?: string[]; // Elements to exclude from rage detection
    };
    // Confused navigation conditions
    confusedNavigation?: {
      backAndForthThreshold?: number;     // Number of back/forth navigations (default: 3)
      timeWindow?: number;                // Time window in ms (default: 30000)
      scrollJumpThreshold?: number;       // Rapid scroll changes (default: 5)
      mouseMovementThreshold?: number;    // Erratic mouse movements (default: 100)
      inactivityThreshold?: number;       // Long pauses indicating confusion (default: 10000)
    };
    // DataLayer event conditions
    dataLayerEvent?: {
      eventName: string;                  // Event name to listen for
      eventProperties?: Record<string, any>; // Properties to match
      objectName?: string;                // DataLayer object name (default: 'dataLayer')
      matchType?: 'exact' | 'partial' | 'exists'; // How to match properties
      debounceTime?: number;              // Debounce multiple events (default: 1000)
    };
  };
}

export interface AppearanceConfig {
  theme: 'light' | 'dark' | 'custom';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
  borderRadius: number;
  fontSize: string;
  fontFamily: string;
  animations: boolean;
  customCSS?: string;
  feedbackLeaf?: FeedbackLeafConfig;
}

export interface FeedbackLeafConfig {
  text?: string;
  icon?: string;
  shape?: 'tab' | 'circle' | 'square' | 'rounded';
  size?: {
    width?: string;
    height?: string;
  };
  colors?: {
    background?: string;
    text?: string;
    border?: string;
  };
  positioning?: {
    offsetX?: string;
    offsetY?: string;
  };
  animation?: {
    enabled?: boolean;
    type?: 'pulse' | 'bounce' | 'slide' | 'none';
    duration?: string;
  };
  shadow?: {
    enabled?: boolean;
    blur?: string;
    color?: string;
  };
  hideAfter?: number; // milliseconds, 0 = never hide
}

export interface FieldConfig {
  type: 'rating' | 'text' | 'email' | 'category' | 'nps';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface DataLayerConfig {
  enabled: boolean;
  eventName: string;
  objectName: string;
  customProperties?: Record<string, any>;
}

export interface AnalyticsConfig {
  ga4?: {
    enabled: boolean;
    measurementId: string;
    eventName: string;
  };
  adobeWebSDK?: {
    enabled: boolean;
    eventType: string;
    schema: string;
  };
  custom?: {
    enabled: boolean;
    endpoint: string;
    headers?: Record<string, string>;
  };
}

export interface WidgetState {
  isVisible: boolean;
  isMinimized: boolean;
  currentStep: number;
  formData: Partial<FeedbackData>;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  errors: Record<string, string>;
}

export interface DataLayerEvent {
  event: string;
  feedback_data: FeedbackData;
  widget_config: {
    id: string;
    version: string;
    trigger: string;
  };
  timestamp: number;
}