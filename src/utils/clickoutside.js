const ctx = '__click_outside__';

export default {
  bind(el, binding) {
    const handler = (e) => {
      if (!el.contains(e.target) && el !== e.target) {
        binding.value && binding.value(e);
      }
    };
    el[ctx] = { handler };
    document.addEventListener('click', handler);
  },

  update(el, binding) {
    if (el[ctx]) {
      document.removeEventListener('click', el[ctx].handler);
    }
    const handler = (e) => {
      if (!el.contains(e.target) && el !== e.target) {
        binding.value && binding.value(e);
      }
    };
    el[ctx].handler = handler;
    document.addEventListener('click', handler);
  },

  unbind(el) {
    if (el[ctx]) {
      // ✅ 关键：销毁时一定移除监听！！！
      document.removeEventListener('click', el[ctx].handler);
      delete el[ctx];
    }
  }
};