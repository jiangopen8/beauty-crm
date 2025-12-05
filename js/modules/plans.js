/**
 * 方案管理模块
 * 管理客户的美容方案和方案模板
 *
 * 功能（待完善）：
 * - 查看方案列表
 * - 创建新方案
 * - 编辑方案
 * - 删除方案
 * - 方案模板选择
 * - AI智能生成方案
 */
class PlansModule {
    constructor(options = {}) {
        this.customerId = options.customerId;
        this.container = null;
        this.plansList = [];
        this.currentPlan = null;
        this.templates = [];
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

            // TODO: 加载方案列表和模板数据
            await this.loadPlansList();
            await this.loadTemplates();

            // 渲染UI
            this.render();
        } catch (error) {
            console.error('初始化方案管理模块失败:', error);
            this.showError(error.message);
        }
    }

    /**
     * 加载方案列表
     */
    async loadPlansList() {
        try {
            // TODO: 实现API调用
            // const response = await fetch(`http://8.210.246.101:3000/api/plans/customer/${this.customerId}`);
            // const result = await response.json();
            // if (result.success) {
            //     this.plansList = result.data;
            // }

            console.log('📋 方案列表加载功能待实现');
            this.plansList = [];
        } catch (error) {
            console.error('加载方案列表失败:', error);
        }
    }

    /**
     * 加载方案模板
     */
    async loadTemplates() {
        try {
            // TODO: 实现API调用
            // const response = await fetch('http://8.210.246.101:3000/api/solution-templates');
            // const result = await response.json();
            // if (result.success) {
            //     this.templates = result.data;
            // }

            console.log('📋 方案模板加载功能待实现');
            this.templates = [];
        } catch (error) {
            console.error('加载方案模板失败:', error);
        }
    }

    /**
     * 渲染UI
     */
    render() {
        const html = `
            <div class="plans-module">
                <!-- 头部操作栏 -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 flex items-center">
                            <i data-lucide="file-text" class="w-5 h-5 mr-2 text-purple-600"></i>
                            方案管理
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">
                            美容方案创建和管理
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button id="aiGeneratePlanBtn" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
                            <i data-lucide="sparkles" class="w-4 h-4 inline mr-2"></i>
                            AI生成方案
                        </button>
                        <button id="addPlanBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                            新建方案
                        </button>
                    </div>
                </div>

                <!-- 方案列表区域 -->
                <div class="plans-list">
                    ${this.renderPlansList()}
                </div>

                <!-- 方案详情/编辑区域 -->
                <div id="planDetail" class="plan-detail hidden">
                    <!-- 方案详情内容将动态填充 -->
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
     * 渲染方案列表
     */
    renderPlansList() {
        if (this.plansList.length === 0) {
            return `
                <div class="text-center py-12 bg-gray-50 rounded-lg">
                    <i data-lucide="file-text" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                    <p class="text-gray-500 mb-2">暂无美容方案</p>
                    <p class="text-sm text-gray-400">点击"新建方案"或"AI生成方案"创建方案</p>
                </div>
            `;
        }

        // TODO: 实现方案列表渲染
        return `
            <div class="grid gap-4">
                <!-- 方案卡片将在这里渲染 -->
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 新建方案按钮
        const addBtn = this.container.querySelector('#addPlanBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleAddPlan());
        }

        // AI生成方案按钮
        const aiBtn = this.container.querySelector('#aiGeneratePlanBtn');
        if (aiBtn) {
            aiBtn.addEventListener('click', () => this.handleAIGenerate());
        }

        // TODO: 绑定更多事件
        // - 方案卡片点击事件
        // - 编辑按钮事件
        // - 删除按钮事件
        // - 模板选择事件
    }

    /**
     * 处理新建方案
     */
    handleAddPlan() {
        console.log('🆕 新建方案功能待实现');
        alert('新建方案功能待完善');

        // TODO: 实现新建方案功能
        // 1. 显示方案表单
        // 2. 选择方案模板
        // 3. 填写方案内容
        // 4. 保存方案记录
    }

    /**
     * 处理AI生成方案
     */
    handleAIGenerate() {
        console.log('🤖 AI生成方案功能待实现');
        alert('AI生成方案功能待完善');

        // TODO: 实现AI生成方案功能
        // 1. 获取客户资料和诊断信息
        // 2. 调用AI接口生成方案
        // 3. 展示生成结果
        // 4. 允许编辑和保存
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="loading-spinner"></div>
                <p class="ml-3 text-gray-500">正在加载方案管理...</p>
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
        this.plansList = [];
        this.currentPlan = null;
        this.templates = [];
    }

    /**
     * 刷新模块
     */
    async refresh() {
        await this.init();
    }
}

// 导出到全局
window.PlansModule = PlansModule;

console.log('✅ PlansModule 模块框架已加载');
