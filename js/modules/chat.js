/**
 * AI对话记录模块
 * 管理客户的AI咨询对话记录
 *
 * 功能（待完善）：
 * - 查看对话历史
 * - 发起新对话
 * - 查看对话详情
 * - 对话记录搜索
 * - 对话统计分析
 */
class ChatModule {
    constructor(options = {}) {
        this.customerId = options.customerId;
        this.container = null;
        this.chatHistory = [];
        this.currentConversation = null;
        this.isLoading = false;
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

            // TODO: 加载对话历史数据
            await this.loadChatHistory();

            // 渲染UI
            this.render();
        } catch (error) {
            console.error('初始化AI对话模块失败:', error);
            this.showError(error.message);
        }
    }

    /**
     * 加载对话历史
     */
    async loadChatHistory() {
        try {
            // TODO: 实现API调用
            // const response = await fetch(`http://8.210.246.101:3000/api/chat/customer/${this.customerId}`);
            // const result = await response.json();
            // if (result.success) {
            //     this.chatHistory = result.data;
            // }

            console.log('📋 对话历史加载功能待实现');
            this.chatHistory = [];
        } catch (error) {
            console.error('加载对话历史失败:', error);
        }
    }

    /**
     * 渲染UI
     */
    render() {
        const html = `
            <div class="chat-module">
                <!-- 头部操作栏 -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 flex items-center">
                            <i data-lucide="message-circle" class="w-5 h-5 mr-2 text-purple-600"></i>
                            AI对话记录
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">
                            客户AI咨询对话历史
                        </p>
                    </div>
                    <button id="newChatBtn" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                        发起新对话
                    </button>
                </div>

                <!-- 对话统计 -->
                <div class="mb-6">
                    ${this.renderStatistics()}
                </div>

                <!-- 搜索栏 -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div class="flex gap-2">
                        <div class="flex-1 relative">
                            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                id="chatSearchInput"
                                placeholder="搜索对话内容..."
                                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <button id="searchBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                            搜索
                        </button>
                    </div>
                </div>

                <!-- 对话列表区域 -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <!-- 左侧：对话列表 -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <i data-lucide="list" class="w-4 h-4 mr-2"></i>
                                对话列表
                            </h4>
                            <div id="chatList" class="space-y-2 max-h-96 overflow-y-auto">
                                ${this.renderChatList()}
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：对话详情 -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div id="chatDetail">
                                ${this.renderChatDetail()}
                            </div>
                        </div>
                    </div>
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
     * 渲染对话统计
     */
    renderStatistics() {
        // TODO: 使用真实统计数据
        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">对话总数</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <i data-lucide="message-circle" class="w-6 h-6 text-purple-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">本周对话</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i data-lucide="calendar" class="w-6 h-6 text-blue-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">消息总数</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i data-lucide="hash" class="w-6 h-6 text-green-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">平均响应</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">-</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <i data-lucide="zap" class="w-6 h-6 text-orange-600"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染对话列表
     */
    renderChatList() {
        if (this.chatHistory.length === 0) {
            return `
                <div class="text-center py-8">
                    <i data-lucide="message-circle" class="w-8 h-8 mx-auto mb-2 text-gray-400"></i>
                    <p class="text-sm text-gray-500">暂无对话记录</p>
                </div>
            `;
        }

        // TODO: 实现对话列表渲染
        return `
            <div class="space-y-2">
                <!-- 对话条目将在这里渲染 -->
            </div>
        `;
    }

    /**
     * 渲染对话详情
     */
    renderChatDetail() {
        if (!this.currentConversation) {
            return `
                <div class="text-center py-12">
                    <i data-lucide="message-square" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                    <p class="text-gray-500 mb-2">选择一个对话查看详情</p>
                    <p class="text-sm text-gray-400">或点击"发起新对话"开始AI咨询</p>
                </div>
            `;
        }

        // TODO: 实现对话详情渲染
        return `
            <div class="chat-messages">
                <!-- 对话消息将在这里渲染 -->
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 发起新对话按钮
        const newChatBtn = this.container.querySelector('#newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.handleNewChat());
        }

        // 搜索按钮
        const searchBtn = this.container.querySelector('#searchBtn');
        const searchInput = this.container.querySelector('#chatSearchInput');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // TODO: 绑定更多事件
        // - 对话条目点击事件
        // - 消息发送事件
        // - 对话删除事件
    }

    /**
     * 处理发起新对话
     */
    handleNewChat() {
        console.log('🆕 发起新对话功能待实现');
        alert('发起新对话功能待完善');

        // TODO: 实现发起新对话功能
        // 1. 创建新对话会话
        // 2. 显示对话界面
        // 3. 连接AI服务
        // 4. 实时消息交互
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        const searchInput = this.container.querySelector('#chatSearchInput');
        const keyword = searchInput?.value.trim();

        if (!keyword) {
            alert('请输入搜索关键词');
            return;
        }

        console.log('🔍 搜索对话功能待实现:', keyword);

        // TODO: 实现搜索功能
        // 1. 调用搜索API
        // 2. 过滤对话列表
        // 3. 高亮匹配内容
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="loading-spinner"></div>
                <p class="ml-3 text-gray-500">正在加载AI对话记录...</p>
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
        this.chatHistory = [];
        this.currentConversation = null;
    }

    /**
     * 刷新模块
     */
    async refresh() {
        await this.init();
    }
}

// 导出到全局
window.ChatModule = ChatModule;

console.log('✅ ChatModule 模块框架已加载');
