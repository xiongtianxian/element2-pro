<template>
  <span v-if="typeof total === 'number'" class="el-pagination__total">
    {{ t('el.pagination.total', { total }) }}
  </span>
</template>

<script>
import { Locale } from 'element-ui/src/mixins/locale';

export default {
  name: 'Total',
  mixins: [Locale],
  props: {
    total: Number
  },
  beforeDestroy() {
    this.$off();
  }
};
</script>