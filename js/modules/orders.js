/**
 * 订单管理模块
 * 管理客户的订单和消费记录
 *
 * 功能（待完善）：
 * - 查看订单列表
 * - 创建新订单
 * - 编辑订单
 * - 订单支付管理
 * - 订单统计分析
 */
class OrdersModule {
    constructor(options = {}) {
        this.customerId = options.customerId;
        this.container = null;
        this.ordersList = [];
        this.currentOrder = null;
        this.statistics = null;
    }

    /**
     * 挂载模块到容器
     */
    mount(container) {
        this.container = container;
        this.init();
    }

    /**
     * 初始化模块
     */
    async init() {
        try {
            this.showLoading();

            // TODO: 加载订单列表和统计数据
            await this.loadOrdersList();
            await this.loadStatistics();

            // 渲染UI
            this.render();
        } catch (error) {
            console.error('初始化订单管理模块失败:', error);
            this.showError(error.message);
        }
    }

    /**
     * 加载订单列表
     */
    async loadOrdersList() {
        try {
            // TODO: 实现API调用
            // const response = await fetch(`http://8.210.246.101:3000/api/orders/customer/${this.customerId}`);
            // const result = await response.json();
            // if (result.success) {
            //     this.ordersList = result.data;
            // }

            console.log('📋 订单列表加载功能待实现');
            this.ordersList = [];
        } catch (error) {
            console.error('加载订单列表失败:', error);
        }
    }

    /**
     * 加载订单统计数据
     */
    async loadStatistics() {
        try {
            // TODO: 实现API调用
            // const response = await fetch(`http://8.210.246.101:3000/api/orders/statistics/${this.customerId}`);
            // const result = await response.json();
            // if (result.success) {
            //     this.statistics = result.data;
            // }

            console.log('📊 订单统计加载功能待实现');
            this.statistics = null;
        } catch (error) {
            console.error('加载订单统计失败:', error);
        }
    }

    /**
     * 渲染UI
     */
    render() {
        const html = `
            <div class="orders-module">
                <!-- 头部操作栏 -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 flex items-center">
                            <i data-lucide="shopping-cart" class="w-5 h-5 mr-2 text-purple-600"></i>
                            订单管理
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">
                            客户订单和消费记录
                        </p>
                    </div>
                    <button id="addOrderBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                        新建订单
                    </button>
                </div>

                <!-- 订单统计卡片 -->
                <div class="mb-6">
                    ${this.renderStatistics()}
                </div>

                <!-- 订单筛选栏 -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div class="flex flex-wrap gap-3">
                        <select id="orderStatusFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">全部状态</option>
                            <option value="pending">待支付</option>
                            <option value="paid">已支付</option>
                            <option value="completed">已完成</option>
                            <option value="cancelled">已取消</option>
                        </select>
                        <select id="orderTimeFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">全部时间</option>
                            <option value="today">今天</option>
                            <option value="week">本周</option>
                            <option value="month">本月</option>
                            <option value="year">本年</option>
                        </select>
                        <button id="resetFilterBtn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                            <i data-lucide="x" class="w-4 h-4 inline mr-1"></i>
                            重置筛选
                        </button>
                    </div>
                </div>

                <!-- 订单列表区域 -->
                <div class="orders-list">
                    ${this.renderOrdersList()}
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // 重新初始化图标
        if (window.lucide) {
            lucide.createIcons();
        }

        // 绑定事件
        this.bindEvents();
    }

    /**
     * 渲染订单统计
     */
    renderStatistics() {
        // TODO: 使用真实统计数据
        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">总订单数</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <i data-lucide="shopping-cart" class="w-6 h-6 text-purple-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">总消费金额</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">¥-</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i data-lucide="dollar-sign" class="w-6 h-6 text-green-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">待支付订单</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <i data-lucide="clock" class="w-6 h-6 text-orange-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">已完成订单</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i data-lucide="check-circle" class="w-6 h-6 text-blue-600"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染订单列表
     */
    renderOrdersList() {
        if (this.ordersList.length === 0) {
            return `
                <div class="text-center py-12 bg-gray-50 rounded-lg">
                    <i data-lucide="shopping-cart" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                    <p class="text-gray-500 mb-2">暂无订单记录</p>
                    <p class="text-sm text-gray-400">点击"新建订单"创建第一条订单</p>
                </div>
            `;
        }

        // TODO: 实现订单列表渲染
        return `
            <div class="space-y-4">
                <!-- 订单卡片将在这里渲染 -->
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 新建订单按钮
        const addBtn = this.container.querySelector('#addOrderBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleAddOrder());
        }

        // 筛选器
        const statusFilter = this.container.querySelector('#orderStatusFilter');
        const timeFilter = this.container.querySelector('#orderTimeFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.handleFilterChange());
        }
        if (timeFilter) {
            timeFilter.addEventListener('change', () => this.handleFilterChange());
        }

        // 重置筛选按钮
        const resetBtn = this.container.querySelector('#resetFilterBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleResetFilter());
        }

        // TODO: 绑定更多事件
        // - 订单卡片点击事件
        // - 支付按钮事件
        // - 取消订单事件
    }

    /**
     * 处理新建订单
     */
    handleAddOrder() {
        console.log('🆕 新建订单功能待实现');
        alert('新建订单功能待完善');

        // TODO: 实现新建订单功能
        // 1. 显示订单表单
        // 2. 选择服务项目
        // 3. 计算订单金额
        // 4. 保存订单记录
    }

    /**
     * 处理筛选变化
     */
    handleFilterChange() {
        console.log('🔍 订单筛选功能待实现');
        // TODO: 实现订单筛选功能
    }

    /**
     * 处理重置筛选
     */
    handleResetFilter() {
        const statusFilter = this.container.querySelector('#orderStatusFilter');
        const timeFilter = this.container.querySelector('#orderTimeFilter');
        if (statusFilter) statusFilter.value = '';
        if (timeFilter) timeFilter.value = '';
        this.handleFilterChange();
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="loading-spinner"></div>
                <p class="ml-3 text-gray-500">正在加载订单管理...</p>
            </div>
        `;
    }

    /**
     * 显示错误
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-red-600">
                <i data-lucide="alert-circle" class="w-12 h-12 mb-3"></i>
                <p class="text-lg font-semibold">加载失败</p>
                <p class="text-sm mt-2 text-gray-600">${message}</p>
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
     * 卸载模块
     */
    unmount() {
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }
        this.ordersList = [];
        this.currentOrder = null;
        this.statistics = null;
    }

    /**
     * 刷新模块
     */
    async refresh() {
        await this.init();
    }
}

// 导出到全局
window.OrdersModule = OrdersModule;

console.log('✅ OrdersModule 模块框架已加载');
