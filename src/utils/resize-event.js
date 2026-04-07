import throttle from 'throttle-debounce/throttle';

const resizeHandler = function(entries) {
  for (const entry of entries) {
    const listeners = entry.target.__resizeListeners__ || [];
    if (listeners.length) {
      listeners.forEach(item => {
        item.throttled();
      });
    }
  }
};

export const addResizeListener = function(element, fn) {
  if (!element || !fn) return;
  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = [];
    element.__ro__ = new ResizeObserver(resizeHandler);
    element.__ro__.observe(element);
  }
  // 保存原始函数和节流函数的引用
  const throttledFn = throttle(100, fn);
  element.__resizeListeners__.push({
    original: fn,
    throttled: throttledFn
  });
};

export const removeResizeListener = function(element, fn) {
  if (!element || !element.__resizeListeners__) return;
  for (let i = 0, len = element.__resizeListeners__.length; i < len; i++) {
    const item = element.__resizeListeners__[i];
    if (item.original === fn) {
      // 🔥 关键修复：销毁节流闭包，释放 wrapper()
      if (item.throttled && item.throttled.cancel) {
        item.throttled.cancel();
      }
      // 从数组中移除
      element.__resizeListeners__.splice(i, 1);
      break;
    }
  }
  // 没有监听时，彻底销毁 ResizeObserver
  if (!element.__resizeListeners__.length) {
    if (element.__ro__) {
      element.__ro__.disconnect();
      element.__ro__ = null; // 释放 ResizeObserver 实例
    }
    delete element.__resizeListeners__;
  }
};