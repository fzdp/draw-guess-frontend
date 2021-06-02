class IdleMonitor {
  constructor(options) {
    const defaultOptions = {
      timeout: 5 * 60,
      events: ['mousemove', 'touchmove', 'mousedown', 'touchstart', 'keydown'],
      onIdle() {
        console.log("IdleMonitor: idle timeout")
      }
    };
    this.config = Object.assign({}, defaultOptions, options);
    this.idleTimer = null;
    this.resetIdleTimer = () => {
      clearTimeout(this.idleTimer);
      this._startIdleTimer();
    }
  }

  _startIdleTimer() {
    this.idleTimer = setTimeout(() => {
      this.config.onIdle();
      this.stop();
    }, this.config.timeout * 1000);
  }

  start() {
    this.resetIdleTimer();
    this.config.events.forEach((event) => {
      window.addEventListener(event, this.resetIdleTimer);
    });
    return this;
  }

  stop() {
    this.config.events.forEach((event) => {
      window.removeEventListener(event, this.resetIdleTimer);
    });
    clearTimeout(this.idleTimer);
    return this;
  }
}

export default IdleMonitor;
