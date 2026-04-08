import Popper from 'element-ui/src/utils/vue-popper';
import debounce from 'throttle-debounce/debounce';
import { addClass, removeClass, on, off } from 'element-ui/src/utils/dom';
import { generateId } from 'element-ui/src/utils/util';
import Vue from 'vue';

export default {
  name: 'ElTooltip',

  mixins: [Popper],

  props: {
    openDelay: {
      type: Number,
      default: 0
    },
    disabled: Boolean,
    manual: Boolean,
    effect: {
      type: String,
      default: 'dark'
    },
    arrowOffset: {
      type: Number,
      default: 0
    },
    popperClass: String,
    content: String,
    visibleArrow: {
      default: true
    },
    transition: {
      type: String,
      default: 'el-fade-in-linear'
    },
    popperOptions: {
      default() {
        return {
          boundariesPadding: 10,
          gpuAcceleration: false
        };
      }
    },
    enterable: {
      type: Boolean,
      default: true
    },
    hideAfter: {
      type: Number,
      default: 0
    },
    tabindex: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      tooltipId: `el-tooltip-${generateId()}`,
      timeoutPending: null,
      focusing: false,
      // 保存事件处理函数引用，用于销毁时解绑
      _focusHandler: null,
      // 保存定时器引用，用于销毁时清除
      _showTimeout: null,
      _hideTimeout: null
    };
  },

  beforeCreate() {
    if (this.$isServer) return;

    this.popperVM = new Vue({
      data: { node: '' },
      render(h) {
        return this.node;
      }
    }).$mount();

    // 保存 debounce 引用，用于销毁时取消
    this.debounceClose = debounce(200, () => this.handleClosePopper());
  },

  render(h) {
    if (this.popperVM) {
      this.popperVM.node = (
          <transition
              name={ this.transition }
              onAfterLeave={ this.doDestroy }>
            <div
                onMouseleave={ () => { this.setExpectedState(false); this.debounceClose(); } }
                onMouseenter= { () => { this.setExpectedState(true); } }
                ref="popper"
                role="tooltip"
                id={this.tooltipId}
                aria-hidden={ (this.disabled || !this.showPopper) ? 'true' : 'false' }
                v-show={!this.disabled && this.showPopper}
                class={
                  ['el-tooltip__popper', 'is-' + this.effect, this.popperClass]
                }>
              { this.$slots.content || this.content }
            </div>
          </transition>);
    }

    const firstElement = this.getFirstElement();
    if (!firstElement) return null;

    const data = firstElement.data = firstElement.data || {};
    data.staticClass = this.addTooltipClass(data.staticClass);

    return firstElement;
  },

  mounted() {
    this.referenceElm = this.$el;
    if (this.$el.nodeType === 1) {
      this.$el.setAttribute('aria-describedby', this.tooltipId);
      this.$el.setAttribute('tabindex', this.tabindex);
      on(this.referenceElm, 'mouseenter', this.show);
      on(this.referenceElm, 'mouseleave', this.hide);

      // 抽离 focus 处理函数，保存引用
      this._focusHandler = this.createFocusHandler();
      on(this.referenceElm, 'focus', this._focusHandler);

      on(this.referenceElm, 'blur', this.handleBlur);
      on(this.referenceElm, 'click', this.removeFocusing);
    }
    // fix issue https://github.com/ElemeFE/element/issues/14424
    if (this.value && this.popperVM) {
      this.popperVM.$nextTick(() => {
        if (this.value) {
          this.updatePopper();
        }
      });
    }
  },

  watch: {
    focusing(val) {
      if (val) {
        addClass(this.referenceElm, 'focusing');
      } else {
        removeClass(this.referenceElm, 'focusing');
      }
    }
  },

  methods: {
    // 抽离 focus 逻辑为独立方法
    createFocusHandler() {
      const vm = this;
      return function focusHandler() {
        if (!vm.$slots.default || !vm.$slots.default.length) {
          vm.handleFocus();
          return;
        }
        const instance = vm.$slots.default[0].componentInstance;
        if (instance && instance.focus) {
          instance.focus();
        } else {
          vm.handleFocus();
        }
      };
    },

    show() {
      this.setExpectedState(true);
      this.handleShowPopper();
    },

    hide() {
      this.setExpectedState(false);
      this.debounceClose();
    },

    handleFocus() {
      this.focusing = true;
      this.show();
    },

    handleBlur() {
      this.focusing = false;
      this.hide();
    },

    removeFocusing() {
      this.focusing = false;
    },

    addTooltipClass(prev) {
      if (!prev) {
        return 'el-tooltip';
      } else {
        return 'el-tooltip ' + prev.replace('el-tooltip', '');
      }
    },

    handleShowPopper() {
      if (!this.expectedState || this.manual) return;
      // 清除旧定时器，保存新定时器引用
      clearTimeout(this._showTimeout);
      this._showTimeout = setTimeout(() => {
        this.showPopper = true;
      }, this.openDelay);

      if (this.hideAfter > 0) {
        clearTimeout(this._hideTimeout);
        this._hideTimeout = setTimeout(() => {
          this.showPopper = false;
        }, this.hideAfter);
      }
    },

    handleClosePopper() {
      if (this.enterable && this.expectedState || this.manual) return;
      // 清除所有定时器
      clearTimeout(this._showTimeout);
      clearTimeout(this._hideTimeout);

      this.showPopper = false;

      if (this.disabled) {
        this.doDestroy();
      }
    },

    setExpectedState(expectedState) {
      if (expectedState === false) {
        clearTimeout(this._hideTimeout);
      }
      this.expectedState = expectedState;
    },

    getFirstElement() {
      const slots = this.$slots.default;
      if (!Array.isArray(slots)) return null;
      let element = null;
      for (let index = 0; index < slots.length; index++) {
        if (slots[index] && slots[index].tag) {
          element = slots[index];
          break;
        };
      }
      return element;
    },

    // 新增：彻底销毁 popperVM 和所有引用
    doDestroy() {
      if (this.popperVM) {
        // 先销毁 popperVM
        this.popperVM.$destroy();
        // 手动清空 popperVM 所有引用
        this.popperVM.node = null;
        this.popperVM = null;
      }
      // 清空 popper DOM 引用
      if (this.$refs.popper) {
        this.$refs.popper = null;
      }
    }
  },

  beforeDestroy() {
    // 1. 先清除所有定时器
    clearTimeout(this._showTimeout);
    clearTimeout(this._hideTimeout);
    this._showTimeout = null;
    this._hideTimeout = null;

    // 2. 取消 debounce 闭包
    if (this.debounceClose && this.debounceClose.cancel) {
      this.debounceClose.cancel();
    }
    this.debounceClose = null;

    // 3. 销毁 popperVM
    if (this.popperVM) {
      this.popperVM.$destroy();
      this.popperVM = null;
    }

    // 4. 清空所有状态
    this.showPopper = false;
    this.expectedState = false;
    this.focusing = false;
  },

  destroyed() {
    const reference = this.referenceElm;
    if (reference && reference.nodeType === 1) {
      // 解绑所有事件监听器
      off(reference, 'mouseenter', this.show);
      off(reference, 'mouseleave', this.hide);
      this._focusHandler && off(reference, 'focus', this._focusHandler);
      off(reference, 'blur', this.handleBlur);
      off(reference, 'click', this.removeFocusing);

      // 移除 DOM 属性
      reference.removeAttribute('aria-describedby');
      reference.removeAttribute('tabindex');
      removeClass(reference, 'focusing');
    }

    // 彻底释放所有引用
    this.referenceElm = null;
    this._focusHandler = null;
    this.$el = null;
    this.$slots = null;
    this.$parent = null;
    this.$root = null;
  }
};