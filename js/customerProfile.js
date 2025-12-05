/**
 * 客户详细资料管理
 * 基于模板的动态表单生成和数据管理
 */

const CustomerProfileManager = {
    // 当前客户ID
    customerId: null,

    // 当前模板
    currentTemplate: null,

    // 当前资料数据
    currentProfileData: null,

    /**
     * 初始化
     */
    async init(customerId) {
        this.customerId = customerId;
        await this.loadStandardTemplate();
        await this.loadCustomerProfile();
    },

    /**
     * 加载标准客户资料模板
     */
    async loadStandardTemplate() {
        try {
            // 获取所有模板，选择标准版模板
            const response = await fetch('http://8.210.246.101:5004/api/customer-profile-templates');
            const result = await response.json();

            if (result.success && result.data && result.data.list) {
                // 找到标准版模板（apply_scene = 'all' 或者 template_name 包含"标准"）
                this.currentTemplate = result.data.list.find(t =>
                    t.apply_scene === 'all' ||
                    t.template_name.includes('标准')
                ) || result.data.list[0]; // 如果没找到，使用第一个模板

                console.log('加载的模板:', this.currentTemplate);
            }
        } catch (error) {
            console.error('加载模板失败:', error);
        }
    },

    /**
     * 加载客户的详细资料
     */
    async loadCustomerProfile() {
        if (!this.customerId || !this.currentTemplate) return;

        try {
            const response = await fetch(
                `http://8.210.246.101:5004/api/customer-profiles/customer/${this.customerId}/template/${this.currentTemplate.id}`
            );
            const result = await response.json();

            if (result.success && result.data) {
                this.currentProfileData = result.data;
                console.log('加载的客户资料:', this.currentProfileData);
            } else {
                // 没有资料，创建空的数据结构
                this.currentProfileData = null;
            }
        } catch (error) {
            console.error('加载客户详细资料失败:', error);
        }
    },

    /**
     * 渲染详细资料表单
     */
    renderProfileForm(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.currentTemplate) return;

        const fields = this.currentTemplate.fields;
        if (!fields || fields.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">暂无模板字段配置</p>';
            return;
        }

        // 解析JSON字段（如果是字符串）
        const fieldsList = typeof fields === 'string' ? JSON.parse(fields) : fields;

        // 获取已保存的数据
        const savedData = this.currentProfileData?.profile_data || {};
        const profileData = typeof savedData === 'string' ? JSON.parse(savedData) : savedData;

        // 按分组组织字段
        const groupedFields = this.groupFields(fieldsList);

        let html = '';

        // 遍历每个分组
        for (const [groupName, groupFields] of Object.entries(groupedFields)) {
            html += `
                <div class="mb-6">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
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

        container.innerHTML = html;

        // 重新初始化图标
        if (window.lucide) {
            lucide.createIcons();
        }
    },

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
    },

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
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    ${fieldName} ${required}
                </label>
                ${inputHtml}
            </div>
        `;
    },

    /**
     * 收集表单数据
     */
    collectFormData(formId) {
        const form = document.getElementById(formId);
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
    },

    /**
     * 保存客户详细资料
     */
    async saveProfile(formId, orgId = 1, userId = 1) {
        if (!this.customerId || !this.currentTemplate) {
            alert('缺少必要的信息');
            return false;
        }

        const profileData = this.collectFormData(formId);
        if (!profileData) {
            alert('无法收集表单数据');
            return false;
        }

        console.log('准备保存的数据:', profileData);

        try {
            let response;

            if (this.currentProfileData && this.currentProfileData.id) {
                // 更新现有资料
                response = await fetch(
                    `http://8.210.246.101:5004/api/customer-profiles/customer/${this.customerId}/template/${this.currentTemplate.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            profile_data: profileData,
                            updated_by: userId
                        })
                    }
                );
            } else {
                // 创建新资料
                response = await fetch('http://8.210.246.101:5004/api/customer-profiles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        customer_id: this.customerId,
                        template_id: this.currentTemplate.id,
                        org_id: orgId,
                        profile_data: profileData,
                        template_version: this.currentTemplate.version,
                        created_by: userId
                    })
                });
            }

            const result = await response.json();

            if (result.success) {
                alert('保存成功！');
                // 重新加载数据
                await this.loadCustomerProfile();
                return true;
            } else {
                alert('保存失败：' + result.message);
                return false;
            }
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败：' + error.message);
            return false;
        }
    }
};

// 导出到全局
window.CustomerProfileManager = CustomerProfileManager;
