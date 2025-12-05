/**
 * 前端API配置和工具函数
 */

// API基础URL - 配置后端服务器地址
// 开发环境: http://localhost:5004
// 生产环境: http://8.210.246.101:5004
let API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5004'
    : `http://${window.location.hostname}:5004`;

/**
 * 获取 API 基础 URL，支持多个候选地址的回退
 */
function getAPIBaseURL() {
    return API_BASE_URL;
}

/**
 * 为 API 调用添加重试机制
 */
async function fetchWithRetry(url, options = {}, maxRetries = 2) {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                timeout: 10000
            });
            return response;
        } catch (error) {
            lastError = error;

            // 如果不是第一次尝试或最后一次，等待后重试
            if (attempt < maxRetries) {
                const delayMs = Math.min(1000 * Math.pow(2, attempt), 5000);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                continue;
            }
        }
    }

    throw lastError;
}

/**
 * 封装fetch请求
 */
const api = {
    /**
     * GET请求
     */
    async get(url, params = {}) {
        // 过滤掉null和undefined的参数
        const filteredParams = Object.entries(params)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const queryString = new URLSearchParams(filteredParams).toString();
        const fullUrl = `${getAPIBaseURL()}${url}${queryString ? '?' + queryString : ''}`;

        try {
            const response = await fetchWithRetry(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return await response.json();
        } catch (error) {
            console.error('API GET请求失败:', error);
            throw error;
        }
    },

    /**
     * POST请求
     */
    async post(url, data) {
        try {
            const response = await fetchWithRetry(`${getAPIBaseURL()}${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return await response.json();
        } catch (error) {
            console.error('API POST请求失败:', error);
            throw error;
        }
    },

    /**
     * PUT请求
     */
    async put(url, data) {
        try {
            const response = await fetchWithRetry(`${getAPIBaseURL()}${url}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return await response.json();
        } catch (error) {
            console.error('API PUT请求失败:', error);
            throw error;
        }
    },

    /**
     * PATCH请求
     */
    async patch(url, data) {
        try {
            const response = await fetchWithRetry(`${getAPIBaseURL()}${url}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return await response.json();
        } catch (error) {
            console.error('API PATCH请求失败:', error);
            throw error;
        }
    },

    /**
     * DELETE请求
     */
    async delete(url) {
        try {
            const response = await fetchWithRetry(`${getAPIBaseURL()}${url}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return await response.json();
        } catch (error) {
            console.error('API DELETE请求失败:', error);
            throw error;
        }
    }
};

/**
 * 加盟商API
 */
const franchiseeAPI = {
    /**
     * 获取加盟商列表
     */
    async getList(params) {
        return await api.get('/api/franchisees', params);
    },

    /**
     * 获取加盟商详情
     */
    async getById(id) {
        return await api.get(`/api/franchisees/${id}`);
    },

    /**
     * 创建加盟商
     */
    async create(data) {
        return await api.post('/api/franchisees', data);
    },

    /**
     * 更新加盟商
     */
    async update(id, data) {
        return await api.put(`/api/franchisees/${id}`, data);
    },

    /**
     * 更新加盟商状态
     */
    async updateStatus(id, status) {
        return await api.patch(`/api/franchisees/${id}/status`, { status });
    },

    /**
     * 删除加盟商
     */
    async delete(id) {
        return await api.delete(`/api/franchisees/${id}`);
    },

    /**
     * 获取统计数据
     */
    async getStats() {
        return await api.get('/api/franchisees/stats');
    }
};

/**
 * 用户API
 */
const userAPI = {
    /**
     * 获取用户列表
     */
    async getList(params) {
        return await api.get('/api/users', params);
    },

    /**
     * 获取用户详情
     */
    async getById(id) {
        return await api.get(`/api/users/${id}`);
    },

    /**
     * 获取当前用户信息
     */
    async getCurrentUser() {
        return await api.get('/api/users/current');
    },

    /**
     * 创建用户
     */
    async create(data) {
        return await api.post('/api/users', data);
    },

    /**
     * 更新用户
     */
    async update(id, data) {
        return await api.put(`/api/users/${id}`, data);
    },

    /**
     * 更新用户状态
     */
    async updateStatus(id, status) {
        return await api.patch(`/api/users/${id}/status`, { status });
    },

    /**
     * 更新密码
     */
    async updatePassword(id, oldPassword, newPassword) {
        return await api.patch(`/api/users/${id}/password`, {
            old_password: oldPassword,
            new_password: newPassword
        });
    },

    /**
     * 管理员重置密码为默认密码 123456
     */
    async resetPassword(id) {
        return await api.post(`/api/users/${id}/reset-password`);
    },

    /**
     * 删除用户
     */
    async delete(id) {
        return await api.delete(`/api/users/${id}`);
    },

    /**
     * 获取统计数据
     */
    async getStats(orgId = null) {
        return await api.get('/api/users/stats', orgId ? { org_id: orgId } : {});
    }
};

// ============================================
// 组织管理 API
// ============================================
const organizationAPI = {
    /**
     * 获取组织列表
     */
    async getList(params) {
        return await api.get('/api/organizations', params);
    },

    /**
     * 获取单个组织详情
     */
    async getById(id) {
        return await api.get(`/api/organizations/${id}`);
    },

    /**
     * 获取树形组织结构
     */
    async getTree() {
        return await api.get('/api/organizations/tree');
    },

    /**
     * 创建组织
     */
    async create(data) {
        return await api.post('/api/organizations', data);
    },

    /**
     * 更新组织信息
     */
    async update(id, data) {
        return await api.put(`/api/organizations/${id}`, data);
    },

    /**
     * 更新组织状态
     */
    async updateStatus(id, status) {
        return await api.patch(`/api/organizations/${id}/status`, { status });
    },

    /**
     * 删除组织
     */
    async delete(id) {
        return await api.delete(`/api/organizations/${id}`);
    },

    /**
     * 获取统计信息
     */
    async getStats() {
        return await api.get('/api/organizations/stats');
    }
};

// ============================================
// 角色管理 API
// ============================================
const roleAPI = {
    /**
     * 获取角色列表
     */
    async getList(params) {
        return await api.get('/api/roles', params);
    },

    /**
     * 获取单个角色详情
     */
    async getById(id) {
        return await api.get(`/api/roles/${id}`);
    },

    /**
     * 创建角色
     */
    async create(data) {
        return await api.post('/api/roles', data);
    },

    /**
     * 更新角色信息
     */
    async update(id, data) {
        return await api.put(`/api/roles/${id}`, data);
    },

    /**
     * 删除角色
     */
    async delete(id) {
        return await api.delete(`/api/roles/${id}`);
    },

    /**
     * 获取统计信息
     */
    async getStats() {
        return await api.get('/api/roles/stats');
    },

    /**
     * 为用户分配角色
     */
    async assignToUser(userId, roleIds) {
        return await api.post('/api/roles/assign-user', { user_id: userId, role_ids: roleIds });
    },

    /**
     * 获取用户的角色列表
     */
    async getUserRoles(userId) {
        return await api.get(`/api/roles/user/${userId}`);
    }
};

// ============================================
// 客户案例管理 API
// ============================================
const caseAPI = {
    /**
     * 获取案例列表
     */
    async getList(params) {
        return await api.get('/api/cases', params);
    },

    /**
     * 获取单个案例详情
     */
    async getById(id) {
        return await api.get(`/api/cases/${id}`);
    },

    /**
     * 创建案例
     */
    async create(data) {
        return await api.post('/api/cases', data);
    },

    /**
     * 更新案例信息
     */
    async update(id, data) {
        return await api.put(`/api/cases/${id}`, data);
    },

    /**
     * 更新精选状态
     */
    async updateFeatured(id, is_featured) {
        return await api.patch(`/api/cases/${id}/featured`, { is_featured });
    },

    /**
     * 更新公开状态
     */
    async updatePublic(id, is_public) {
        return await api.patch(`/api/cases/${id}/public`, { is_public });
    },

    /**
     * 删除案例
     */
    async delete(id) {
        return await api.delete(`/api/cases/${id}`);
    },

    /**
     * 获取统计信息
     */
    async getStats(orgId) {
        return await api.get('/api/cases/stats', { org_id: orgId });
    }
};

// ============================================
// AI 服务 API
// ============================================
const aiAPI = {
    /**
     * AI 润色案例，生成营销文案
     */
    async polishCase(caseData) {
        return await api.post('/api/ai/polish-case', caseData);
    },

    /**
     * AI 生成标题建议
     */
    async suggestTitles(caseData) {
        return await api.post('/api/ai/suggest-titles', caseData);
    },

    /**
     * 测试 AI 服务
     */
    async test() {
        return await api.get('/api/ai/test');
    }
};

// ============================================
// 方案模板 API
// ============================================
const solutionTemplateAPI = {
    /**
     * 获取模板列表
     */
    async getList(params) {
        return await api.get('/api/solution-templates', params);
    },

    /**
     * 获取单个模板详情
     */
    async getById(id) {
        return await api.get(`/api/solution-templates/${id}`);
    },

    /**
     * 创建模板
     */
    async create(data) {
        return await api.post('/api/solution-templates', data);
    },

    /**
     * 更新模板信息
     */
    async update(id, data) {
        return await api.put(`/api/solution-templates/${id}`, data);
    },

    /**
     * 更新模板状态
     */
    async updateStatus(id, status) {
        return await api.patch(`/api/solution-templates/${id}/status`, { status });
    },

    /**
     * 删除模板
     */
    async delete(id) {
        return await api.delete(`/api/solution-templates/${id}`);
    },

    /**
     * 增加使用次数
     */
    async incrementUsage(id) {
        return await api.post(`/api/solution-templates/${id}/increment-usage`);
    },

    /**
     * 获取统计信息
     */
    async getStats(orgId) {
        return await api.get('/api/solution-templates/stats', { org_id: orgId });
    }
};

// ============================================
// 客户资料模板 API
// ============================================
const customerProfileTemplateAPI = {
    /**
     * 获取模板列表
     */
    async getList(params) {
        return await api.get('/api/customer-profile-templates', params);
    },

    /**
     * 获取单个模板详情
     */
    async getById(id) {
        return await api.get(`/api/customer-profile-templates/${id}`);
    },

    /**
     * 创建模板
     */
    async create(data) {
        return await api.post('/api/customer-profile-templates', data);
    },

    /**
     * 更新模板信息
     */
    async update(id, data) {
        return await api.put(`/api/customer-profile-templates/${id}`, data);
    },

    /**
     * 更新模板状态
     */
    async updateStatus(id, status) {
        return await api.patch(`/api/customer-profile-templates/${id}/status`, { status });
    },

    /**
     * 删除模板
     */
    async delete(id) {
        return await api.delete(`/api/customer-profile-templates/${id}`);
    },

    /**
     * 复制模板
     */
    async duplicate(id) {
        return await api.post(`/api/customer-profile-templates/${id}/duplicate`);
    },

    /**
     * 增加使用次数
     */
    async incrementUsage(id) {
        return await api.post(`/api/customer-profile-templates/${id}/increment-usage`);
    },

    /**
     * 获取统计信息
     */
    async getStats(orgId) {
        return await api.get('/api/customer-profile-templates/stats', { org_id: orgId });
    }
};

// ============================================
// 诊断模板 API
// ============================================
const diagnosisTemplateAPI = {
    /**
     * 获取模板列表
     */
    async getList(params) {
        return await api.get('/api/diagnosis-templates', params);
    },

    /**
     * 获取单个模板详情
     */
    async getById(id) {
        return await api.get(`/api/diagnosis-templates/${id}`);
    },

    /**
     * 创建模板
     */
    async create(data) {
        return await api.post('/api/diagnosis-templates', data);
    },

    /**
     * 更新模板信息
     */
    async update(id, data) {
        return await api.put(`/api/diagnosis-templates/${id}`, data);
    },

    /**
     * 更新模板状态
     */
    async updateStatus(id, status) {
        return await api.patch(`/api/diagnosis-templates/${id}/status`, { status });
    },

    /**
     * 删除模板
     */
    async delete(id) {
        return await api.delete(`/api/diagnosis-templates/${id}`);
    },

    /**
     * 复制模板
     */
    async duplicate(id) {
        return await api.post(`/api/diagnosis-templates/${id}/duplicate`);
    },

    /**
     * 增加使用次数
     */
    async incrementUsage(id) {
        return await api.post(`/api/diagnosis-templates/${id}/increment-usage`);
    },

    /**
     * 获取统计信息
     */
    async getStats(orgId) {
        return await api.get('/api/diagnosis-templates/stats', { org_id: orgId });
    }
};

// ============================================
// 任务模板 API
// ============================================
const taskTemplateAPI = {
    /**
     * 获取模板列表
     */
    async getList(params) {
        return await api.get('/api/task-templates', params);
    },

    /**
     * 获取单个模板详情
     */
    async getById(id) {
        return await api.get(`/api/task-templates/${id}`);
    },

    /**
     * 创建模板
     */
    async create(data) {
        return await api.post('/api/task-templates', data);
    },

    /**
     * 更新模板信息
     */
    async update(id, data) {
        return await api.put(`/api/task-templates/${id}`, data);
    },

    /**
     * 删除模板
     */
    async delete(id) {
        return await api.delete(`/api/task-templates/${id}`);
    },

    /**
     * 复制模板
     */
    async copy(id, newName, newCode) {
        return await api.post(`/api/task-templates/${id}/copy`, {
            new_name: newName,
            new_code: newCode
        });
    },

    /**
     * 增加使用次数
     */
    async incrementUsage(id) {
        return await api.post(`/api/task-templates/${id}/use`);
    }
};

// 导出到全局
window.api = api;
window.franchiseeAPI = franchiseeAPI;
window.userAPI = userAPI;
window.roleAPI = roleAPI;
window.organizationAPI = organizationAPI;
window.caseAPI = caseAPI;
window.aiAPI = aiAPI;
window.solutionTemplateAPI = solutionTemplateAPI;
window.customerProfileTemplateAPI = customerProfileTemplateAPI;
window.diagnosisTemplateAPI = diagnosisTemplateAPI;
window.taskTemplateAPI = taskTemplateAPI;
