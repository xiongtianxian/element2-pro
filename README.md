> Element UI2.15.14版本后的修复版本

## 2.15.14-hc.19
1. 修复 ElDialog 因为v-if删除时的事件未销毁的内存泄漏问题
2. 修复 ElTooltip 的事件未销毁的内存泄漏问题
3. 修复repeat-click，clickoutside指令的内存泄漏问题
4. 修复picker和popover组件内部的内存泄漏问题
5. 修复防抖函数resize-event中的闭包未释放的问题
6. 修复ElScrollbar和autocomplete组件的内存泄漏问题
7. 修复vue-popper.js中dom没清理的内存泄漏问题
8. 修复alert和el-message组件的内存泄漏问题
9. 修复el-dropdown组件系列内存泄漏的问题



