import React, { useState, useEffect, useRef } from 'react';
import { WidgetConfig, WidgetState, FeedbackData, FieldConfig } from '../types';
import { DataLayerManager } from '../core/DataLayerManager';
import { TriggerManager } from '../core/TriggerManager';
import { generateId } from '../utils/helpers';
import './FeedbackWidget.css';

interface FeedbackWidgetProps {
  config: WidgetConfig;
  onSubmit?: (data: FeedbackData) => void;
  onClose?: () => void;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  config,
  onSubmit,
  onClose
}) => {
  const [state, setState] = useState<WidgetState>({
    isVisible: false,
    isMinimized: false,
    currentStep: 0,
    formData: {},
    isSubmitting: false,
    hasSubmitted: false,
    errors: {}
  });

  const dataLayerManager = useRef<DataLayerManager>();
  const triggerManager = useRef<TriggerManager>();
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dataLayerManager.current = new DataLayerManager(config.dataLayer, config.analytics);
    triggerManager.current = new TriggerManager(config.triggers);

    triggerManager.current.onTrigger(() => {
      showWidget();
    });

    return () => {
      triggerManager.current?.destroy();
    };
  }, [config]);

  const showWidget = () => {
    setState(prev => ({ ...prev, isVisible: true }));
    dataLayerManager.current?.trackWidgetView(config.id, 'auto');
  };

  const hideWidget = () => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      isMinimized: false,
      currentStep: 0,
      formData: {},
      errors: {}
    }));
    onClose?.();
  };

  const minimizeWidget = () => {
    setState(prev => ({ ...prev, isMinimized: true }));
    dataLayerManager.current?.trackWidgetInteraction('minimize', config.id);
  };

  const maximizeWidget = () => {
    setState(prev => ({ ...prev, isMinimized: false }));
    dataLayerManager.current?.trackWidgetInteraction('maximize', config.id);
  };

  const updateFormData = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: '' }
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    config.fields.forEach(field => {
      const value = state.formData[field.type as keyof FeedbackData];

      if (field.required && (!value || value === '')) {
        errors[field.type] = `${field.label} is required`;
      }

      if (field.validation && value) {
        if (field.validation.minLength && String(value).length < field.validation.minLength) {
          errors[field.type] = `${field.label} must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
          errors[field.type] = `${field.label} must be no more than ${field.validation.maxLength} characters`;
        }
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(String(value))) {
          errors[field.type] = `${field.label} format is invalid`;
        }
      }
    });

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const submitFeedback = async () => {
    if (!validateForm()) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    const feedbackData: FeedbackData = {
      id: generateId(),
      timestamp: Date.now(),
      type: state.formData.type || 'text',
      rating: state.formData.rating,
      text: state.formData.text,
      category: state.formData.category,
      email: state.formData.email,
      metadata: {
        page: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        trigger: 'widget',
        sessionId: generateId()
      }
    };

    try {
      dataLayerManager.current?.pushEvent(
        feedbackData,
        config.id,
        config.version,
        'widget_submission'
      );

      onSubmit?.(feedbackData);

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        hasSubmitted: true
      }));

      setTimeout(() => {
        hideWidget();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = state.formData[field.type as keyof FeedbackData];
    const error = state.errors[field.type];

    switch (field.type) {
      case 'rating':
        return (
          <div key={field.type} className="feedback-field">
            <label>{field.label} {field.required && '*'}</label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  className={`rating-btn ${value === rating ? 'active' : ''}`}
                  onClick={() => updateFormData('rating', rating)}
                >
                  ⭐
                </button>
              ))}
            </div>
            {error && <span className="error">{error}</span>}
          </div>
        );

      case 'text':
        return (
          <div key={field.type} className="feedback-field">
            <label>{field.label} {field.required && '*'}</label>
            <textarea
              value={value || ''}
              placeholder={field.placeholder}
              onChange={(e) => updateFormData('text', e.target.value)}
              maxLength={field.validation?.maxLength}
            />
            {error && <span className="error">{error}</span>}
          </div>
        );

      case 'email':
        return (
          <div key={field.type} className="feedback-field">
            <label>{field.label} {field.required && '*'}</label>
            <input
              type="email"
              value={value || ''}
              placeholder={field.placeholder}
              onChange={(e) => updateFormData('email', e.target.value)}
            />
            {error && <span className="error">{error}</span>}
          </div>
        );

      case 'category':
        return (
          <div key={field.type} className="feedback-field">
            <label>{field.label} {field.required && '*'}</label>
            <select
              value={value || ''}
              onChange={(e) => updateFormData('category', e.target.value)}
            >
              <option value="">Select a category</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {error && <span className="error">{error}</span>}
          </div>
        );

      case 'nps':
        return (
          <div key={field.type} className="feedback-field">
            <label>{field.label} {field.required && '*'}</label>
            <div className="nps-container">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <button
                  key={score}
                  type="button"
                  className={`nps-btn ${value === score ? 'active' : ''}`}
                  onClick={() => updateFormData('rating', score)}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="nps-labels">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
            {error && <span className="error">{error}</span>}
          </div>
        );

      default:
        return null;
    }
  };

  if (!state.isVisible) return null;

  if (state.isMinimized) {
    return (
      <div
        className={`feedback-widget minimized ${config.position}`}
        style={{
          backgroundColor: config.appearance.colors.primary,
          borderRadius: `${config.appearance.borderRadius}px`
        }}
      >
        <button onClick={maximizeWidget} className="minimize-btn">
          💬 Feedback
        </button>
      </div>
    );
  }

  return (
    <div
      ref={widgetRef}
      className={`feedback-widget ${config.position} ${config.appearance.theme}`}
      style={{
        backgroundColor: config.appearance.colors.background,
        color: config.appearance.colors.text,
        borderRadius: `${config.appearance.borderRadius}px`,
        fontFamily: config.appearance.fontFamily,
        fontSize: config.appearance.fontSize
      }}
    >
      <div className="widget-header">
        <h3>Share your feedback</h3>
        <div className="header-actions">
          <button onClick={minimizeWidget} className="minimize-btn">−</button>
          <button onClick={hideWidget} className="close-btn">×</button>
        </div>
      </div>

      <div className="widget-content">
        {state.hasSubmitted ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>Thank you for your feedback!</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submitFeedback(); }}>
            {config.fields.map(renderField)}

            <div className="form-actions">
              <button
                type="submit"
                disabled={state.isSubmitting}
                className="submit-btn"
                style={{
                  backgroundColor: config.appearance.colors.primary,
                  color: config.appearance.colors.background
                }}
              >
                {state.isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};