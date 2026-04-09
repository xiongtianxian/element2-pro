import { once, on, off } from 'element-ui/src/utils/dom';
import { isMac } from 'element-ui/src/utils/util';

export default {
  bind(el, binding, vnode) {
    let interval = null;
    let startTime;
    const maxIntervals = isMac() ? 100 : 200;
    const handler = () => vnode.context[binding.expression].apply();
    const clear = () => {
      if (Date.now() - startTime < maxIntervals) {
        handler();
      }
      clearInterval(interval);
      interval = null;
    };

    // 把 handler 挂到 el 上，方便 unbind 时移除
    el._mousedownHandler = (e) => {
      if (e.button !== 0) return;
      startTime = Date.now();
      once(document, 'mouseup', clear);
      clearInterval(interval);
      interval = setInterval(handler, maxIntervals);
    };

    on(el, 'mousedown', el._mousedownHandler);
    el._clearHandler = clear; // 存下来
  },

  // 👇👇👇 【关键修复：组件销毁时自动解绑事件】
  unbind(el) {
    // 移除事件
    off(el, 'mousedown', el._mousedownHandler);
    // 清理定时器
    if (el._clearHandler) {
      el._clearHandler();
    }
    // 删除引用，帮助GC回收
    delete el._mousedownHandler;
    delete el._clearHandler;
  }
};