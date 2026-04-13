<template>
  <span class="el-pagination__jump">
    {{ t('el.pagination.goto') }}
    <el-input
        class="el-pagination__editor is-in-pagination"
        :min="1"
        :max="pageCount"
        v-model="inputValue"
        type="number"
        :disabled="disabled"
        @keyup.enter="handleConfirm"
        @input="handleInput"
        @change="handleConfirm"
        ref="jumpInput"
    />
    {{ t('el.pagination.pageClassifier') }}
  </span>
</template>

<script>
import { Locale } from 'element-ui/src/mixins/locale';
import ElInput from 'element-ui/packages/input';

export default {
  name: 'Jumper',
  mixins: [Locale],
  components: { ElInput },
  props: {
    currentPage: Number,
    pageCount: Number,
    disabled: Boolean
  },
  data() {
    return {
      inputValue: this.currentPage
    };
  },
  watch: {
    currentPage(val) {
      this.inputValue = val;
    }
  },
  methods: {
    handleInput(val) {
      this.inputValue = val;
    },
    handleConfirm(val) {
      this.$emit('jump', val);
      this.inputValue = this.currentPage;
    }
  },
  beforeDestroy() {
    this.$off();
    this.inputValue = null;
  }
};
</script>