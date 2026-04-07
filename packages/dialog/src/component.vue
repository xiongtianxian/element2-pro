<template>
  <transition
      name="dialog-fade"
      @after-enter="afterEnter"
      @after-leave="afterLeave">
    <div
        v-show="visible"
        class="el-dialog__wrapper"
        @click.self="handleWrapperClick">
      <div
          role="dialog"
          :key="key"
          aria-modal="true"
          :aria-label="title || 'dialog'"
          :class="['el-dialog', { 'is-fullscreen': fullscreen, 'el-dialog--center': center }, customClass]"
          ref="dialog"
          :style="style">
        <div class="el-dialog__header">
          <slot name="title">
            <span class="el-dialog__title">{{ title }}</span>
          </slot>
          <button
              type="button"
              class="el-dialog__headerbtn"
              aria-label="Close"
              v-if="showClose"
              @click="handleClose">
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>
        <div class="el-dialog__body" v-if="rendered"><slot></slot></div>
        <div class="el-dialog__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Popup from 'element-ui/src/utils/popup';
import Migrating from 'element-ui/src/mixins/migrating';
import emitter from 'element-ui/src/mixins/emitter';

export default {
  name: 'ElDialog',

  mixins: [Popup, emitter, Migrating],

  props: {
    title: {
      type: String,
      default: ''
    },

    modal: {
      type: Boolean,
      default: true
    },

    modalAppendToBody: {
      type: Boolean,
      default: true
    },

    appendToBody: {
      type: Boolean,
      default: false
    },

    lockScroll: {
      type: Boolean,
      default: true
    },

    closeOnClickModal: {
      type: Boolean,
      default: true
    },

    closeOnPressEscape: {
      type: Boolean,
      default: true
    },

    showClose: {
      type: Boolean,
      default: true
    },

    width: String,

    fullscreen: Boolean,

    customClass: {
      type: String,
      default: ''
    },

    top: {
      type: String,
      default: '15vh'
    },
    beforeClose: Function,
    center: {
      type: Boolean,
      default: false
    },

    destroyOnClose: Boolean
  },

  data() {
    return {
      closed: false,
      key: 0
    };
  },

  watch: {
    visible(val) {
      if (val) {
        this.closed = false;
        this.$emit('open');
        // 添加安全判断，避免重复监听
        if (this.$el) {
          this.$el.addEventListener('scroll', this.updatePopper);
        }
        this.$nextTick(() => {
          if (this.$refs.dialog) {
            this.$refs.dialog.scrollTop = 0;
          }
        });
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
      } else {
        // 安全移除监听
        if (this.$el) {
          this.$el.removeEventListener('scroll', this.updatePopper);
        }
        if (!this.closed) this.$emit('close');
        if (this.destroyOnClose) {
          this.$nextTick(() => {
            this.key++;
          });
        }
      }
    }
  },

  computed: {
    style() {
      let style = {};
      if (!this.fullscreen) {
        style.marginTop = this.top;
        if (this.width) {
          style.width = this.width;
        }
      }
      return style;
    }
  },

  methods: {
    getMigratingConfig() {
      return {
        props: {
          'size': 'size is removed.'
        }
      };
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) return;
      this.handleClose();
    },
    handleClose() {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(this.hide);
      } else {
        this.hide();
      }
    },
    hide(cancel) {
      if (cancel !== false) {
        this.$emit('update:visible', false);
        this.$emit('close');
        this.closed = true;
      }
    },
    updatePopper() {
      this.broadcast('ElSelectDropdown', 'updatePopper');
      this.broadcast('ElDropdownMenu', 'updatePopper');
    },
    afterEnter() {
      this.$emit('opened');
    },
    afterLeave() {
      this.$emit('closed');
    }
  },

  mounted() {
    if (this.visible) {
      this.rendered = true;
      this.open();
      if (this.appendToBody) {
        document.body.appendChild(this.$el);
      }
    }
  },

  // 新增：核心销毁生命周期，统一回收所有资源
  beforeDestroy() {
    // 1. 强制移除 scroll 事件监听（最主要泄漏点）
    if (this.$el) {
      this.$el.removeEventListener('scroll', this.updatePopper);
    }

    // 2. 销毁 Popup 混入的全局事件/定时器/引用
    if (this.destroy) {
      this.destroy();
    }

    // 3. 关闭弹窗，重置状态
    this.closed = true;
  },

  destroyed() {
    // 强化：彻底清理 appendToBody 挂载的 DOM
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }

    // 清空引用，帮助 GC 回收
    this.$el = null;
  }
};
</script>