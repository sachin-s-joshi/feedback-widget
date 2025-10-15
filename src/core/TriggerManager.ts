import { TriggerConfig } from '../types';

export class TriggerManager {
  private triggers: TriggerConfig[];
  private callbacks: Map<string, () => void> = new Map();
  private observers: Map<string, any> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private sessionStorage: Storage | null = null;

  constructor(triggers: TriggerConfig[]) {
    this.triggers = triggers;
    this.sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : null;
    this.initializeTriggers();
  }

  private initializeTriggers(): void {
    this.triggers.forEach((trigger, index) => {
      const triggerId = `trigger_${index}`;

      switch (trigger.type) {
        case 'page':
          this.setupPageTrigger(trigger, triggerId);
          break;
        case 'time':
          this.setupTimeTrigger(trigger, triggerId);
          break;
        case 'scroll':
          this.setupScrollTrigger(trigger, triggerId);
          break;
        case 'exit-intent':
          this.setupExitIntentTrigger(trigger, triggerId);
          break;
        case 'element-click':
          this.setupElementClickTrigger(trigger, triggerId);
          break;
        case 'rage-click':
          this.setupRageClickTrigger(trigger, triggerId);
          break;
        case 'confused-navigation':
          this.setupConfusedNavigationTrigger(trigger, triggerId);
          break;
        case 'datalayer-event':
          this.setupDataLayerEventTrigger(trigger, triggerId);
          break;
        case 'manual':
          break;
      }
    });
  }

  public onTrigger(callback: () => void): void {
    this.triggers.forEach((_, index) => {
      const triggerId = `trigger_${index}`;
      this.callbacks.set(triggerId, callback);
    });
  }

  private shouldTrigger(trigger: TriggerConfig, triggerId: string): boolean {
    if (!this.sessionStorage) return true;

    const frequency = trigger.conditions.frequency || 'once';
    const storageKey = `feedback_widget_${triggerId}`;

    switch (frequency) {
      case 'once':
        return !localStorage.getItem(storageKey);
      case 'session':
        return !this.sessionStorage.getItem(storageKey);
      case 'always':
        return true;
      default:
        return true;
    }
  }

  private markTriggered(trigger: TriggerConfig, triggerId: string): void {
    if (!this.sessionStorage) return;

    const frequency = trigger.conditions.frequency || 'once';
    const storageKey = `feedback_widget_${triggerId}`;
    const timestamp = Date.now().toString();

    switch (frequency) {
      case 'once':
        localStorage.setItem(storageKey, timestamp);
        break;
      case 'session':
        this.sessionStorage.setItem(storageKey, timestamp);
        break;
    }
  }

  private executeTrigger(trigger: TriggerConfig, triggerId: string): void {
    if (!this.shouldTrigger(trigger, triggerId)) return;

    const callback = this.callbacks.get(triggerId);
    if (callback) {
      callback();
      this.markTriggered(trigger, triggerId);
    }
  }

  private setupPageTrigger(trigger: TriggerConfig, triggerId: string): void {
    if (typeof window === 'undefined') return;

    const checkPage = () => {
      const currentPage = window.location.pathname;
      const pages = trigger.conditions.pages || [];

      if (pages.length === 0 || pages.some(page => {
        if (page.includes('*')) {
          const regex = new RegExp(page.replace(/\*/g, '.*'));
          return regex.test(currentPage);
        }
        return currentPage === page;
      })) {
        this.executeTrigger(trigger, triggerId);
      }
    };

    checkPage();

    window.addEventListener('popstate', checkPage);

    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(checkPage, 0);
    };
  }

  private setupTimeTrigger(trigger: TriggerConfig, triggerId: string): void {
    const delay = trigger.conditions.timeDelay || 5000;

    const timer = setTimeout(() => {
      this.executeTrigger(trigger, triggerId);
    }, delay);

    this.timers.set(triggerId, timer);
  }

  private setupScrollTrigger(trigger: TriggerConfig, triggerId: string): void {
    if (typeof window === 'undefined') return;

    const targetPercentage = trigger.conditions.scrollPercentage || 50;
    let triggered = false;

    const handleScroll = () => {
      if (triggered) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;

      if (scrollPercentage >= targetPercentage) {
        triggered = true;
        this.executeTrigger(trigger, triggerId);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private setupExitIntentTrigger(trigger: TriggerConfig, triggerId: string): void {
    if (typeof window === 'undefined') return;

    let triggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return;
      if (e.clientY <= 0) {
        triggered = true;
        this.executeTrigger(trigger, triggerId);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
  }

  private setupElementClickTrigger(trigger: TriggerConfig, triggerId: string): void {
    if (typeof window === 'undefined') return;

    const selector = trigger.conditions.elementSelector;
    if (!selector) return;

    const handleClick = (e: Event) => {
      const target = e.target as Element;
      if (target.matches(selector)) {
        this.executeTrigger(trigger, triggerId);
      }
    };

    document.addEventListener('click', handleClick);
  }

  private setupRageClickTrigger(trigger: TriggerConfig, triggerId: string): void {
    if (typeof window === 'undefined') return;

    const rageConfig = trigger.conditions.rageClick || {};
    const clickThreshold = rageConfig.clickThreshold || 3;
    const timeWindow = rageConfig.timeWindow || 2000;
    const targetSelector = rageConfig.elementSelector;
    const excludeSelectors = rageConfig.excludeSelectors || [];

    const clickHistory: { element: Element; timestamp: number; x: number; y: number }[] = [];

    const isExcluded = (element: Element): boolean => {
      return excludeSelectors.some(selector => element.matches(selector));
    };

    const isClickable = (element: Element): boolean => {
      const tagName = element.tagName.toLowerCase();
      const clickableTags = ['button', 'a', 'input', 'select', 'textarea'];

      return clickableTags.includes(tagName) ||
             element.hasAttribute('onclick') ||
             element.hasAttribute('role') ||
             window.getComputedStyle(element).cursor === 'pointer';
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const now = Date.now();

      // Check if target matches selector (if specified) or is clickable
      if (targetSelector && !target.matches(targetSelector)) return;
      if (!targetSelector && !isClickable(target)) return;
      if (isExcluded(target)) return;

      // Clean old clicks outside time window
      const recentClicks = clickHistory.filter(click => now - click.timestamp <= timeWindow);
      clickHistory.length = 0;
      clickHistory.push(...recentClicks);

      // Add current click
      clickHistory.push({
        element: target,
        timestamp: now,
        x: e.clientX,
        y: e.clientY
      });

      // Check for rage click pattern
      if (clickHistory.length >= clickThreshold) {
        const sameElementClicks = clickHistory.filter(click =>
          click.element === target || click.element.isSameNode(target)
        );

        const nearbyClicks = clickHistory.filter(click => {
          const distance = Math.sqrt(
            Math.pow(click.x - e.clientX, 2) + Math.pow(click.y - e.clientY, 2)
          );
          return distance <= 50; // Within 50px radius
        });

        // Trigger if same element clicked multiple times OR clicks in small area
        if (sameElementClicks.length >= clickThreshold || nearbyClicks.length >= clickThreshold) {
          this.executeTrigger(trigger, triggerId);
          clickHistory.length = 0; // Reset after triggering
        }
      }
    };

    document.addEventListener('click', handleClick);
  }

  private setupConfusedNavigationTrigger(trigger: TriggerConfig, triggerId: string): void {
    if (typeof window === 'undefined') return;

    const confusedConfig = trigger.conditions.confusedNavigation || {};
    const backAndForthThreshold = confusedConfig.backAndForthThreshold || 3;
    const timeWindow = confusedConfig.timeWindow || 30000;
    const scrollJumpThreshold = confusedConfig.scrollJumpThreshold || 5;
    const mouseMovementThreshold = confusedConfig.mouseMovementThreshold || 100;
    const inactivityThreshold = confusedConfig.inactivityThreshold || 10000;

    let navigationHistory: { url: string; timestamp: number; direction: 'forward' | 'back' }[] = [];
    let scrollHistory: { position: number; timestamp: number }[] = [];
    let mouseHistory: { x: number; y: number; timestamp: number }[] = [];
    let lastActivity = Date.now();
    let confusionScore = 0;

    // Track page navigation
    let currentUrl = window.location.href;
    const trackNavigation = (direction: 'forward' | 'back') => {
      const now = Date.now();
      navigationHistory = navigationHistory.filter(nav => now - nav.timestamp <= timeWindow);
      navigationHistory.push({ url: currentUrl, timestamp: now, direction });

      // Check for back-and-forth navigation
      if (navigationHistory.length >= backAndForthThreshold) {
        const recentNavs = navigationHistory.slice(-backAndForthThreshold);
        const backForward = recentNavs.filter((nav, i) => i > 0 && nav.direction !== recentNavs[i-1].direction);

        if (backForward.length >= Math.floor(backAndForthThreshold / 2)) {
          confusionScore += 2;
        }
      }

      checkConfusionLevel();
    };

    // Track scroll behavior
    const trackScroll = () => {
      const now = Date.now();
      const scrollPosition = window.pageYOffset;

      scrollHistory = scrollHistory.filter(scroll => now - scroll.timestamp <= 5000); // 5 second window
      scrollHistory.push({ position: scrollPosition, timestamp: now });

      // Check for rapid scroll jumps
      if (scrollHistory.length >= scrollJumpThreshold) {
        const positions = scrollHistory.map(s => s.position);
        const jumps = positions.slice(1).map((pos, i) => Math.abs(pos - positions[i]));
        const largeJumps = jumps.filter(jump => jump > 500).length; // 500px+ jumps

        if (largeJumps >= Math.floor(scrollJumpThreshold / 2)) {
          confusionScore += 1;
        }
      }

      lastActivity = now;
      checkConfusionLevel();
    };

    // Track mouse movement patterns
    const trackMouseMovement = (e: MouseEvent) => {
      const now = Date.now();
      mouseHistory = mouseHistory.filter(mouse => now - mouse.timestamp <= 3000); // 3 second window
      mouseHistory.push({ x: e.clientX, y: e.clientY, timestamp: now });

      // Check for erratic mouse movement
      if (mouseHistory.length >= mouseMovementThreshold) {
        const movements = mouseHistory.slice(1).map((mouse, i) => {
          const prev = mouseHistory[i];
          return Math.sqrt(Math.pow(mouse.x - prev.x, 2) + Math.pow(mouse.y - prev.y, 2));
        });

        const totalDistance = movements.reduce((sum, dist) => sum + dist, 0);
        const directDistance = Math.sqrt(
          Math.pow(mouseHistory[mouseHistory.length - 1].x - mouseHistory[0].x, 2) +
          Math.pow(mouseHistory[mouseHistory.length - 1].y - mouseHistory[0].y, 2)
        );

        // High ratio indicates erratic movement
        const erraticRatio = totalDistance / (directDistance + 1);
        if (erraticRatio > 5) {
          confusionScore += 1;
        }
      }

      lastActivity = now;
    };

    // Check for inactivity periods
    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivity > inactivityThreshold) {
        confusionScore += 1;
        lastActivity = now;
      }
    };

    // Evaluate confusion level
    const checkConfusionLevel = () => {
      if (confusionScore >= 3) { // Threshold for triggering feedback
        this.executeTrigger(trigger, triggerId);
        // Reset confusion tracking
        confusionScore = 0;
        navigationHistory = [];
        scrollHistory = [];
        mouseHistory = [];
      }
    };

    // Set up event listeners
    window.addEventListener('popstate', () => trackNavigation('back'));

    // Override pushState and replaceState to track forward navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      currentUrl = window.location.href;
      trackNavigation('forward');
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      currentUrl = window.location.href;
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
    document.addEventListener('mousemove', trackMouseMovement, { passive: true });

    // Periodic inactivity check
    const inactivityInterval = setInterval(checkInactivity, inactivityThreshold / 2);
    this.timers.set(`${triggerId}_inactivity`, inactivityInterval as any);
  }

  private setupDataLayerEventTrigger(trigger: TriggerConfig, triggerId: string): void {
    if (typeof window === 'undefined') return;

    const eventConfig = trigger.conditions.dataLayerEvent;
    if (!eventConfig || !eventConfig.eventName) return;

    const objectName = eventConfig.objectName || 'dataLayer';
    const matchType = eventConfig.matchType || 'exists';
    const debounceTime = eventConfig.debounceTime || 1000;

    let debounceTimer: NodeJS.Timeout | null = null;

    // Ensure dataLayer exists
    if (!(window as any)[objectName]) {
      (window as any)[objectName] = [];
    }

    const dataLayer = (window as any)[objectName];

    // Function to check if event matches criteria
    const matchesEvent = (event: any): boolean => {
      if (!event || typeof event !== 'object') return false;
      if (event.event !== eventConfig.eventName) return false;

      const eventProperties = eventConfig.eventProperties;
      if (!eventProperties) return true; // Just check event name exists

      switch (matchType) {
        case 'exact':
          return Object.keys(eventProperties).every(key =>
            event[key] === eventProperties[key]
          );

        case 'partial':
          return Object.keys(eventProperties).some(key =>
            event[key] === eventProperties[key]
          );

        case 'exists':
        default:
          return Object.keys(eventProperties).every(key =>
            event.hasOwnProperty(key)
          );
      }
    };

    // Handle dataLayer push events
    const handleDataLayerEvent = (event: any) => {
      if (matchesEvent(event)) {
        // Debounce to prevent multiple triggers for the same event
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          this.executeTrigger(trigger, triggerId);
          debounceTimer = null;
        }, debounceTime);
      }
    };

    // Check existing events in dataLayer
    if (Array.isArray(dataLayer)) {
      dataLayer.forEach(handleDataLayerEvent);
    }

    // Override dataLayer push to intercept new events
    const originalPush = dataLayer.push;
    dataLayer.push = function(...events: any[]) {
      const result = originalPush.apply(this, events);
      events.forEach(handleDataLayerEvent);
      return result;
    };

    // Also listen for direct property assignment (some implementations)
    if (typeof Proxy !== 'undefined') {
      try {
        const proxiedDataLayer = new Proxy(dataLayer, {
          set(target, property, value) {
            if (typeof property === 'string' && !isNaN(Number(property))) {
              handleDataLayerEvent(value);
            }
            target[property as any] = value;
            return true;
          }
        });

        // Replace the dataLayer with the proxied version
        (window as any)[objectName] = proxiedDataLayer;
      } catch (e) {
        // Fallback if Proxy is not supported or fails
        console.warn('DataLayer proxy setup failed, using push override only');
      }
    }

    // For Google Tag Manager compatibility - listen for gtm events
    if (objectName === 'dataLayer' && typeof (window as any).google_tag_manager !== 'undefined') {
      // GTM specific event listening can be added here
      const checkGTMEvents = () => {
        const gtm = (window as any).google_tag_manager;
        if (gtm && gtm.dataLayer && gtm.dataLayer.get) {
          try {
            const eventName = gtm.dataLayer.get('event');
            if (eventName === eventConfig.eventName) {
              const eventData = { event: eventName };

              // Try to get additional properties if specified
              if (eventConfig.eventProperties) {
                Object.keys(eventConfig.eventProperties).forEach(key => {
                  try {
                    (eventData as any)[key] = gtm.dataLayer.get(key);
                  } catch (e) {
                    // Ignore if property can't be accessed
                  }
                });
              }

              handleDataLayerEvent(eventData);
            }
          } catch (e) {
            // Ignore GTM access errors
          }
        }
      };

      // Poll for GTM events (as a fallback)
      const gtmInterval = setInterval(checkGTMEvents, 500);
      this.timers.set(`${triggerId}_gtm`, gtmInterval as any);
    }
  }

  public triggerManually(triggerIndex: number = 0): void {
    const trigger = this.triggers[triggerIndex];
    const triggerId = `trigger_${triggerIndex}`;

    if (trigger) {
      this.executeTrigger(trigger, triggerId);
    }
  }

  public destroy(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.observers.forEach(observer => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers.clear();
    this.callbacks.clear();
  }
}