const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

/**
 * 获取诊断模板列表
 * GET /api/diagnosis-templates
 */
router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const { org_id, status, page = 1, pageSize = 100 } = req.query;

        let query = 'SELECT * FROM diagnosis_templates WHERE 1=1';
        const params = [];

        // 过滤条件
        if (org_id) {
            query += ' AND (org_id = ? OR org_id IS NULL)';
            params.push(org_id);
        } else {
            query += ' AND org_id IS NULL';  // 只返回全局模板
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY sort_order ASC, id DESC';

        // 分页 - 直接拼接到SQL中
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        const [templates] = await pool.execute(query, params);

        // 解析JSON字段
        templates.forEach(template => {
            if (typeof template.fields === 'string') {
                template.fields = JSON.parse(template.fields);
            }
        });

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('获取诊断模板列表失败:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * 获取诊断模板详情
 * GET /api/diagnosis-templates/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const pool = getPool();
        const { id } = req.params;

        const [templates] = await pool.execute(
            'SELECT * FROM diagnosis_templates WHERE id = ?',
            [id]
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: '模板不存在'
            });
        }

        const template = templates[0];

        // 解析JSON字段
        if (typeof template.fields === 'string') {
            template.fields = JSON.parse(template.fields);
        }

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('获取诊断模板详情失败:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * 创建诊断模板
 * POST /api/diagnosis-templates
 */
router.post('/', async (req, res) => {
    try {
        const pool = getPool();
        const {
            template_code,
            template_name,
            description,
            org_id,
            scope = 'org',
            apply_scene,
            fields,
            version = '1.0',
            sort_order = 0,
            created_by
        } = req.body;

        // 验证必填字段
        if (!template_code || !template_name || !fields) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段'
            });
        }

        // 检查编码是否已存在
        const [existing] = await pool.execute(
            'SELECT id FROM diagnosis_templates WHERE template_code = ?',
            [template_code]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: '模板编码已存在'
            });
        }

        // 插入数据
        const [result] = await pool.execute(
            `INSERT INTO diagnosis_templates (
                template_code, template_name, description, org_id, scope,
                apply_scene, fields, version, sort_order, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                template_code,
                template_name,
                description,
                org_id || null,
                scope,
                apply_scene,
                JSON.stringify(fields),
                version,
                sort_order,
                created_by
            ]
        );

        res.status(201).json({
            success: true,
            data: {
                id: result.insertId
            },
            message: '模板创建成功'
        });
    } catch (error) {
        console.error('创建诊断模板失败:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * 更新诊断模板
 * PUT /api/diagnosis-templates/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const pool = getPool();
        const { id } = req.params;
        const {
            template_name,
            description,
            apply_scene,
            fields,
            version,
            status,
            sort_order
        } = req.body;

        // 检查模板是否存在
        const [existing] = await pool.execute(
            'SELECT id FROM diagnosis_templates WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '模板不存在'
            });
        }

        // 构建更新语句
        const updates = [];
        const params = [];

        if (template_name !== undefined) {
            updates.push('template_name = ?');
            params.push(template_name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (apply_scene !== undefined) {
            updates.push('apply_scene = ?');
            params.push(apply_scene);
        }
        if (fields !== undefined) {
            updates.push('fields = ?');
            params.push(JSON.stringify(fields));
        }
        if (version !== undefined) {
            updates.push('version = ?');
            params.push(version);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }
        if (sort_order !== undefined) {
            updates.push('sort_order = ?');
            params.push(sort_order);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有要更新的字段'
            });
        }

        params.push(id);

        await pool.execute(
            `UPDATE diagnosis_templates SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        res.json({
            success: true,
            message: '模板更新成功'
        });
    } catch (error) {
        console.error('更新诊断模板失败:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * 删除诊断模板
 * DELETE /api/diagnosis-templates/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const pool = getPool();
        const { id } = req.params;

        // 检查模板是否存在
        const [existing] = await pool.execute(
            'SELECT id, scope FROM diagnosis_templates WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '模板不存在'
            });
        }

        // 不允许删除全局模板
        if (existing[0].scope === 'global') {
            return res.status(403).json({
                success: false,
                message: '不允许删除全局模板'
            });
        }

        await pool.execute('DELETE FROM diagnosis_templates WHERE id = ?', [id]);

        res.json({
            success: true,
            message: '模板删除成功'
        });
    } catch (error) {
        console.error('删除诊断模板失败:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
