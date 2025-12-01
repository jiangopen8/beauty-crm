# 移动端手势功能集成指南

## 文件说明

- `js/mobile-gestures.js` - 核心手势处理模块
- `mobile-gestures-demo.html` - 功能演示页面

## 功能特性

### 1. 侧边栏滑动手势

**功能描述：**
- 从屏幕左边缘向右滑动（< 50px）打开侧边栏
- 在侧边栏上向左滑动关闭侧边栏
- 滑动距离需超过50px才触发
- 自动区分水平滑动和垂直滚动

**HTML要求：**
```html
<!-- 侧边栏必须包含 .sidebar 类 -->
<div class="sidebar">
    <!-- 侧边栏内容 -->
</div>

<!-- 可选：侧边栏遮罩 -->
<div class="sidebar-overlay"></div>
```

**CSS要求：**
```css
.sidebar {
    position: fixed;
    left: -280px;
    transition: left 0.3s ease;
}

.sidebar.active {
    left: 0;
}
```

### 2. 输入框自动滚动

**功能描述：**
- 输入框获得焦点时自动滚动到视口中央
- 防止被移动键盘遮挡
- 延迟300ms等待键盘弹出
- 使用平滑滚动动画

**自动支持的元素：**
- `<input>` - 所有类型的输入框
- `<textarea>` - 多行文本框
- `<select>` - 下拉选择框

**无需额外配置，自动生效**

### 3. 表单验证增强

**功能描述：**
- 输入时实时显示错误提示（防抖300ms）
- 失去焦点时验证字段
- 提交时验证整个表单
- 验证失败自动滚动到第一个错误字段
- 在输入框下方显示错误消息

**支持的验证规则：**
- `required` - 必填验证
- `type="email"` - 邮箱格式验证
- `type="tel"` - 手机号验证（中国11位）
- `minlength` - 最小长度验证
- `maxlength` - 最大长度验证

**HTML示例：**
```html
<form>
    <div class="form-group">
        <label>姓名 *</label>
        <input type="text" name="name" required>
    </div>

    <div class="form-group">
        <label>手机号 *</label>
        <input type="tel" name="phone" required>
    </div>

    <div class="form-group">
        <label>邮箱 *</label>
        <input type="email" name="email" required>
    </div>

    <button type="submit">提交</button>
</form>
```

**CSS要求：**
```css
.form-group {
    position: relative;
    margin-bottom: 20px;
}

input.error {
    border-color: #e74c3c;
}

.field-error {
    color: #e74c3c;
    font-size: 12px;
    margin-top: 5px;
}
```

### 4. 长按菜单

**功能描述：**
- 在表格行上长按500ms显示上下文菜单
- 支持震动反馈（如果设备支持）
- 移动或抬起手指取消长按
- 点击其他地方自动关闭菜单

**自动支持的元素：**
- `<table>` 中的 `<tbody>` `<tr>` 元素

**监听菜单事件：**
```javascript
document.addEventListener('contextmenu-action', function(e) {
    const action = e.detail.action;  // 'view', 'edit', 'delete'
    const element = e.detail.element; // 触发的表格行

    console.log('执行操作:', action);

    // 执行相应逻辑
    switch(action) {
        case 'view':
            // 查看详情
            break;
        case 'edit':
            // 编辑
            break;
        case 'delete':
            // 删除
            break;
    }
});
```

## 快速集成

### 步骤1：引入脚本

在 HTML 页面底部引入脚本：

```html
<!-- 在 </body> 前引入 -->
<script src="js/mobile-gestures.js"></script>
```

### 步骤2：确保HTML结构正确

确保你的页面包含以下元素（根据需要）：

```html
<!-- 侧边栏 -->
<div class="sidebar">
    <!-- 侧边栏内容 -->
</div>

<!-- 表单 -->
<form>
    <div class="form-group">
        <input type="text" required>
    </div>
</form>

<!-- 表格 -->
<table>
    <tbody>
        <tr>
            <!-- 表格行 -->
        </tr>
    </tbody>
</table>
```

### 步骤3：添加必要的CSS

参考上面各功能的CSS要求添加样式。

### 步骤4：测试

1. 在移动设备上访问页面
2. 或使用浏览器开发者工具（F12）切换到移动设备模式
3. 刷新页面

## 配置选项

可以通过修改 `MobileGestures.config` 来自定义配置：

```javascript
// 在引入 mobile-gestures.js 后
MobileGestures.config.swipeThreshold = 80;        // 滑动阈值改为80px
MobileGestures.config.longPressDelay = 600;       // 长按延迟改为600ms
MobileGestures.config.validationDebounce = 500;   // 验证防抖改为500ms
```

**可配置项：**

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `swipeThreshold` | 50 | 滑动触发阈值（px） |
| `edgeSwipeWidth` | 50 | 边缘滑动检测宽度（px） |
| `longPressDelay` | 500 | 长按触发延迟（ms） |
| `scrollDuration` | 300 | 滚动动画时长（ms） |
| `inputScrollOffset` | 100 | 输入框滚动偏移（px） |
| `validationDebounce` | 300 | 验证防抖延迟（ms） |

## API方法

### MobileGestures.init()
手动初始化手势模块（通常自动调用）

### MobileGestures.openSidebar()
打开侧边栏

```javascript
MobileGestures.openSidebar();
```

### MobileGestures.closeSidebar()
关闭侧边栏

```javascript
MobileGestures.closeSidebar();
```

### MobileGestures.scrollToInput(input)
滚动到指定输入框

```javascript
const input = document.querySelector('#myInput');
MobileGestures.scrollToInput(input);
```

### MobileGestures.validateField(input)
验证单个字段

```javascript
const input = document.querySelector('#email');
const isValid = MobileGestures.validateField(input);
```

### MobileGestures.validateForm(form)
验证整个表单

```javascript
const form = document.querySelector('#myForm');
const isValid = MobileGestures.validateForm(form);
```

### MobileGestures.destroy()
销毁所有手势监听器

```javascript
MobileGestures.destroy();
```

## 自定义验证规则

如果需要添加自定义验证规则，可以修改 `validateField` 方法：

```javascript
// 在 mobile-gestures.js 中的 validateField 方法添加
else if (input.name === 'idcard' && input.value) {
    // 身份证验证
    const idcardRegex = /^\d{17}[\dXx]$/;
    if (!idcardRegex.test(input.value)) {
        errorMessage = '请输入有效的身份证号码';
    }
}
```

## 自定义长按菜单项

修改 `showContextMenu` 方法中的 `menuItems` 数组：

```javascript
const menuItems = [
    { label: '查看详情', action: 'view' },
    { label: '编辑', action: 'edit' },
    { label: '分配任务', action: 'assign' },  // 新增
    { label: '删除', action: 'delete' }
];
```

## 兼容性

**支持的浏览器：**
- iOS Safari 10+
- Android Chrome 60+
- Android Firefox 60+
- 微信浏览器
- 其他现代移动浏览器

**触摸事件支持：**
- `touchstart`
- `touchmove`
- `touchend`

**可选功能：**
- `navigator.vibrate` - 震动反馈（部分设备支持）

## 注意事项

### 1. 触摸事件与点击事件冲突

脚本已处理触摸和点击事件的冲突，通过以下方式：
- 区分水平滑动和垂直滚动
- 长按时取消点击事件
- 使用 `passive` 事件监听提升性能

### 2. 输入框焦点问题

在某些iOS设备上，输入框获得焦点时可能出现延迟，脚本已通过 `setTimeout` 处理。

### 3. 表单验证时机

- **input事件**：防抖验证，避免频繁触发
- **blur事件**：立即验证
- **submit事件**：完整验证并滚动到错误字段

### 4. 性能优化

- 使用 `passive` 事件监听器
- 防抖和节流处理
- requestAnimationFrame 实现平滑滚动
- 事件委托减少监听器数量

## 调试

脚本包含详细的控制台日志，可以帮助调试：

```javascript
// 查看初始化信息
console.log('[MobileGestures] 初始化...');

// 查看事件触发
console.log('[MobileGestures] 侧边栏已打开');
console.log('[MobileGestures] 滚动到输入框:', input.name);
```

在浏览器控制台查看这些日志以了解手势模块的运行状态。

## 常见问题

### Q: 为什么滑动手势不生效？

A: 检查以下几点：
1. 是否在移动设备或移动设备模式下访问
2. 侧边栏是否包含 `.sidebar` 类
3. 是否正确引入了脚本
4. 浏览器控制台是否有错误

### Q: 如何禁用某个功能？

A: 注释掉 `init` 方法中对应的初始化调用：

```javascript
init: function() {
    // this.initSidebarSwipe();        // 禁用侧边栏滑动
    this.initInputAutoScroll();
    this.initFormValidation();
    // this.initLongPressMenu();       // 禁用长按菜单
}
```

### Q: 如何在单页应用中使用？

A: 在路由切换后重新初始化：

```javascript
// Vue Router 示例
router.afterEach(() => {
    MobileGestures.destroy();
    MobileGestures.init();
});
```

### Q: 如何自定义错误提示样式？

A: 修改 `showFieldError` 方法中的样式：

```javascript
errorDiv.style.cssText = 'color: #e74c3c; font-size: 14px; margin-top: 5px;';
```

或通过CSS覆盖：

```css
.field-error {
    color: #e74c3c !important;
    font-size: 14px !important;
    background: #fee;
    padding: 5px;
    border-radius: 3px;
}
```

## 测试清单

集成后请测试以下功能：

- [ ] 从左边缘滑动打开侧边栏
- [ ] 在侧边栏上向左滑动关闭
- [ ] 点击侧边栏遮罩关闭
- [ ] 输入框获得焦点自动滚动
- [ ] 表单验证实时提示错误
- [ ] 提交无效表单滚动到错误字段
- [ ] 长按表格行显示菜单
- [ ] 菜单项点击触发相应事件
- [ ] 点击其他地方关闭菜单

## 更新日志

### v1.0.0 (2025-11-30)
- 初始版本发布
- 支持侧边栏滑动手势
- 支持输入框自动滚动
- 支持表单验证增强
- 支持长按菜单

## 技术支持

如有问题，请查看：
1. 控制台日志输出
2. `mobile-gestures-demo.html` 演示页面
3. 本文档的常见问题部分
