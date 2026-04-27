> Element UI2.15.14版本后的修复版本

## 2.15.14-hc.31
1. 修复 ElDialog 因为v-if删除时的事件未销毁的内存泄漏问题
2. 修复 ElTooltip 的事件未销毁的内存泄漏问题
3. 修复repeat-click，clickoutside指令的内存泄漏问题
4. 修复picker和popover组件内部的内存泄漏问题
5. 修复防抖函数resize-event中的闭包未释放的问题
6. 修复ElScrollbar和autocomplete组件的内存泄漏问题
7. 修复vue-popper.js中dom没清理的内存泄漏问题
8. 修复alert和el-message组件的内存泄漏问题
9. 修复el-dropdown组件系列内存泄漏的问题
10. 修复El-select组件的内存泄漏问题
11. 修复el-pagination组件选择页数的内存泄漏问题
12. 解决了浏览器抓input事件导致一层一层向外泄露的问题

### 注意： 受制于浏览器内核自身的内存泄漏问题， 无法完全销毁input的内存，但可保证内存泄漏不会向上一层蔓延导致顶部vue组件不释放，可大幅修复内存泄漏问题



