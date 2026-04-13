<template>
  <button
      type="button"
      class="btn-next"
      :disabled="disabled || currentPage === pageCount || pageCount === 0"
      @click="handleClick"
  >
    <span v-if="nextText">{{ nextText }}</span>
    <i v-else class="el-icon el-icon-arrow-right"></i>
  </button>
</template>

<script>
export default {
  name: 'ElPaginationNext',
  props: {
    disabled: Boolean,
    currentPage: Number,
    pageCount: Number,
    nextText: String
  },
  methods: {
    handleClick() {
      this.$emit('click');
    }
  },
  beforeDestroy() {
    this.$off();
  }
};
</script>