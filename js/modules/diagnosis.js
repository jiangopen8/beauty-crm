/**
 * 诊断管理模块
 * 管理客户的诊断记录和诊断历史
 *
 * 功能（待完善）：
 * - 查看诊断历史列表
 * - 创建新诊断记录
 * - 编辑诊断记录
 * - 删除诊断记录
 * - 诊断模板选择
 */
class DiagnosisModule {
    constructor(options = {}) {
        this.customerId = options.customerId;
        this.container = null;
        this.diagnosisList = [];
        this.currentDiagnosis = null;
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

            // TODO: 加载诊断列表数据
            await this.loadDiagnosisList();

            // 渲染UI
            this.render();
        } catch (error) {
            console.error('初始化诊断管理模块失败:', error);
            this.showError(error.message);
        }
    }

    /**
     * 加载诊断列表
     */
    async loadDiagnosisList() {
        try {
            // TODO: 实现API调用
            // const response = await fetch(`http://8.210.246.101:3000/api/diagnosis/customer/${this.customerId}`);
            // const result = await response.json();
            // if (result.success) {
            //     this.diagnosisList = result.data;
            // }

            console.log('📋 诊断列表加载功能待实现');
            this.diagnosisList = [];
        } catch (error) {
            console.error('加载诊断列表失败:', error);
        }
    }

    /**
     * 渲染UI
     */
    render() {
        const html = `
            <div class="diagnosis-module">
                <!-- 头部操作栏 -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 flex items-center">
                            <i data-lucide="clipboard" class="w-5 h-5 mr-2 text-purple-600"></i>
                            诊断管理
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">
                            客户诊断记录和历史查看
                        </p>
                    </div>
                    <button id="addDiagnosisBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                        新建诊断
                    </button>
                </div>

                <!-- 诊断列表区域 -->
                <div class="diagnosis-list">
                    ${this.renderDiagnosisList()}
                </div>

                <!-- 诊断详情/编辑区域 -->
                <div id="diagnosisDetail" class="diagnosis-detail hidden">
                    <!-- 诊断详情内容将动态填充 -->
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
     * 渲染诊断列表
     */
    renderDiagnosisList() {
        if (this.diagnosisList.length === 0) {
            return `
                <div class="text-center py-12 bg-gray-50 rounded-lg">
                    <i data-lucide="clipboard" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                    <p class="text-gray-500 mb-2">暂无诊断记录</p>
                    <p class="text-sm text-gray-400">点击"新建诊断"创建第一条诊断记录</p>
                </div>
            `;
        }

        // TODO: 实现诊断列表渲染
        return `
            <div class="grid gap-4">
                <!-- 诊断卡片将在这里渲染 -->
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 新建诊断按钮
        const addBtn = this.container.querySelector('#addDiagnosisBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleAddDiagnosis());
        }

        // TODO: 绑定更多事件
        // - 诊断卡片点击事件
        // - 编辑按钮事件
        // - 删除按钮事件
    }

    /**
     * 处理新建诊断
     */
    handleAddDiagnosis() {
        console.log('🆕 新建诊断功能待实现');
        alert('新建诊断功能待完善');

        // TODO: 实现新建诊断功能
        // 1. 显示诊断表单
        // 2. 选择诊断模板
        // 3. 填写诊断内容
        // 4. 保存诊断记录
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="loading-spinner"></div>
                <p class="ml-3 text-gray-500">正在加载诊断管理...</p>
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
        this.diagnosisList = [];
        this.currentDiagnosis = null;
    }

    /**
     * 刷新模块
     */
    async refresh() {
        await this.init();
    }
}

// 导出到全局
window.DiagnosisModule = DiagnosisModule;

console.log('✅ DiagnosisModule 模块框架已加载');
