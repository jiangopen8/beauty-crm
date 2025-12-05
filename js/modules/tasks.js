/**
 * 任务管理模块
 * 管理客户的跟进任务和待办事项
 *
 * 功能（待完善）：
 * - 查看任务列表
 * - 创建新任务
 * - 编辑任务
 * - 完成/取消任务
 * - 任务提醒
 * - 任务统计
 */
class TasksModule {
    constructor(options = {}) {
        this.customerId = options.customerId;
        this.container = null;
        this.tasksList = [];
        this.currentTask = null;
        this.filterStatus = 'all'; // all, pending, completed, overdue
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

            // TODO: 加载任务列表数据
            await this.loadTasksList();

            // 渲染UI
            this.render();
        } catch (error) {
            console.error('初始化任务管理模块失败:', error);
            this.showError(error.message);
        }
    }

    /**
     * 加载任务列表
     */
    async loadTasksList() {
        try {
            // TODO: 实现API调用
            // const response = await fetch(`http://8.210.246.101:3000/api/tasks/customer/${this.customerId}`);
            // const result = await response.json();
            // if (result.success) {
            //     this.tasksList = result.data;
            // }

            console.log('📋 任务列表加载功能待实现');
            this.tasksList = [];
        } catch (error) {
            console.error('加载任务列表失败:', error);
        }
    }

    /**
     * 渲染UI
     */
    render() {
        const html = `
            <div class="tasks-module">
                <!-- 头部操作栏 -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 flex items-center">
                            <i data-lucide="check-square" class="w-5 h-5 mr-2 text-purple-600"></i>
                            任务管理
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">
                            客户跟进任务和待办事项
                        </p>
                    </div>
                    <button id="addTaskBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                        新建任务
                    </button>
                </div>

                <!-- 任务统计卡片 -->
                <div class="mb-6">
                    ${this.renderStatistics()}
                </div>

                <!-- 任务筛选标签 -->
                <div class="flex gap-2 mb-4 overflow-x-auto">
                    <button class="filter-tab ${this.filterStatus === 'all' ? 'active' : ''}" data-status="all">
                        <i data-lucide="list" class="w-4 h-4 inline mr-1"></i>
                        全部任务
                    </button>
                    <button class="filter-tab ${this.filterStatus === 'pending' ? 'active' : ''}" data-status="pending">
                        <i data-lucide="clock" class="w-4 h-4 inline mr-1"></i>
                        进行中
                    </button>
                    <button class="filter-tab ${this.filterStatus === 'completed' ? 'active' : ''}" data-status="completed">
                        <i data-lucide="check-circle" class="w-4 h-4 inline mr-1"></i>
                        已完成
                    </button>
                    <button class="filter-tab ${this.filterStatus === 'overdue' ? 'active' : ''}" data-status="overdue">
                        <i data-lucide="alert-circle" class="w-4 h-4 inline mr-1"></i>
                        已逾期
                    </button>
                </div>

                <!-- 任务列表区域 -->
                <div class="tasks-list">
                    ${this.renderTasksList()}
                </div>
            </div>

            <style>
                .filter-tab {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    background: white;
                    color: #6b7280;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-tab:hover {
                    background: #f9fafb;
                    border-color: #667eea;
                }
                .filter-tab.active {
                    background: #667eea;
                    color: white;
                    border-color: #667eea;
                }
            </style>
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
     * 渲染任务统计
     */
    renderStatistics() {
        // TODO: 使用真实统计数据
        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">总任务数</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i data-lucide="list" class="w-6 h-6 text-blue-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">进行中</p>
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
                            <p class="text-sm text-gray-500">已完成</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i data-lucide="check-circle" class="w-6 h-6 text-green-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">已逾期</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <i data-lucide="alert-circle" class="w-6 h-6 text-red-600"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染任务列表
     */
    renderTasksList() {
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            return `
                <div class="text-center py-12 bg-gray-50 rounded-lg">
                    <i data-lucide="check-square" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                    <p class="text-gray-500 mb-2">暂无任务记录</p>
                    <p class="text-sm text-gray-400">点击"新建任务"创建第一个任务</p>
                </div>
            `;
        }

        // TODO: 实现任务列表渲染
        return `
            <div class="space-y-3">
                <!-- 任务卡片将在这里渲染 -->
            </div>
        `;
    }

    /**
     * 获取筛选后的任务列表
     */
    getFilteredTasks() {
        if (this.filterStatus === 'all') {
            return this.tasksList;
        }
        return this.tasksList.filter(task => task.status === this.filterStatus);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 新建任务按钮
        const addBtn = this.container.querySelector('#addTaskBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleAddTask());
        }

        // 筛选标签
        this.container.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                this.handleFilterChange(status);
            });
        });

        // TODO: 绑定更多事件
        // - 任务卡片点击事件
        // - 完成任务事件
        // - 编辑任务事件
        // - 删除任务事件
    }

    /**
     * 处理新建任务
     */
    handleAddTask() {
        console.log('🆕 新建任务功能待实现');
        alert('新建任务功能待完善');

        // TODO: 实现新建任务功能
        // 1. 显示任务表单
        // 2. 填写任务信息
        // 3. 设置提醒时间
        // 4. 保存任务记录
    }

    /**
     * 处理筛选变化
     */
    handleFilterChange(status) {
        this.filterStatus = status;
        this.render();
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="loading-spinner"></div>
                <p class="ml-3 text-gray-500">正在加载任务管理...</p>
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
        this.tasksList = [];
        this.currentTask = null;
    }

    /**
     * 刷新模块
     */
    async refresh() {
        await this.init();
    }
}

// 导出到全局
window.TasksModule = TasksModule;

console.log('✅ TasksModule 模块框架已加载');
