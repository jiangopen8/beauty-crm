/**
 * 订单 API 客户端
 */

const orderAPI = {
    /**
     * 获取订单列表
     */
    async getList(params = {}) {
        const queryParams = new URLSearchParams();

        if (params.org_id) queryParams.append('org_id', params.org_id);
        if (params.customer_id) queryParams.append('customer_id', params.customer_id);
        if (params.order_status) queryParams.append('order_status', params.order_status);
        if (params.payment_status) queryParams.append('payment_status', params.payment_status);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.pageSize) queryParams.append('pageSize', params.pageSize);

        const response = await fetch(`/api/orders?${queryParams}`);
        return await response.json();
    },

    /**
     * 获取订单详情
     */
    async getById(id) {
        const response = await fetch(`/api/orders/${id}`);
        return await response.json();
    },

    /**
     * 创建订单
     */
    async create(data) {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    /**
     * 更新订单
     */
    async update(id, data) {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    /**
     * 更新订单状态
     */
    async updateStatus(id, status, cancelReason = null) {
        const response = await fetch(`/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_status: status,
                cancel_reason: cancelReason,
                updated_by: 1 // TODO: 使用实际登录用户ID
            })
        });
        return await response.json();
    },

    /**
     * 更新支付信息
     */
    async updatePayment(id, paymentData) {
        const response = await fetch(`/api/orders/${id}/payment`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...paymentData,
                updated_by: 1 // TODO: 使用实际登录用户ID
            })
        });
        return await response.json();
    },

    /**
     * 删除订单
     */
    async delete(id) {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    },

    /**
     * 获取订单统计
     */
    async getStats(orgId = null) {
        const queryParams = new URLSearchParams();
        if (orgId) queryParams.append('org_id', orgId);

        const response = await fetch(`/api/orders/stats/summary?${queryParams}`);
        return await response.json();
    }
};

// 导出供其他文件使用
window.orderAPI = orderAPI;
