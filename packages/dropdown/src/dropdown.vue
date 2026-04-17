<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  import Emitter from 'element-ui/src/mixins/emitter';
  import Migrating from 'element-ui/src/mixins/migrating';
  import ElButton from 'element-ui/packages/button';
  import ElButtonGroup from 'element-ui/packages/button-group';
  import { generateId } from 'element-ui/src/utils/util';

  export default {
    name: 'ElDropdown',

    componentName: 'ElDropdown',

    mixins: [Emitter, Migrating],

    directives: { Clickoutside },

    components: {
      ElButton,
      ElButtonGroup
    },

    provide() {
      return {
        dropdown: this
      };
    },

    props: {
      trigger: {
        type: String,
        default: 'hover'
      },
      type: String,
      size: {
        type: String,
        default: ''
      },
      splitButton: Boolean,
      hideOnClick: {
        type: Boolean,
        default: true
      },
      placement: {
        type: String,
        default: 'bottom-end'
      },
      visibleArrow: {
        default: true
      },
      showTimeout: {
        type: Number,
        default: 250
      },
      hideTimeout: {
        type: Number,
        default: 150
      },
      tabindex: {
        type: Number,
        default: 0
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        timeout: null,
        visible: false,
        triggerElm: null,
        menuItems: null,
        menuItemsArray: null,
        dropdownElm: null,
        focusing: false,
        listId: `dropdown-menu-${generateId()}`
      };
    },

    computed: {
      dropdownSize() {
        return this.size || (this.$ELEMENT || {}).size;
      }
    },

    mounted() {
      this.$on('menu-item-click', this.handleMenuItemClick);
    },

    watch: {
      visible(val) {
        this.broadcast('ElDropdownMenu', 'visible', val);
        this.$emit('visible-change', val);
      },
      focusing(val) {
        const selfDefine = this.$el.querySelector('.el-dropdown-selfdefine');
        if (selfDefine) { // 自定义
          if (val) {
            selfDefine.className += ' focusing';
          } else {
            selfDefine.className = selfDefine.className.replace('focusing', '');
          }
        }
      }
    },

    methods: {
      getMigratingConfig() {
        return {
          props: {
            'menu-align': 'menu-align is renamed to placement.'
          }
        };
      },
      show() {
        if (this.disabled) return;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.visible = true;
        }, this.trigger === 'click' ? 0 : this.showTimeout);
      },
      hide() {
        if (this.disabled) return;
        this.removeTabindex();
        if (this.tabindex >= 0) {
          this.resetTabindex(this.triggerElm);
        }
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.visible = false;
        }, this.trigger === 'click' ? 0 : this.hideTimeout);
      },
      handleClick() {
        if (this.disabled) return;
        if (this.visible) {
          this.hide();
        } else {
          this.show();
        }
      },
      handleTriggerKeyDown(ev) {
        const keyCode = ev.keyCode;
        if ([38, 40].indexOf(keyCode) > -1) { // up/down
          this.removeTabindex();
          this.resetTabindex(this.menuItems[0]);
          this.menuItems[0].focus();
          ev.preventDefault();
          ev.stopPropagation();
        } else if (keyCode === 13) { // space enter选中
          this.handleClick();
        } else if ([9, 27].indexOf(keyCode) > -1) { // tab || esc
          this.hide();
        }
      },
      handleItemKeyDown(ev) {
        const keyCode = ev.keyCode;
        const target = ev.target;
        const currentIndex = this.menuItemsArray.indexOf(target);
        const max = this.menuItemsArray.length - 1;
        let nextIndex;
        if ([38, 40].indexOf(keyCode) > -1) { // up/down
          if (keyCode === 38) { // up
            nextIndex = currentIndex !== 0 ? currentIndex - 1 : 0;
          } else { // down
            nextIndex = currentIndex < max ? currentIndex + 1 : max;
          }
          this.removeTabindex();
          this.resetTabindex(this.menuItems[nextIndex]);
          this.menuItems[nextIndex].focus();
          ev.preventDefault();
          ev.stopPropagation();
        } else if (keyCode === 13) { // enter选中
          this.triggerElmFocus();
          target.click();
          if (this.hideOnClick) { // click关闭
            this.visible = false;
          }
        } else if ([9, 27].indexOf(keyCode) > -1) { // tab // esc
          this.hide();
          this.triggerElmFocus();
        }
      },
      resetTabindex(ele) { // 下次tab时组件聚焦元素
        this.removeTabindex();
        ele.setAttribute('tabindex', '0'); // 下次期望的聚焦元素
      },
      removeTabindex() {
        this.triggerElm.setAttribute('tabindex', '-1');
        this.menuItemsArray.forEach((item) => {
          item.setAttribute('tabindex', '-1');
        });
      },
      initAria() {
        this.dropdownElm.setAttribute('id', this.listId);
        this.triggerElm.setAttribute('aria-haspopup', 'list');
        this.triggerElm.setAttribute('aria-controls', this.listId);

        if (!this.splitButton) { // 自定义
          this.triggerElm.setAttribute('role', 'button');
          this.triggerElm.setAttribute('tabindex', this.tabindex);
          this.triggerElm.setAttribute('class', (this.triggerElm.getAttribute('class') || '') + ' el-dropdown-selfdefine'); // 控制
        }
      },
      initEvent() {
        let { trigger, show, hide, handleClick, splitButton, handleTriggerKeyDown, handleItemKeyDown } = this;
        this.triggerElm = splitButton
          ? this.$refs.trigger.$el
          : this.$slots.default[0].elm;

        let dropdownElm = this.dropdownElm;

        // 保存所有事件句柄 → 用于销毁
        this._handleTriggerKeyDown = this.handleTriggerKeyDown.bind(this);
        this._handleItemKeyDown = this.handleItemKeyDown.bind(this);

        this.triggerElm.addEventListener('keydown', this._handleTriggerKeyDown);
        dropdownElm.addEventListener('keydown', this._handleItemKeyDown, true);

        // 控制自定义元素的样式
        if (!splitButton) {
          this.triggerElm.addEventListener('focus', this._onFocus = () => { this.focusing = true; });
          this.triggerElm.addEventListener('blur', this._onBlur = () => { this.focusing = false; });
          this.triggerElm.addEventListener('click', this._onClick = () => { this.focusing = false; });
        }

        if (trigger === 'hover') {
          this.triggerElm.addEventListener('mouseenter', this._onMouseEnter = show);
          this.triggerElm.addEventListener('mouseleave', this._onMouseLeave = hide);
          dropdownElm.addEventListener('mouseenter', this._onMouseEnter);
          dropdownElm.addEventListener('mouseleave', this._onMouseLeave);
        } else if (trigger === 'click') {
          this.triggerElm.addEventListener('click', this._onHandleClick = handleClick);
        }
      },
      // ==============================================
      // 🔥 核心：移除所有 DOM 事件
      // ==============================================
      removeAllDOMListeners() {
        if (!this.triggerElm || !this.dropdownElm) return;

        this.triggerElm.removeEventListener('keydown', this._handleTriggerKeyDown);
        this.dropdownElm.removeEventListener('keydown', this._handleItemKeyDown, true);

        if (!this.splitButton) {
          this.triggerElm.removeEventListener('focus', this._onFocus);
          this.triggerElm.removeEventListener('blur', this._onBlur);
          this.triggerElm.removeEventListener('click', this._onClick);
        }

        if (this.trigger === 'hover') {
          this.triggerElm.removeEventListener('mouseenter', this._onMouseEnter);
          this.triggerElm.removeEventListener('mouseleave', this._onMouseLeave);
          this.dropdownElm.removeEventListener('mouseenter', this._onMouseEnter);
          this.dropdownElm.removeEventListener('mouseleave', this._onMouseLeave);
        } else if (this.trigger === 'click') {
          this.triggerElm.removeEventListener('click', this._onHandleClick);
        }
      },
      handleMenuItemClick(command, instance) {
        if (this.hideOnClick) {
          this.visible = false;
        }
        this.$emit('command', command, instance);
      },
      triggerElmFocus() {
        this.triggerElm.focus && this.triggerElm.focus();
      },
      initDomOperation() {
        this.dropdownElm = this.popperElm;
        this.menuItems = this.dropdownElm.querySelectorAll("[tabindex='-1']");
        this.menuItemsArray = [].slice.call(this.menuItems);

        this.initEvent();
        this.initAria();
      }
    },

    render(h) {
      let { hide, splitButton, type, dropdownSize, disabled } = this;

      const handleMainButtonClick = (event) => {
        this.$emit('click', event);
        hide();
      };

      let triggerElm = null;
      if (splitButton) {
        triggerElm = <el-button-group>
          <el-button type={type} size={dropdownSize} nativeOn-click={handleMainButtonClick} disabled={disabled}>
            {this.$slots.default}
          </el-button>
          <el-button ref="trigger" type={type} size={dropdownSize} class="el-dropdown__caret-button" disabled={disabled}>
            <i class="el-dropdown__icon el-icon-arrow-down"></i>
          </el-button>
        </el-button-group>;
      } else {
        triggerElm = this.$slots.default;
        const vnodeData = triggerElm[0].data || {};
        let { attrs = {} } = vnodeData;
        if (disabled && !attrs.disabled) {
          attrs.disabled = true;
          vnodeData.attrs = attrs;
        }
      }
      const menuElm = disabled ? null : this.$slots.dropdown;

      return (
        <div class="el-dropdown" v-clickoutside={hide} aria-disabled={disabled}>
          {triggerElm}
          {menuElm}
        </div>
      );
    },

    // ==============================================
    // 🔥 最终修复：完整版销毁逻辑（你之前缺失的全部补上）
    // ==============================================
    beforeDestroy() {
      // 1. 清理自定义事件
      this.$off('menu-item-click', this.handleMenuItemClick);

      // 2. 清理所有手动 addEventListener DOM 事件
      this.removeAllDOMListeners();

      // 3. 清理定时器
      clearTimeout(this.timeout);

      // 4. 清空强引用，帮助 GC
      this.triggerElm = null;
      this.dropdownElm = null;
      this.menuItemsArray = null;
    },


  };
</script>
