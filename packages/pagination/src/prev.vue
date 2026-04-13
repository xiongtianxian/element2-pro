<template>
  <button
      type="button"
      class="btn-prev"
      :disabled="disabled || currentPage <= 1"
      @click="handleClick"
  >
    <span v-if="prevText">{{ prevText }}</span>
    <i v-else class="el-icon el-icon-arrow-left"></i>
  </button>
</template>

<script>
export default {
  name: 'ElPaginationPrev',
  props: {
    disabled: Boolean,
    currentPage: Number,
    prevText: String
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