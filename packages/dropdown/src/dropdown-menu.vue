<template>
  <transition name="el-zoom-in-top" @after-leave="doDestroy">
    <ul class="el-dropdown-menu el-popper" :class="[size && `el-dropdown-menu--${size}`]" v-show="showPopper">
      <slot></slot>
    </ul>
  </transition>
</template>
<script>
import Popper from 'element-ui/src/utils/vue-popper';

export default {
  name: 'ElDropdownMenu',
  componentName: 'ElDropdownMenu',
  mixins: [Popper],

  props: {
    visibleArrow: {type: Boolean, default: true},
    arrowOffset: {type: Number, default: 0}
  },

  data() {
    return {
      size: this.dropdown.dropdownSize
    };
  },

  inject: ['dropdown'],

  created() {
    // 事件绑定改成具名函数，方便销毁
    this.$on('updatePopper', this.handleUpdatePopper);
    this.$on('visible', this.handleVisibleChange);
  },

  // ======================
  // 最终修复：销毁时清理
  // ======================
  beforeDestroy() {
    // 1. 销毁事件
    this.$off('updatePopper', this.handleUpdatePopper);
    this.$off('visible', this.handleVisibleChange);

    // 2. 🔥 最关键：切断双向引用
    if (this.dropdown) {
      this.dropdown.popperElm = null;
    }

    // 3. popper 你已经优化过，会自动清理
    // 4. 额外清空自身引用
    this.popperElm = null;
    this.referenceElm = null;
  },

  // keep-alive 兼容
  deactivated() {
    this.beforeDestroy();
  },

  mounted() {
    this.dropdown.popperElm = this.popperElm = this.$el;
    this.referenceElm = this.dropdown.$el;
    this.dropdown.initDomOperation();
  },

  watch: {
    'dropdown.placement': {
      immediate: true,
      handler(val) {
        this.currentPlacement = val;
      }
    }
  },

  methods: {
    handleUpdatePopper() {
      if (this.showPopper) this.updatePopper();
    },
    handleVisibleChange(val) {
      this.showPopper = val;
    }
  }
};
</script>