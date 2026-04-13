<template>
  <span class="el-pagination__sizes">
    <el-select
        v-model="internalPageSize"
        :popper-class="popperClass"
        size="mini"
        :disabled="disabled"
        @input="handleChange"
        ref="sizeSelect"
    >
      <el-option
          v-for="item in pageSizes"
          :key="item"
          :value="item"
          :label="item + t('el.pagination.pagesize')"
      />
    </el-select>
  </span>
</template>

<script>
import { Locale } from 'element-ui/src/mixins/locale';
import { valueEquals } from 'element-ui/src/utils/util';
import ElSelect from 'element-ui/packages/select';
import ElOption from 'element-ui/packages/option';

export default {
  name: 'ElPaginationSizes',
  mixins: [Locale],
  components: { ElSelect, ElOption },
  props: {
    pageSizes: Array,
    popperClass: String,
    disabled: Boolean,
    pageSize: Number
  },
  data() {
    return {
      internalPageSize: this.pageSize
    };
  },
  watch: {
    pageSizes: {
      immediate: true,
      handler(newVal) {
        if (Array.isArray(newVal) && !valueEquals(newVal, this.pageSizes)) {
          this.internalPageSize = newVal.indexOf(this.pageSize) > -1
              ? this.pageSize
              : newVal[0];
        }
      }
    },
    pageSize(val) {
      this.internalPageSize = val;
    }
  },
  methods: {
    handleChange(val) {
      val = parseInt(val, 10);
      if (val !== this.internalPageSize) {
        this.internalPageSize = val;
        this.$emit('size-change', val);
      }
    }
  },
  beforeDestroy() {
    // 强制关闭ElSelect，触发popper销毁
    if (this.$refs.sizeSelect) {
      this.$refs.sizeSelect.visible = false;
      // 强制销毁popper
      if (this.$refs.sizeSelect.$refs.popper) {
        this.$refs.sizeSelect.$refs.popper.doDestroy(true);
      }
    }
    this.$off();
    this.internalPageSize = null;
  }
};
</script>