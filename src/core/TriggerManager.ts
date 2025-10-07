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