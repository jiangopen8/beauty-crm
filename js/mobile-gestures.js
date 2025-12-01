/**
 * 移动端触摸手势处理模块
 * 提供侧边栏滑动、输入框自动滚动、表单验证增强、长按菜单等功能
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    /**
     * 移动端手势管理器
     */
    const MobileGestures = {
        // 配置选项
        config: {
            swipeThreshold: 50,           // 滑动触发阈值（px）
            edgeSwipeWidth: 50,           // 边缘滑动检测宽度（px）
            longPressDelay: 500,          // 长按触发延迟（ms）
            scrollDuration: 300,          // 滚动动画时长（ms）
            inputScrollOffset: 100,       // 输入框滚动偏移（px）
            validationDebounce: 300       // 验证防抖延迟（ms）
        },

        // 状态管理
        state: {
            touchStartX: 0,
            touchStartY: 0,
            touchStartTime: 0,
            isSwiping: false,
            isScrolling: false,
            longPressTimer: null,
            validationTimers: new Map()
        },

        /**
         * 初始化所有手势功能
         */
        init: function() {
            console.log('[MobileGestures] 初始化触摸手势模块...');

            // 检测是否为移动设备
            if (!this.isMobileDevice()) {
                console.log('[MobileGestures] 非移动设备，跳过初始化');
                return;
            }

            this.initSidebarSwipe();
            this.initInputAutoScroll();
            this.initFormValidation();
            this.initLongPressMenu();

            console.log('[MobileGestures] 触摸手势模块初始化完成');
        },

        /**
         * 检测是否为移动设备
         */
        isMobileDevice: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   window.innerWidth <= 768;
        },

        /**
         * ========================================
         * 1. 侧边栏滑动手势
         * ========================================
         */
        initSidebarSwipe: function() {
            const self = this;
            const sidebar = document.querySelector('.sidebar');
            const sidebarToggle = document.querySelector('.sidebar-toggle');

            if (!sidebar) {
                console.log('[MobileGestures] 未找到侧边栏元素');
                return;
            }

            // 从左边缘向右滑动打开侧边栏
            document.addEventListener('touchstart', function(e) {
                const touch = e.touches[0];

                // 检测是否从左边缘开始滑动
                if (touch.clientX <= self.config.edgeSwipeWidth && !sidebar.classList.contains('active')) {
                    self.state.touchStartX = touch.clientX;
                    self.state.touchStartY = touch.clientY;
                    self.state.touchStartTime = Date.now();
                    self.state.isSwiping = true;
                    self.state.isScrolling = false;
                }
            }, { passive: true });

            document.addEventListener('touchmove', function(e) {
                if (!self.state.isSwiping) return;

                const touch = e.touches[0];
                const deltaX = touch.clientX - self.state.touchStartX;
                const deltaY = touch.clientY - self.state.touchStartY;

                // 判断是否为水平滑动（而非垂直滚动）
                if (Math.abs(deltaX) > Math.abs(deltaY) && !self.state.isScrolling) {
                    // 防止页面滚动
                    if (deltaX > 0) {
                        e.preventDefault();
                    }
                } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    self.state.isScrolling = true;
                    self.state.isSwiping = false;
                }
            }, { passive: false });

            document.addEventListener('touchend', function(e) {
                if (!self.state.isSwiping) return;

                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - self.state.touchStartX;
                const deltaTime = Date.now() - self.state.touchStartTime;

                // 判断是否触发滑动（距离超过阈值且时间合理）
                if (deltaX > self.config.swipeThreshold && deltaTime < 500) {
                    self.openSidebar();
                }

                self.state.isSwiping = false;
            }, { passive: true });

            // 在侧边栏上向左滑动关闭
            sidebar.addEventListener('touchstart', function(e) {
                if (sidebar.classList.contains('active')) {
                    const touch = e.touches[0];
                    self.state.touchStartX = touch.clientX;
                    self.state.touchStartY = touch.clientY;
                    self.state.touchStartTime = Date.now();
                    self.state.isSwiping = true;
                    self.state.isScrolling = false;
                }
            }, { passive: true });

            sidebar.addEventListener('touchmove', function(e) {
                if (!self.state.isSwiping || !sidebar.classList.contains('active')) return;

                const touch = e.touches[0];
                const deltaX = touch.clientX - self.state.touchStartX;
                const deltaY = touch.clientY - self.state.touchStartY;

                // 判断是否为水平滑动
                if (Math.abs(deltaX) > Math.abs(deltaY) && !self.state.isScrolling) {
                    if (deltaX < 0) {
                        e.preventDefault();
                    }
                } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    self.state.isScrolling = true;
                    self.state.isSwiping = false;
                }
            }, { passive: false });

            sidebar.addEventListener('touchend', function(e) {
                if (!self.state.isSwiping || !sidebar.classList.contains('active')) return;

                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - self.state.touchStartX;
                const deltaTime = Date.now() - self.state.touchStartTime;

                // 向左滑动关闭侧边栏
                if (deltaX < -self.config.swipeThreshold && deltaTime < 500) {
                    self.closeSidebar();
                }

                self.state.isSwiping = false;
            }, { passive: true });

            console.log('[MobileGestures] 侧边栏滑动手势已启用');
        },

        /**
         * 打开侧边栏
         */
        openSidebar: function() {
            const sidebar = document.querySelector('.sidebar');
            const sidebarOverlay = document.querySelector('.sidebar-overlay');

            if (sidebar) {
                sidebar.classList.add('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.add('active');
                }
                console.log('[MobileGestures] 侧边栏已打开');
            }
        },

        /**
         * 关闭侧边栏
         */
        closeSidebar: function() {
            const sidebar = document.querySelector('.sidebar');
            const sidebarOverlay = document.querySelector('.sidebar-overlay');

            if (sidebar) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
                console.log('[MobileGestures] 侧边栏已关闭');
            }
        },

        /**
         * ========================================
         * 2. 输入框自动滚动
         * ========================================
         */
        initInputAutoScroll: function() {
            const self = this;

            // 监听所有输入框的焦点事件
            const inputs = document.querySelectorAll('input, textarea, select');

            inputs.forEach(function(input) {
                // 获得焦点时自动滚动
                input.addEventListener('focus', function() {
                    // 延迟执行，等待键盘弹出
                    setTimeout(function() {
                        self.scrollToInput(input);
                    }, 300);
                }, { passive: true });

                // 失去焦点时滚动回顶部（可选）
                input.addEventListener('blur', function() {
                    // 如果需要，可以在这里添加滚动逻辑
                }, { passive: true });
            });

            console.log('[MobileGestures] 输入框自动滚动已启用，共 ' + inputs.length + ' 个输入框');
        },

        /**
         * 滚动到输入框
         * @param {HTMLElement} input - 输入框元素
         */
        scrollToInput: function(input) {
            if (!input) return;

            const rect = input.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const inputHeight = rect.height;

            // 计算输入框应该在视口中的位置（中央偏上）
            const targetPosition = (viewportHeight / 2) - (inputHeight / 2) - this.config.inputScrollOffset;

            // 计算需要滚动的距离
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetScroll = scrollTop + rect.top - targetPosition;

            // 平滑滚动
            this.smoothScroll(targetScroll);

            console.log('[MobileGestures] 滚动到输入框:', input.name || input.id);
        },

        /**
         * 平滑滚动
         * @param {number} targetY - 目标滚动位置
         */
        smoothScroll: function(targetY) {
            const startY = window.pageYOffset || document.documentElement.scrollTop;
            const distance = targetY - startY;
            const duration = this.config.scrollDuration;
            let start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);

                // 使用缓动函数
                const easing = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                window.scrollTo(0, startY + distance * easing);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            }

            window.requestAnimationFrame(step);
        },

        /**
         * ========================================
         * 3. 表单验证增强
         * ========================================
         */
        initFormValidation: function() {
            const self = this;

            // 监听所有表单
            const forms = document.querySelectorAll('form');

            forms.forEach(function(form) {
                // 为每个输入框添加实时验证
                const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

                inputs.forEach(function(input) {
                    // 输入时验证（防抖）
                    input.addEventListener('input', function() {
                        self.debounceValidation(input);
                    });

                    // 失去焦点时验证
                    input.addEventListener('blur', function() {
                        self.validateField(input);
                    });
                });

                // 表单提交时验证
                form.addEventListener('submit', function(e) {
                    if (!self.validateForm(form)) {
                        e.preventDefault();

                        // 滚动到第一个错误字段
                        const firstError = form.querySelector('.error');
                        if (firstError) {
                            const errorInput = firstError.closest('.form-group').querySelector('input, textarea, select');
                            if (errorInput) {
                                self.scrollToInput(errorInput);
                            }
                        }
                    }
                });
            });

            console.log('[MobileGestures] 表单验证增强已启用，共 ' + forms.length + ' 个表单');
        },

        /**
         * 防抖验证
         * @param {HTMLElement} input - 输入框元素
         */
        debounceValidation: function(input) {
            const self = this;
            const timerId = this.state.validationTimers.get(input);

            // 清除之前的定时器
            if (timerId) {
                clearTimeout(timerId);
            }

            // 设置新的定时器
            const newTimerId = setTimeout(function() {
                self.validateField(input);
            }, this.config.validationDebounce);

            this.state.validationTimers.set(input, newTimerId);
        },

        /**
         * 验证单个字段
         * @param {HTMLElement} input - 输入框元素
         * @returns {boolean} 验证是否通过
         */
        validateField: function(input) {
            const formGroup = input.closest('.form-group');
            if (!formGroup) return true;

            let errorMessage = '';

            // 必填验证
            if (input.hasAttribute('required') && !input.value.trim()) {
                errorMessage = '此字段为必填项';
            }
            // 邮箱验证
            else if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    errorMessage = '请输入有效的邮箱地址';
                }
            }
            // 手机号验证
            else if (input.type === 'tel' && input.value) {
                const phoneRegex = /^1[3-9]\d{9}$/;
                if (!phoneRegex.test(input.value)) {
                    errorMessage = '请输入有效的手机号码';
                }
            }
            // 最小长度验证
            else if (input.hasAttribute('minlength')) {
                const minLength = parseInt(input.getAttribute('minlength'));
                if (input.value.length < minLength) {
                    errorMessage = '至少需要 ' + minLength + ' 个字符';
                }
            }
            // 最大长度验证
            else if (input.hasAttribute('maxlength')) {
                const maxLength = parseInt(input.getAttribute('maxlength'));
                if (input.value.length > maxLength) {
                    errorMessage = '最多 ' + maxLength + ' 个字符';
                }
            }

            // 显示或清除错误提示
            this.showFieldError(formGroup, input, errorMessage);

            return !errorMessage;
        },

        /**
         * 显示字段错误
         * @param {HTMLElement} formGroup - 表单组元素
         * @param {HTMLElement} input - 输入框元素
         * @param {string} message - 错误消息
         */
        showFieldError: function(formGroup, input, message) {
            // 移除之前的错误提示
            let errorDiv = formGroup.querySelector('.field-error');

            if (message) {
                // 添加错误样式
                input.classList.add('error');

                // 创建或更新错误提示
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'field-error';
                    errorDiv.style.cssText = 'color: #e74c3c; font-size: 12px; margin-top: 5px;';
                    formGroup.appendChild(errorDiv);
                }
                errorDiv.textContent = message;
            } else {
                // 移除错误样式和提示
                input.classList.remove('error');
                if (errorDiv) {
                    errorDiv.remove();
                }
            }
        },

        /**
         * 验证整个表单
         * @param {HTMLFormElement} form - 表单元素
         * @returns {boolean} 验证是否通过
         */
        validateForm: function(form) {
            const self = this;
            let isValid = true;

            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

            inputs.forEach(function(input) {
                if (!self.validateField(input)) {
                    isValid = false;
                }
            });

            return isValid;
        },

        /**
         * ========================================
         * 4. 长按菜单（可选）
         * ========================================
         */
        initLongPressMenu: function() {
            const self = this;

            // 为表格行添加长按菜单
            const tableRows = document.querySelectorAll('table tbody tr');

            tableRows.forEach(function(row) {
                // 长按开始
                row.addEventListener('touchstart', function(e) {
                    // 清除之前的定时器
                    if (self.state.longPressTimer) {
                        clearTimeout(self.state.longPressTimer);
                    }

                    // 设置长按定时器
                    self.state.longPressTimer = setTimeout(function() {
                        self.showContextMenu(row, e.touches[0]);
                    }, self.config.longPressDelay);
                }, { passive: true });

                // 长按取消
                row.addEventListener('touchend', function() {
                    if (self.state.longPressTimer) {
                        clearTimeout(self.state.longPressTimer);
                        self.state.longPressTimer = null;
                    }
                }, { passive: true });

                row.addEventListener('touchmove', function() {
                    if (self.state.longPressTimer) {
                        clearTimeout(self.state.longPressTimer);
                        self.state.longPressTimer = null;
                    }
                }, { passive: true });
            });

            console.log('[MobileGestures] 长按菜单已启用，共 ' + tableRows.length + ' 个表格行');
        },

        /**
         * 显示上下文菜单
         * @param {HTMLElement} element - 触发元素
         * @param {Touch} touch - 触摸对象
         */
        showContextMenu: function(element, touch) {
            // 移除已存在的菜单
            const existingMenu = document.querySelector('.context-menu');
            if (existingMenu) {
                existingMenu.remove();
            }

            // 创建菜单
            const menu = document.createElement('div');
            menu.className = 'context-menu';
            menu.style.cssText = `
                position: fixed;
                left: ${touch.clientX}px;
                top: ${touch.clientY}px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                min-width: 150px;
            `;

            // 添加菜单项
            const menuItems = [
                { label: '查看详情', action: 'view' },
                { label: '编辑', action: 'edit' },
                { label: '删除', action: 'delete' }
            ];

            menuItems.forEach(function(item) {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.textContent = item.label;
                menuItem.style.cssText = `
                    padding: 10px 15px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                `;

                // 点击菜单项
                menuItem.addEventListener('click', function() {
                    console.log('[MobileGestures] 菜单项点击:', item.action);

                    // 触发自定义事件
                    const event = new CustomEvent('contextmenu-action', {
                        detail: {
                            action: item.action,
                            element: element
                        }
                    });
                    element.dispatchEvent(event);

                    menu.remove();
                });

                menu.appendChild(menuItem);
            });

            document.body.appendChild(menu);

            // 点击其他地方关闭菜单
            setTimeout(function() {
                document.addEventListener('click', function closeMenu() {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                });
            }, 100);

            // 震动反馈（如果支持）
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }

            console.log('[MobileGestures] 显示上下文菜单');
        },

        /**
         * ========================================
         * 工具方法
         * ========================================
         */

        /**
         * 销毁所有手势监听器
         */
        destroy: function() {
            // 清除所有定时器
            if (this.state.longPressTimer) {
                clearTimeout(this.state.longPressTimer);
            }

            this.state.validationTimers.forEach(function(timer) {
                clearTimeout(timer);
            });

            this.state.validationTimers.clear();

            console.log('[MobileGestures] 手势监听器已销毁');
        }
    };

    // 页面加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            MobileGestures.init();
        });
    } else {
        MobileGestures.init();
    }

    // 暴露到全局
    window.MobileGestures = MobileGestures;

})(window);
