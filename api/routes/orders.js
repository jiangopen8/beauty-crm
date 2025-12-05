/**
 * 订单管理 API 路由
 */
const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const pool = getPool();

/**
 * 获取订单列表
 * GET /api/orders
 */
router.get('/', async (req, res) => {
    try {
        const {
            org_id,
            customer_id,
            order_status,
            payment_status,
            service_date_from,
            service_date_to,
            search,
            page = 1,
            pageSize = 10
        } = req.query;

        let query = `
            SELECT *
            FROM orders
            WHERE is_deleted = 0
        `;
        const params = [];

        // 机构筛选
        if (org_id) {
            query += ' AND org_id = ?';
            params.push(org_id);
        }

        // 客户筛选
        if (customer_id) {
            query += ' AND customer_id = ?';
            params.push(customer_id);
        }

        // 订单状态筛选
        if (order_status) {
            query += ' AND order_status = ?';
            params.push(order_status);
        }

        // 支付状态筛选
        if (payment_status) {
            query += ' AND payment_status = ?';
            params.push(payment_status);
        }

        // 服务日期范围
        if (service_date_from) {
            query += ' AND service_date >= ?';
            params.push(service_date_from);
        }
        if (service_date_to) {
            query += ' AND service_date <= ?';
            params.push(service_date_to);
        }

        // 搜索
        if (search) {
            query += ' AND (order_no LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // 获取总数
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // 分页和排序
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;
        params.push(limit, offset);

        const [orders] = await pool.query(query, params);

        res.json({
            success: true,
            data: {
                list: orders,
                pagination: {
                    page: parseInt(page),
                    pageSize: limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取订单列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取订单列表失败',
            error: error.message
        });
    }
});

/**
 * 获取订单统计
 * GET /api/orders/stats/summary
 */
router.get('/stats/summary', async (req, res) => {
    try {
        const { org_id } = req.query;

        let whereClause = 'WHERE is_deleted = 0';
        const params = [];

        if (org_id) {
            whereClause += ' AND org_id = ?';
            params.push(org_id);
        }

        // 按订单状态统计
        const [statusStats] = await pool.query(
            `SELECT
                order_status,
                COUNT(*) as count,
                SUM(final_amount) as total_amount
            FROM orders
            ${whereClause}
            GROUP BY order_status`,
            params
        );

        // 按支付状态统计
        const [paymentStats] = await pool.query(
            `SELECT
                payment_status,
                COUNT(*) as count,
                SUM(paid_amount) as total_paid
            FROM orders
            ${whereClause}
            GROUP BY payment_status`,
            params
        );

        // 总览统计
        const [overview] = await pool.query(
            `SELECT
                COUNT(*) as total_orders,
                SUM(final_amount) as total_revenue,
                SUM(paid_amount) as total_paid,
                AVG(final_amount) as avg_order_amount
            FROM orders
            ${whereClause}`,
            params
        );

        res.json({
            success: true,
            data: {
                overview: overview[0],
                by_status: statusStats,
                by_payment: paymentStats
            }
        });
    } catch (error) {
        console.error('获取订单统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取订单统计失败',
            error: error.message
        });
    }
});

/**
 * 获取订单详情
 * GET /api/orders/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND is_deleted = 0',
            [id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: '订单不存在'
            });
        }

        res.json({
            success: true,
            data: orders[0]
        });
    } catch (error) {
        console.error('获取订单详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取订单详情失败',
            error: error.message
        });
    }
});

/**
 * 创建订单
 * POST /api/orders
 */
router.post('/', async (req, res) => {
    try {
        const {
            org_id,
            store_id,
            customer_id,
            customer_name,
            customer_phone,
            counselor_id,
            beautician_id,
            original_amount,
            discount_amount = 0,
            final_amount,
            payment_method,
            service_date,
            service_start_time,
            service_end_time,
            remark,
            created_by
        } = req.body;

        // 生成订单号
        const order_no = await generateOrderNo();

        const [result] = await pool.query(
            `INSERT INTO orders (
                order_no, org_id, store_id, customer_id, customer_name, customer_phone,
                counselor_id, beautician_id, original_amount, discount_amount, final_amount,
                payment_method, service_date, service_start_time, service_end_time,
                remark, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                order_no, org_id, store_id, customer_id, customer_name, customer_phone,
                counselor_id, beautician_id, original_amount, discount_amount, final_amount,
                payment_method, service_date, service_start_time, service_end_time,
                remark, created_by
            ]
        );

        // 获取新创建的订单
        const [newOrder] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: '订单创建成功',
            data: newOrder[0]
        });
    } catch (error) {
        console.error('创建订单失败:', error);
        res.status(500).json({
            success: false,
            message: '创建订单失败',
            error: error.message
        });
    }
});

/**
 * 更新订单
 * PUT /api/orders/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            customer_id,
            customer_name,
            customer_phone,
            counselor_id,
            beautician_id,
            original_amount,
            discount_amount,
            final_amount,
            payment_method,
            service_date,
            service_start_time,
            service_end_time,
            remark,
            updated_by
        } = req.body;

        const [result] = await pool.query(
            `UPDATE orders SET
                customer_id = ?,
                customer_name = ?,
                customer_phone = ?,
                counselor_id = ?,
                beautician_id = ?,
                original_amount = ?,
                discount_amount = ?,
                final_amount = ?,
                payment_method = ?,
                service_date = ?,
                service_start_time = ?,
                service_end_time = ?,
                remark = ?,
                updated_by = ?
            WHERE id = ? AND is_deleted = 0`,
            [
                customer_id, customer_name, customer_phone, counselor_id, beautician_id,
                original_amount, discount_amount, final_amount, payment_method,
                service_date, service_start_time, service_end_time, remark, updated_by, id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '订单不存在或已删除'
            });
        }

        // 获取更新后的订单
        const [updatedOrder] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: '订单更新成功',
            data: updatedOrder[0]
        });
    } catch (error) {
        console.error('更新订单失败:', error);
        res.status(500).json({
            success: false,
            message: '更新订单失败',
            error: error.message
        });
    }
});

/**
 * 更新订单状态
 * PATCH /api/orders/:id/status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status, cancel_reason, updated_by } = req.body;

        const updateData = {
            order_status,
            updated_by
        };

        if (order_status === 'cancelled' && cancel_reason) {
            updateData.cancel_reason = cancel_reason;
        }

        const [result] = await pool.query(
            `UPDATE orders SET
                order_status = ?,
                cancel_reason = ?,
                updated_by = ?
            WHERE id = ? AND is_deleted = 0`,
            [order_status, cancel_reason || null, updated_by, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '订单不存在或已删除'
            });
        }

        const [updatedOrder] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: '订单状态更新成功',
            data: updatedOrder[0]
        });
    } catch (error) {
        console.error('更新订单状态失败:', error);
        res.status(500).json({
            success: false,
            message: '更新订单状态失败',
            error: error.message
        });
    }
});

/**
 * 更新支付信息
 * PATCH /api/orders/:id/payment
 */
router.patch('/:id/payment', async (req, res) => {
    try {
        const { id } = req.params;
        const { paid_amount, payment_method, payment_status, updated_by } = req.body;

        const [result] = await pool.query(
            `UPDATE orders SET
                paid_amount = ?,
                payment_method = ?,
                payment_status = ?,
                paid_at = CASE WHEN payment_status = 'paid' THEN NOW() ELSE paid_at END,
                updated_by = ?
            WHERE id = ? AND is_deleted = 0`,
            [paid_amount, payment_method, payment_status, updated_by, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '订单不存在或已删除'
            });
        }

        const [updatedOrder] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: '支付信息更新成功',
            data: updatedOrder[0]
        });
    } catch (error) {
        console.error('更新支付信息失败:', error);
        res.status(500).json({
            success: false,
            message: '更新支付信息失败',
            error: error.message
        });
    }
});

/**
 * 删除订单(软删除)
 * DELETE /api/orders/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'UPDATE orders SET is_deleted = 1 WHERE id = ? AND is_deleted = 0',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '订单不存在或已删除'
            });
        }

        res.json({
            success: true,
            message: '订单删除成功'
        });
    } catch (error) {
        console.error('删除订单失败:', error);
        res.status(500).json({
            success: false,
            message: '删除订单失败',
            error: error.message
        });
    }
});

/**
 * 生成订单号
 */
async function generateOrderNo() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 查询今天已有的订单数量
    const [result] = await pool.query(
        `SELECT COUNT(*) as count FROM orders
         WHERE order_no LIKE ? AND is_deleted = 0`,
        [`ORD${year}${month}${day}%`]
    );

    const sequence = String(result[0].count + 1).padStart(4, '0');
    return `ORD${year}${month}${day}${sequence}`;
}

module.exports = router;
