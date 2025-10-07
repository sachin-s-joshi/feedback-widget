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
  type: 'page' | 'time' | 'scroll' | 'exit-intent' | 'element-click' | 'manual';
  conditions: {
    pages?: string[];
    timeDelay?: number;
    scrollPercentage?: number;
    elementSelector?: string;
    frequency?: 'once' | 'session' | 'always';
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