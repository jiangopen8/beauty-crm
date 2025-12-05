/**
 * Tab管理器
 * 负责Tab切换逻辑和模块动态加载
 *
 * 使用方法：
 * const tabManager = new TabManager({ customerId: 1, defaultTab: 'profile' });
 * tabManager.init();
 */
class TabManager {
    constructor(options = {}) {
        this.currentTab = options.defaultTab || 'profile';
        this.customerId = options.customerId;
        this.tabs = {
            'profile': {
                name: '客户资料',
                module: 'customer-profile',
                icon: 'user',
                container: 'profileTab'
            },
            'diagnosis': {
                name: '诊断管理',
                module: 'diagnosis',
                icon: 'clipboard',
                container: 'diagnosisTab'
            },
            'plans': {
                name: '方案管理',
                module: 'plans',
                icon: 'file-text',
                container: 'plansTab'
            },
            'orders': {
                name: '订单管理',
                module: 'orders',
                icon: 'shopping-cart',
                container: 'ordersTab'
            },
            'tasks': {
                name: '任务管理',
                module: 'tasks',
                icon: 'check-square',
                container: 'tasksTab'
            },
            'chat': {
                name: 'AI对话',
                module: 'chat',
                icon: 'message-circle',
                container: 'chatTab'
            }
        };
    }

    /**
     * 初始化Tab管理器
     */
    init() {
        this._bindTabEvents();
        this._loadInitialTab();
    }

    /**
     * 绑定Tab点击事件
     */
    _bindTabEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // 移动端底部导航
        document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    /**
     * 切换Tab
     */
    async switchTab(tabId) {
        if (tabId === this.currentTab) return;

        const tabConfig = this.tabs[tabId];
        if (!tabConfig) {
            console.error(`Tab ${tabId} 不存在`);
            return;
        }

        // 显示加载状态
        this._showLoading(tabId);

        try {
            // 隐藏所有Tab内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // 移除所有Tab按钮的active状态
            document.querySelectorAll('.tab-btn, .mobile-nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // 激活当前Tab按钮
            document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(btn => {
                btn.classList.add('active');
            });

            // 获取容器
            const container = document.getElementById(tabConfig.container);
            container.classList.add('active');

            // 加载模块
            await window.moduleLoader.loadModule(
                tabConfig.module,
                container,
                { customerId: this.customerId }
            );

            // 更新当前Tab
            this.currentTab = tabId;

            // 隐藏加载状态
            this._hideLoading(tabId);

            // 触发Tab切换事件
            this._triggerTabChange(tabId);

        } catch (error) {
            console.error(`加载Tab ${tabId} 失败:`, error);
            this._showError(tabId, error.message);
        }
    }

    /**
     * 加载初始Tab
     */
    async _loadInitialTab() {
        await this.switchTab(this.currentTab);
    }

    /**
     * 显示加载状态
     */
    _showLoading(tabId) {
        const container = document.getElementById(this.tabs[tabId].container);
        container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="loading-spinner"></div>
                <p class="ml-3 text-gray-500">正在加载${this.tabs[tabId].name}...</p>
            </div>
        `;
    }

    /**
     * 隐藏加载状态
     */
    _hideLoading(tabId) {
        // 模块加载完成后会自动填充内容，无需额外操作
    }

    /**
     * 显示错误
     */
    _showError(tabId, message) {
        const container = document.getElementById(this.tabs[tabId].container);
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-red-600">
                <i data-lucide="alert-circle" class="w-12 h-12 mb-3"></i>
                <p class="text-lg font-semibold">加载失败</p>
                <p class="text-sm mt-2">${message}</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    刷新页面
                </button>
            </div>
        `;
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    /**
     * 触发Tab切换事件
     */
    _triggerTabChange(tabId) {
        window.dispatchEvent(new CustomEvent('tabChange', {
            detail: { tabId, tabName: this.tabs[tabId].name }
        }));
    }
}

// 导出到全局
window.TabManager = TabManager;
