/**
 * 客户资料模块
 * 独立的客户资料管理功能
 *
 * 功能：
 * - 加载客户资料模板
 * - 动态渲染表单
 * - 保存/更新客户资料
 */
class CustomerProfileModule {
    constructor(options = {}) {
        this.customerId = options.customerId;
        this.container = null;
        this.currentTemplate = null;
        this.currentProfileData = null;
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
            // 显示加载状态
            this.showLoading();

            // 加载数据
            await this.loadStandardTemplate();
            await this.loadCustomerProfile();

            // 渲染UI
            this.render();
        } catch (error) {
            console.error('初始化客户资料模块失败:', error);
            this.showError(error.message);
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="loading-spinner"></div>
                <p class="ml-3 text-gray-500">正在加载客户资料...</p>
            </div>
        `;
    }

    /**
     * 加载标准客户资料模板
     */
    async loadStandardTemplate() {
        try {
            // 优先尝试连接到本地服务器（使用5004端口）
            const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5004'
                : `http://${window.location.hostname}:5004`;

            const response = await fetch(`${apiUrl}/api/customer-profile-templates`);

            if (!response.ok) {
                console.warn('无法从主服务器加载，尝试备用地址...');
                // 如果主服务器不可用，尝试备用地址
                const fallbackUrl = 'http://8.210.246.101:5004/api/customer-profile-templates';
                const fallbackResponse = await fetch(fallbackUrl);
                if (!fallbackResponse.ok) throw new Error('无法加载模板');
                const result = await fallbackResponse.json();
                this.handleTemplateResponse(result);
                return;
            }

            const result = await response.json();
            this.handleTemplateResponse(result);
        } catch (error) {
            console.error('加载模板失败:', error);
            this.showError('无法加载客户资料模板，请检查服务器连接');
        }
    }

    /**
     * 处理模板响应
     */
    handleTemplateResponse(result) {
        if (result.success && result.data) {
            const data = result.data;
            // 支持两种返回格式：直接数组或带有 list 属性的对象
            const templateList = Array.isArray(data) ? data : (data.list || []);

            if (templateList.length > 0) {
                // 优先选择默认模板或标准版
                this.currentTemplate = templateList.find(t =>
                    t.is_default === 1 || t.template_name.includes('标准') || t.template_code === 'DEFAULT_BASIC'
                ) || templateList[0];

                console.log('✅ 模板加载成功:', this.currentTemplate.template_name);
            } else {
                throw new Error('没有可用的模板');
            }
        } else {
            throw new Error(result.error?.message || '模板加载失败');
        }
    }

    /**
     * 加载客户的详细资料
     */
    async loadCustomerProfile() {
        if (!this.customerId || !this.currentTemplate) return;

        try {
            const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5004'
                : `http://${window.location.hostname}:5004`;

            const url = `${apiUrl}/api/customer-profiles/customer/${this.customerId}/template/${this.currentTemplate.id}`;

            const response = await fetch(url);
            const result = await response.json();

            if (result.success && result.data) {
                this.currentProfileData = result.data;
                console.log('✅ 客户资料加载成功');
            } else {
                console.log('ℹ️ 客户暂无资料，将创建新资料');
            }
        } catch (error) {
            console.error('加载客户详细资料失败:', error);
        }
    }

    /**
     * 渲染UI
     */
    render() {
        if (!this.currentTemplate) {
            this.container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                    <p class="text-gray-500">暂无模板配置</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        const fields = typeof this.currentTemplate.fields === 'string'
            ? JSON.parse(this.currentTemplate.fields)
            : this.currentTemplate.fields;

        const savedData = this.currentProfileData?.profile_data || {};
        const profileData = typeof savedData === 'string' ? JSON.parse(savedData) : savedData;

        const groupedFields = this.groupFields(fields);

        let html = `
            <div class="form-card">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 flex items-center">
                            <i data-lucide="user" class="w-5 h-5 mr-2 text-purple-600"></i>
                            客户详细资料
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">
                            模板: ${this.currentTemplate.template_name}
                        </p>
                    </div>
                    <div class="text-right">
                        ${this.currentProfileData ? `
                            <p class="text-xs text-gray-500">
                                <i data-lucide="clock" class="w-3 h-3 inline"></i>
                                最后更新: ${new Date(this.currentProfileData.updated_at).toLocaleString('zh-CN')}
                            </p>
                        ` : `
                            <p class="text-xs text-orange-500">
                                <i data-lucide="alert-circle" class="w-3 h-3 inline"></i>
                                尚未填写
                            </p>
                        `}
                    </div>
                </div>
                <form id="profileForm">
        `;

        // 遍历每个分组
        for (const [groupName, groupFields] of Object.entries(groupedFields)) {
            html += `
                <div class="mb-6">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                        <i data-lucide="folder" class="w-4 h-4 mr-2 text-purple-500"></i>
                        ${groupName}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            `;

            groupFields.forEach(field => {
                html += this.renderField(field, profileData[field.field_key]);
            });

            html += `
                    </div>
                </div>
            `;
        }

        html += `
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <div class="flex justify-end space-x-3">
                        <button type="button" id="resetProfileBtn" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <i data-lucide="rotate-ccw" class="w-4 h-4 inline mr-2"></i>
                            重置
                        </button>
                        <button type="button" id="saveProfileBtn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <i data-lucide="save" class="w-4 h-4 inline mr-2"></i>
                            保存资料
                        </button>
                    </div>
                </div>
            </form>
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
     * 绑定事件
     */
    bindEvents() {
        const saveBtn = this.container.querySelector('#saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }

        const resetBtn = this.container.querySelector('#resetProfileBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('确定要重置表单吗？未保存的数据将丢失。')) {
                    this.render();
                }
            });
        }
    }

    /**
     * 按分组组织字段
     */
    groupFields(fields) {
        const grouped = {};
        fields.forEach(field => {
            const group = field.group || '基本信息';
            if (!grouped[group]) {
                grouped[group] = [];
            }
            grouped[group].push(field);
        });
        return grouped;
    }

    /**
     * 渲染单个字段
     */
    renderField(field, value) {
        const fieldKey = field.field_key;
        const fieldName = field.field_name;
        const fieldType = field.field_type;
        const required = field.required ? '<span class="text-red-500">*</span>' : '';
        const placeholder = field.placeholder || `请输入${fieldName}`;

        let inputHtml = '';

        switch (fieldType) {
            case 'text':
            case 'email':
            case 'tel':
                inputHtml = `
                    <input
                        type="${fieldType}"
                        id="field_${fieldKey}"
                        name="${fieldKey}"
                        value="${value || ''}"
                        placeholder="${placeholder}"
                        ${field.required ? 'required' : ''}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                `;
                break;

            case 'textarea':
                inputHtml = `
                    <textarea
                        id="field_${fieldKey}"
                        name="${fieldKey}"
                        rows="3"
                        placeholder="${placeholder}"
                        ${field.required ? 'required' : ''}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >${value || ''}</textarea>
                `;
                break;

            case 'number':
                inputHtml = `
                    <input
                        type="number"
                        id="field_${fieldKey}"
                        name="${fieldKey}"
                        value="${value || ''}"
                        placeholder="${placeholder}"
                        ${field.required ? 'required' : ''}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                `;
                break;

            case 'date':
                inputHtml = `
                    <input
                        type="date"
                        id="field_${fieldKey}"
                        name="${fieldKey}"
                        value="${value || ''}"
                        ${field.required ? 'required' : ''}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                `;
                break;

            case 'select':
                const options = field.options || [];
                inputHtml = `
                    <select
                        id="field_${fieldKey}"
                        name="${fieldKey}"
                        ${field.required ? 'required' : ''}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                        <option value="">请选择${fieldName}</option>
                        ${options.map(opt => `
                            <option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>
                        `).join('')}
                    </select>
                `;
                break;

            case 'radio':
                const radioOptions = field.options || [];
                inputHtml = `
                    <div class="flex flex-wrap gap-3">
                        ${radioOptions.map(opt => `
                            <label class="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="${fieldKey}"
                                    value="${opt}"
                                    ${value === opt ? 'checked' : ''}
                                    ${field.required ? 'required' : ''}
                                    class="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span class="ml-2 text-sm text-gray-700">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;

            case 'checkbox':
                const checkboxOptions = field.options || [];
                const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
                inputHtml = `
                    <div class="flex flex-wrap gap-3">
                        ${checkboxOptions.map(opt => `
                            <label class="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="${fieldKey}[]"
                                    value="${opt}"
                                    ${selectedValues.includes(opt) ? 'checked' : ''}
                                    class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span class="ml-2 text-sm text-gray-700">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;

            default:
                inputHtml = `
                    <input
                        type="text"
                        id="field_${fieldKey}"
                        name="${fieldKey}"
                        value="${value || ''}"
                        placeholder="${placeholder}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                `;
        }

        return `
            <div class="form-group">
                <label for="field_${fieldKey}" class="block text-sm font-medium text-gray-700 mb-2">
                    ${fieldName} ${required}
                </label>
                ${inputHtml}
            </div>
        `;
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
        const form = this.container.querySelector('#profileForm');
        if (!form || !this.currentTemplate) return null;

        const fields = typeof this.currentTemplate.fields === 'string'
            ? JSON.parse(this.currentTemplate.fields)
            : this.currentTemplate.fields;

        const formData = {};

        fields.forEach(field => {
            const fieldKey = field.field_key;
            const fieldType = field.field_type;

            if (fieldType === 'checkbox') {
                // 复选框：收集所有选中的值
                const checkboxes = form.querySelectorAll(`input[name="${fieldKey}[]"]:checked`);
                formData[fieldKey] = Array.from(checkboxes).map(cb => cb.value);
            } else if (fieldType === 'radio') {
                // 单选框
                const radio = form.querySelector(`input[name="${fieldKey}"]:checked`);
                formData[fieldKey] = radio ? radio.value : '';
            } else {
                // 其他类型
                const input = form.querySelector(`[name="${fieldKey}"]`);
                formData[fieldKey] = input ? input.value : '';
            }
        });

        return formData;
    }

    /**
     * 保存客户详细资料
     */
    async saveProfile() {
        const profileData = this.collectFormData();
        if (!profileData) {
            alert('无法收集表单数据');
            return false;
        }

        console.log('准备保存的数据:', profileData);

        // 禁用保存按钮
        const saveBtn = this.container.querySelector('#saveProfileBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 inline mr-2 animate-spin"></i>保存中...';

        try {
            const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5004'
                : `http://${window.location.hostname}:5004`;

            let response;

            if (this.currentProfileData && this.currentProfileData.id) {
                // 更新现有资料
                console.log('更新现有资料...');
                response = await fetch(
                    `${apiUrl}/api/customer-profiles/customer/${this.customerId}/template/${this.currentTemplate.id}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            profile_data: profileData,
                            updated_by: 1
                        })
                    }
                );
            } else {
                // 创建新资料
                console.log('创建新资料...');
                response = await fetch(`${apiUrl}/api/customer-profiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: this.customerId,
                        template_id: this.currentTemplate.id,
                        org_id: 1,
                        profile_data: profileData,
                        template_version: this.currentTemplate.version || '1.0',
                        created_by: 1
                    })
                });
            }

            const result = await response.json();

            if (result.success) {
                alert('✅ 保存成功！');
                // 重新加载数据
                await this.loadCustomerProfile();
                // 重新渲染（显示更新时间）
                this.render();
                return true;
            } else {
                alert('❌ 保存失败：' + result.message);
                return false;
            }
        } catch (error) {
            console.error('保存失败:', error);
            alert('❌ 保存失败：' + error.message);
            return false;
        } finally {
            // 恢复按钮状态
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
            if (window.lucide) lucide.createIcons();
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
        this.currentTemplate = null;
        this.currentProfileData = null;
    }

    /**
     * 刷新模块
     */
    async refresh() {
        await this.init();
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
}

// 导出到全局
window.CustomerProfileModule = CustomerProfileModule;

console.log('✅ CustomerProfileModule 模块已加载');
