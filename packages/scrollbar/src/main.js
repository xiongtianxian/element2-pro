import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
import scrollbarWidth from 'element-ui/src/utils/scrollbar-width';
import { toObject } from 'element-ui/src/utils/util';
import Bar from './bar';

export default {
  name: 'ElScrollbar',
  components: { Bar },

  props: {
    native: Boolean,
    wrapStyle: {},
    wrapClass: {},
    viewClass: {},
    viewStyle: {},
    noresize: Boolean,
    tag: { type: String, default: 'div' }
  },

  data() {
    return {
      sizeWidth: '0',
      sizeHeight: '0',
      moveX: 0,
      moveY: 0
    };
  },

  computed: {
    wrap() {
      return this.$refs.wrap;
    }
  },

  render(h) {
    const gutter = scrollbarWidth();
    let style = this.wrapStyle;

    if (gutter) {
      const gutterWidth = `-${gutter}px`;
      const gutterStyle = `margin-bottom: ${gutterWidth}; margin-right: ${gutterWidth};`;

      if (Array.isArray(this.wrapStyle)) {
        style = toObject(this.wrapStyle);
        style.marginRight = style.marginBottom = gutterWidth;
      } else if (typeof this.wrapStyle === 'string') {
        style += gutterStyle;
      } else {
        style = gutterStyle;
      }
    }

    const view = h(this.tag, {
      class: ['el-scrollbar__view', this.viewClass],
      style: this.viewStyle,
      ref: 'resize'
    }, this.$slots.default);

    const wrap = (
        <div ref="wrap"
             style={style}
             onScroll={this.handleScroll}
             class={[this.wrapClass, 'el-scrollbar__wrap', gutter ? '' : 'el-scrollbar__wrap--hidden-default']}>
          {[view]}
        </div>
    );

    const nodes = !this.native
        ? [
          wrap,
          <Bar move={this.moveX} size={this.sizeWidth} />,
          <Bar vertical move={this.moveY} size={this.sizeHeight} />
        ]
        : [
          <div ref="wrap" class={[this.wrapClass, 'el-scrollbar__wrap']} style={style}>{[view]}</div>
        ];

    return h('div', { class: 'el-scrollbar' }, nodes);
  },

  methods: {
    handleScroll() {
      const wrap = this.wrap;
      if (!wrap) return;

      this.moveY = (wrap.scrollTop * 100) / wrap.clientHeight;
      this.moveX = (wrap.scrollLeft * 100) / wrap.clientWidth;
    },

    update() {
      const wrap = this.wrap;
      if (!wrap) return;

      // 计算一次，复用值（更优雅、性能更好）
      const heightPercent = (wrap.clientHeight * 100) / wrap.scrollHeight;
      const widthPercent = (wrap.clientWidth * 100) / wrap.scrollWidth;

      this.sizeHeight = heightPercent < 100 ? heightPercent + '%' : '';
      this.sizeWidth = widthPercent < 100 ? widthPercent + '%' : '';
    }
  },

  mounted() {
    if (this.native) return;
    this.update();

    if (this.$refs.resize && !this.noresize) {
      addResizeListener(this.$refs.resize, this.update);
    }
  },

  beforeDestroy() {
    if (this.native) return;

    // 安全移除监听
    if (this.$refs.resize && !this.noresize) {
      removeResizeListener(this.$refs.resize, this.update);
    }

    // 强制切断 DOM 引用，确保 GC 回收
    this.$refs.resize = null;
    this.$refs.wrap = null;
  }
};