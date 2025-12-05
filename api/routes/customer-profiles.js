/**
 * 客户详细资料管理 API
 * 用于管理基于模板的客户详细信息
 */

const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const pool = getPool();

/**
 * @api GET /api/customer-profiles/customer/:customerId
 * @description 获取指定客户的所有详细资料（可能对应多个模板）
 */
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        const [profiles] = await pool.query(`
            SELECT
                cp.*,
                t.template_name,
                t.template_code,
                t.fields AS template_fields,
                c.name AS customer_name,
                c.phone AS customer_phone
            FROM customer_profiles cp
            LEFT JOIN customer_profile_templates t ON cp.template_id = t.id
            LEFT JOIN customers c ON cp.customer_id = c.id
            WHERE cp.customer_id = ? AND cp.is_deleted = 0
            ORDER BY cp.created_at DESC
        `, [customerId]);

        res.json({
            success: true,
            data: profiles,
            message: '获取客户详细资料成功'
        });
    } catch (error) {
        console.error('获取客户详细资料失败:', error);
        res.status(500).json({
            success: false,
            message: '获取客户详细资料失败',
            error: error.message
        });
    }
});

/**
 * @api GET /api/customer-profiles/customer/:customerId/template/:templateId
 * @description 获取指定客户使用特定模板的详细资料
 */
router.get('/customer/:customerId/template/:templateId', async (req, res) => {
    try {
        const { customerId, templateId } = req.params;

        const [profiles] = await pool.query(`
            SELECT
                cp.*,
                t.template_name,
                t.template_code,
                t.fields AS template_fields,
                t.field_groups,
                c.name AS customer_name,
                c.phone AS customer_phone
            FROM customer_profiles cp
            LEFT JOIN customer_profile_templates t ON cp.template_id = t.id
            LEFT JOIN customers c ON cp.customer_id = c.id
            WHERE cp.customer_id = ?
                AND cp.template_id = ?
                AND cp.is_deleted = 0
            LIMIT 1
        `, [customerId, templateId]);

        if (profiles.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: '未找到该客户的模板资料'
            });
        }

        res.json({
            success: true,
            data: profiles[0],
            message: '获取客户详细资料成功'
        });
    } catch (error) {
        console.error('获取客户详细资料失败:', error);
        res.status(500).json({
            success: false,
            message: '获取客户详细资料失败',
            error: error.message
        });
    }
});

/**
 * @api GET /api/customer-profiles/:id
 * @description 根据资料ID获取详细信息
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [profiles] = await pool.query(`
            SELECT
                cp.*,
                t.template_name,
                t.template_code,
                t.fields AS template_fields,
                c.name AS customer_name
            FROM customer_profiles cp
            LEFT JOIN customer_profile_templates t ON cp.template_id = t.id
            LEFT JOIN customers c ON cp.customer_id = c.id
            WHERE cp.id = ? AND cp.is_deleted = 0
        `, [id]);

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: '资料不存在'
            });
        }

        res.json({
            success: true,
            data: profiles[0]
        });
    } catch (error) {
        console.error('获取资料详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取资料详情失败',
            error: error.message
        });
    }
});

/**
 * @api POST /api/customer-profiles
 * @description 创建客户详细资料
 * @body {
 *   customer_id: number,
 *   template_id: number,
 *   org_id: number,
 *   profile_data: object,  // JSON对象，字段由模板定义
 *   template_version?: string,
 *   remark?: string,
 *   created_by?: number
 * }
 */
router.post('/', async (req, res) => {
    try {
        const {
            customer_id,
            template_id,
            org_id,
            profile_data,
            template_version = '1.0',
            remark,
            created_by
        } = req.body;

        // 验证必填字段
        if (!customer_id || !template_id || !org_id || !profile_data) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段：customer_id, template_id, org_id, profile_data'
            });
        }

        // 检查客户是否存在
        const [customers] = await pool.query(
            'SELECT id FROM customers WHERE id = ? AND is_deleted = 0',
            [customer_id]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: '客户不存在'
            });
        }

        // 检查模板是否存在
        const [templates] = await pool.query(
            'SELECT id, version FROM customer_profile_templates WHERE id = ? AND is_deleted = 0',
            [template_id]
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: '模板不存在'
            });
        }

        // 检查是否已存在该客户使用该模板的资料
        const [existing] = await pool.query(
            'SELECT id FROM customer_profiles WHERE customer_id = ? AND template_id = ? AND is_deleted = 0',
            [customer_id, template_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: '该客户已存在该模板的资料，请使用更新接口'
            });
        }

        // 插入数据
        const [result] = await pool.query(`
            INSERT INTO customer_profiles (
                customer_id,
                template_id,
                org_id,
                profile_data,
                template_version,
                remark,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            customer_id,
            template_id,
            org_id,
            JSON.stringify(profile_data),
            template_version || templates[0].version,
            remark,
            created_by
        ]);

        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                customer_id,
                template_id
            },
            message: '创建客户详细资料成功'
        });
    } catch (error) {
        console.error('创建客户详细资料失败:', error);
        res.status(500).json({
            success: false,
            message: '创建客户详细资料失败',
            error: error.message
        });
    }
});

/**
 * @api PUT /api/customer-profiles/:id
 * @description 更新客户详细资料
 * @body {
 *   profile_data: object,  // 更新的数据
 *   remark?: string,
 *   updated_by?: number
 * }
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { profile_data, remark, updated_by } = req.body;

        // 检查资料是否存在
        const [existing] = await pool.query(
            'SELECT id FROM customer_profiles WHERE id = ? AND is_deleted = 0',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '资料不存在'
            });
        }

        // 构建更新语句
        const updates = [];
        const values = [];

        if (profile_data !== undefined) {
            updates.push('profile_data = ?');
            values.push(JSON.stringify(profile_data));
        }

        if (remark !== undefined) {
            updates.push('remark = ?');
            values.push(remark);
        }

        if (updated_by !== undefined) {
            updates.push('updated_by = ?');
            values.push(updated_by);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有要更新的字段'
            });
        }

        values.push(id);

        await pool.query(`
            UPDATE customer_profiles
            SET ${updates.join(', ')}
            WHERE id = ?
        `, values);

        res.json({
            success: true,
            message: '更新客户详细资料成功'
        });
    } catch (error) {
        console.error('更新客户详细资料失败:', error);
        res.status(500).json({
            success: false,
            message: '更新客户详细资料失败',
            error: error.message
        });
    }
});

/**
 * @api PUT /api/customer-profiles/customer/:customerId/template/:templateId
 * @description 根据客户ID和模板ID更新详细资料（更常用的更新方式）
 */
router.put('/customer/:customerId/template/:templateId', async (req, res) => {
    try {
        const { customerId, templateId } = req.params;
        const { profile_data, remark, updated_by } = req.body;

        if (!profile_data) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段：profile_data'
            });
        }

        // 检查资料是否存在
        const [existing] = await pool.query(
            'SELECT id FROM customer_profiles WHERE customer_id = ? AND template_id = ? AND is_deleted = 0',
            [customerId, templateId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '资料不存在，请先创建'
            });
        }

        // 更新资料
        await pool.query(`
            UPDATE customer_profiles
            SET profile_data = ?,
                remark = COALESCE(?, remark),
                updated_by = ?
            WHERE customer_id = ? AND template_id = ? AND is_deleted = 0
        `, [
            JSON.stringify(profile_data),
            remark,
            updated_by,
            customerId,
            templateId
        ]);

        res.json({
            success: true,
            message: '更新客户详细资料成功'
        });
    } catch (error) {
        console.error('更新客户详细资料失败:', error);
        res.status(500).json({
            success: false,
            message: '更新客户详细资料失败',
            error: error.message
        });
    }
});

/**
 * @api DELETE /api/customer-profiles/:id
 * @description 删除客户详细资料（软删除）
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 检查资料是否存在
        const [existing] = await pool.query(
            'SELECT id FROM customer_profiles WHERE id = ? AND is_deleted = 0',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '资料不存在'
            });
        }

        // 软删除
        await pool.query(
            'UPDATE customer_profiles SET is_deleted = 1 WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: '删除客户详细资料成功'
        });
    } catch (error) {
        console.error('删除客户详细资料失败:', error);
        res.status(500).json({
            success: false,
            message: '删除客户详细资料失败',
            error: error.message
        });
    }
});

module.exports = router;
