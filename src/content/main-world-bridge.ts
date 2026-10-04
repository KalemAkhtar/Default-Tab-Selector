(function bridgeMainWorldNavigation() {
  const NAVIGATION_EVENT = 'ppmt:navigation';

  function notify(): void {
    window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT));
  }

  (['pushState', 'replaceState'] as const).forEach((method) => {
    const original = history[method];
    history[method] = function patched(
      this: History,
      ...args: Parameters<History[typeof method]>
    ): ReturnType<History[typeof method]> {
      const result = original.apply(this, args);
      notify();
      return result;
    };
  });
})();
