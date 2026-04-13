import Pager from './pager.vue';
import Prev from './prev.vue';
import Next from './next.vue';
import Sizes from './sizes.vue';
import Jumper from './jumper.vue';
import Total from './total.vue';

export default {
  name: 'ElPagination',
  components: {
    Pager,
    ElPaginationPrev: Prev,
    ElPaginationNext: Next,
    ElPaginationSizes: Sizes,
    ElPaginationJumper: Jumper,
    ElPaginationTotal: Total
  },
  props: {
    pageSize: {
      type: Number,
      default: 10
    },
    small: Boolean,
    total: Number,
    pageCount: Number,
    pagerCount: {
      type: Number,
      validator(value) {
        return (value | 0) === value && value > 4 && value < 22 && (value % 2) === 1;
      },
      default: 7
    },
    currentPage: {
      type: Number,
      default: 1
    },
    layout: {
      default: 'prev, pager, next, jumper, ->, total'
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 40, 50, 100];
      }
    },
    popperClass: String,
    prevText: String,
    nextText: String,
    background: Boolean,
    disabled: Boolean,
    hideOnSinglePage: Boolean
  },
  data() {
    return {
      internalCurrentPage: 1,
      internalPageSize: 0,
      lastEmittedPage: -1,
      userChangePageSize: false
    };
  },
  render(h) {
    const layout = this.layout;
    if (!layout) return null;
    if (this.hideOnSinglePage && (!this.internalPageCount || this.internalPageCount === 1)) return null;

    let template = h('div', {
      class: [
        'el-pagination',
        {
          'is-background': this.background,
          'el-pagination--small': this.small
        }
      ]
    });
    // 重构组件映射，传递props和事件
    const TEMPLATE_MAP = {
      prev: h('ElPaginationPrev', {
        props: {
          disabled: this.disabled,
          currentPage: this.internalCurrentPage,
          prevText: this.prevText
        },
        on: { click: this.prev }
      }),
      next: h('ElPaginationNext', {
        props: {
          disabled: this.disabled,
          currentPage: this.internalCurrentPage,
          pageCount: this.internalPageCount,
          nextText: this.nextText
        },
        on: { click: this.next }
      }),
      pager: h('Pager', {
        props: {
          currentPage: this.internalCurrentPage,
          pageCount: this.internalPageCount,
          pagerCount: this.pagerCount,
          disabled: this.disabled
        },
        on: { change: this.handleCurrentChange }
      }),
      sizes: h('ElPaginationSizes', {
        props: {
          pageSizes: this.pageSizes,
          popperClass: this.popperClass,
          disabled: this.disabled,
          pageSize: this.internalPageSize
        },
        on: { 'size-change': this.handleSizeChange }
      }),
      jumper: h('ElPaginationJumper', {
        props: {
          currentPage: this.internalCurrentPage,
          pageCount: this.internalPageCount,
          disabled: this.disabled
        },
        on: { jump: this.handleJump }
      }),
      total: h('ElPaginationTotal', {
        props: { total: this.total }
      }),
      slot: this.$slots.default ? h('div', this.$slots.default) : ''
    };

    const components = layout.split(',').map(item => item.trim());
    const rightWrapper = h('div', { class: 'el-pagination__rightwrapper' });
    let haveRightWrapper = false;

    template.children = [];
    rightWrapper.children = [];

    components.forEach(compo => {
      if (compo === '->') {
        haveRightWrapper = true;
        return;
      }
      const comp = TEMPLATE_MAP[compo];
      if (comp) {
        if (!haveRightWrapper) {
          template.children.push(comp);
        } else {
          rightWrapper.children.push(comp);
        }
      }
    });

    if (haveRightWrapper && rightWrapper.children.length) {
      template.children.unshift(rightWrapper);
    }

    return template;
  },
  methods: {
    handleCurrentChange(val) {
      this.internalCurrentPage = this.getValidCurrentPage(val);
      this.userChangePageSize = true;
      this.emitChange();
    },
    handleSizeChange(val) {
      this.internalPageSize = val;
      this.userChangePageSize = true;
      this.$emit('update:pageSize', val);
      this.$emit('size-change', val);
    },
    handleJump(val) {
      this.internalCurrentPage = this.getValidCurrentPage(val);
      this.emitChange();
    },
    prev() {
      if (this.disabled) return;
      const newVal = this.internalCurrentPage - 1;
      this.internalCurrentPage = this.getValidCurrentPage(newVal);
      this.$emit('prev-click', this.internalCurrentPage);
      this.emitChange();
    },
    next() {
      if (this.disabled) return;
      const newVal = this.internalCurrentPage + 1;
      this.internalCurrentPage = this.getValidCurrentPage(newVal);
      this.$emit('next-click', this.internalCurrentPage);
      this.emitChange();
    },
    getValidCurrentPage(value) {
      value = parseInt(value, 10);
      const havePageCount = typeof this.internalPageCount === 'number';
      let resetValue;

      if (!havePageCount) {
        if (isNaN(value) || value < 1) resetValue = 1;
      } else {
        if (value < 1) {
          resetValue = 1;
        } else if (value > this.internalPageCount) {
          resetValue = this.internalPageCount;
        }
      }

      if (resetValue === undefined && isNaN(value)) {
        resetValue = 1;
      } else if (resetValue === 0) {
        resetValue = 1;
      }

      return resetValue === undefined ? value : resetValue;
    },
    emitChange() {
      this.$nextTick(() => {
        if (this.internalCurrentPage !== this.lastEmittedPage || this.userChangePageSize) {
          this.$emit('current-change', this.internalCurrentPage);
          this.lastEmittedPage = this.internalCurrentPage;
          this.userChangePageSize = false;
        }
      });
    }
  },
  computed: {
    internalPageCount() {
      if (typeof this.total === 'number') {
        return Math.max(1, Math.ceil(this.total / this.internalPageSize));
      } else if (typeof this.pageCount === 'number') {
        return Math.max(1, this.pageCount);
      }
      return null;
    }
  },
  watch: {
    currentPage: {
      immediate: true,
      handler(val) {
        this.internalCurrentPage = this.getValidCurrentPage(val);
      }
    },
    pageSize: {
      immediate: true,
      handler(val) {
        this.internalPageSize = isNaN(val) ? 10 : val;
      }
    },
    internalCurrentPage: {
      immediate: true,
      handler(newVal) {
        this.$emit('update:currentPage', newVal);
        this.lastEmittedPage = -1;
      }
    },
    internalPageCount(newVal) {
      const oldPage = this.internalCurrentPage;
      if (newVal > 0 && oldPage === 0) {
        this.internalCurrentPage = 1;
      } else if (oldPage > newVal) {
        this.internalCurrentPage = newVal === 0 ? 1 : newVal;
        this.userChangePageSize && this.emitChange();
      }
      this.userChangePageSize = false;
    }
  },
  beforeDestroy() {
    this.$off();
    // 清空响应式数据，切断引用
    this.internalCurrentPage = null;
    this.internalPageSize = null;
    this.lastEmittedPage = null;
  }
};