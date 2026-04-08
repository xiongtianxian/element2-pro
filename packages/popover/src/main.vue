<template>
  <span>
    <transition
        :name="transition"
        @after-enter="handleAfterEnter"
        @after-leave="handleAfterLeave">
      <div
          class="el-popover el-popper"
          :class="[popperClass, content && 'el-popover--plain']"
          ref="popper"
          v-show="!disabled && showPopper"
          :style="{ width: width + 'px' }"
          role="tooltip"
          :id="tooltipId"
          :aria-hidden="(disabled || !showPopper) ? 'true' : 'false'"
      >
        <div class="el-popover__title" v-if="title" v-text="title"></div>
        <slot>{{ content }}</slot>
      </div>
    </transition>
    <span class="el-popover__reference-wrapper" ref="wrapper" >
      <slot name="reference"></slot>
    </span>
  </span>
</template>

<script>
import Popper from 'element-ui/src/utils/vue-popper';
import { on, off } from 'element-ui/src/utils/dom';
import { addClass, removeClass } from 'element-ui/src/utils/dom';
import { generateId } from 'element-ui/src/utils/util';

export default {
  name: 'ElPopover',

  mixins: [Popper],

  props: {
    trigger: {
      type: String,
      default: 'click',
      validator: value => ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
    },
    openDelay: {
      type: Number,
      default: 0
    },
    closeDelay: {
      type: Number,
      default: 200
    },
    title: String,
    disabled: Boolean,
    content: String,
    reference: {},
    popperClass: String,
    width: {},
    visibleArrow: {
      default: true
    },
    arrowOffset: {
      type: Number,
      default: 0
    },
    transition: {
      type: String,
      default: 'fade-in-linear'
    },
    tabindex: {
      type: Number,
      default: 0
    }
  },

  computed: {
    tooltipId() {
      return `el-popover-${generateId()}`;
    }
  },
  watch: {
    showPopper(val) {
      if (this.disabled) {
        return;
      }
      val ? this.$emit('show') : this.$emit('hide');
    }
  },

  mounted() {
    let reference = this.referenceElm = this.reference || this.$refs.reference;
    const popper = this.popper || this.$refs.popper;

    if (!reference && this.$refs.wrapper.children) {
      reference = this.referenceElm = this.$refs.wrapper.children[0];
    }
    if (reference) {
      addClass(reference, 'el-popover__reference');
      reference.setAttribute('aria-describedby', this.tooltipId);
      reference.setAttribute('tabindex', this.tabindex);
      popper.setAttribute('tabindex', 0);

      if (this.trigger !== 'click') {
        // ✅ 修复：使用具名函数，不再使用匿名函数！
        on(reference, 'focusin', this._handleReferenceFocusin);
        on(popper, 'focusin', this.handleFocus);
        on(reference, 'focusout', this.handleBlur);
        on(popper, 'focusout', this.handleBlur);
      }
      on(reference, 'keydown', this.handleKeydown);
      on(reference, 'click', this.handleClick);
    }
    if (this.trigger === 'click') {
      on(reference, 'click', this.doToggle);
      on(document, 'click', this.handleDocumentClick);
    } else if (this.trigger === 'hover') {
      on(reference, 'mouseenter', this.handleMouseEnter);
      on(popper, 'mouseenter', this.handleMouseEnter);
      on(reference, 'mouseleave', this.handleMouseLeave);
      on(popper, 'mouseleave', this.handleMouseLeave);
    } else if (this.trigger === 'focus') {
      if (this.tabindex < 0) {
        console.warn('[Element Warn][Popover]a negative taindex means that the element cannot be focused by tab key');
      }
      if (reference.querySelector('input, textarea')) {
        on(reference, 'focusin', this.doShow);
        on(reference, 'focusout', this.doClose);
      } else {
        on(reference, 'mousedown', this.doShow);
        on(reference, 'mouseup', this.doClose);
      }
    }
  },

  // ✅ 修复：强制关闭 + 销毁 popper
  beforeDestroy() {
    // 1. 强制失焦
    if (document.activeElement && this.$el.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    // 3. 清理定时器
    this.cleanup();

    // 4. 立即销毁popper
    this.doDestroy();
  },

  deactivated() {
    this.cleanup();
  },

  methods: {
    // ✅ 修复：把匿名函数抽出来，变成具名函数，方便解绑
    _handleReferenceFocusin() {
      this.handleFocus();
      const instance = this.referenceElm.__vue__;
      if (instance && typeof instance.focus === 'function') {
        instance.focus();
      }
    },

    doToggle() {
      this.showPopper = !this.showPopper;
    },
    doShow() {
      this.showPopper = true;
    },
    doClose() {
      this.showPopper = false;
    },
    handleFocus() {
      addClass(this.referenceElm, 'focusing');
      if (this.trigger === 'click' || this.trigger === 'focus') this.showPopper = true;
    },
    handleClick() {
      removeClass(this.referenceElm, 'focusing');
    },
    handleBlur() {
      removeClass(this.referenceElm, 'focusing');
      if (this.trigger === 'click' || this.trigger === 'focus') this.showPopper = false;
    },
    handleMouseEnter() {
      clearTimeout(this._timer);
      if (this.openDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = true;
        }, this.openDelay);
      } else {
        this.showPopper = true;
      }
    },
    handleKeydown(ev) {
      if (ev.keyCode === 27 && this.trigger !== 'manual') {
        this.doClose();
      }
    },
    handleMouseLeave() {
      clearTimeout(this._timer);
      if (this.closeDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = false;
        }, this.closeDelay);
      } else {
        this.showPopper = false;
      }
    },
    handleDocumentClick(e) {
      let reference = this.reference || this.$refs.reference;
      const popper = this.popper || this.$refs.popper;

      if (!reference && this.$refs.wrapper.children) {
        reference = this.referenceElm = this.$refs.wrapper.children[0];
      }
      if (!this.$el || !reference || this.$el.contains(e.target) || reference.contains(e.target) || !popper || popper.contains(e.target)) return;
      this.showPopper = false;
    },
    handleAfterEnter() {
      this.$emit('after-enter');
    },
    handleAfterLeave() {
      this.$emit('after-leave');
      this.doDestroy();
    },
    cleanup() {
      clearTimeout(this._timer);
    }
  },

  destroyed() {
    const ref = this.referenceElm;
    const popper = this.$refs.popper;

    if (ref) {
      off(ref, 'keydown', this.handleKeydown);
      off(ref, 'click', this.handleClick);
      // ✅ 修复：解绑抽出来的具名函数
      off(ref, 'focusin', this._handleReferenceFocusin);
      off(ref, 'focusout', this.handleBlur);
      off(ref, 'click', this.doToggle);
      off(ref, 'mouseenter', this.handleMouseEnter);
      off(ref, 'mouseleave', this.handleMouseLeave);
      off(ref, 'mousedown', this.doShow);
      off(ref, 'mouseup', this.doClose);
      off(ref, 'focusin', this.doShow);
      off(ref, 'focusout', this.doClose);
    }
    if (popper) {
      off(popper, 'focusin', this.handleFocus);
      off(popper, 'focusout', this.handleBlur);
      off(popper, 'mouseenter', this.handleMouseEnter);
      off(popper, 'mouseleave', this.handleMouseLeave);
    }
    off(document, 'click', this.handleDocumentClick);

    if (this.popperJS) {
      this.popperJS.destroy();
      this.popperJS = null;
    }

    this.referenceElm = null;
    this.$el = null;
    this.$off();
  }
};
</script>