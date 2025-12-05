const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const pool = getPool();

// 获取所有任务模板
router.get('/', async (req, res) => {
    try {
        const { category, status, scope, search } = req.query;

        let query = 'SELECT * FROM task_templates WHERE is_deleted = 0';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (scope) {
            query += ' AND scope = ?';
            params.push(scope);
        }

        if (search) {
            query += ' AND (template_name LIKE ? OR description LIKE ? OR template_code LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        query += ' ORDER BY is_default DESC, created_at DESC';

        const [templates] = await pool.query(query, params);

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('获取任务模板列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取任务模板列表失败',
            error: error.message
        });
    }
});

// 获取单个任务模板详情
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [templates] = await pool.query(
            'SELECT * FROM task_templates WHERE id = ? AND is_deleted = 0',
            [id]
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: '任务模板不存在'
            });
        }

        res.json({
            success: true,
            data: templates[0]
        });
    } catch (error) {
        console.error('获取任务模板详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取任务模板详情失败',
            error: error.message
        });
    }
});

// 创建任务模板
router.post('/', async (req, res) => {
    try {
        const {
            template_code,
            template_name,
            description,
            org_id,
            scope,
            category,
            priority,
            estimated_duration,
            assigned_role,
            steps,
            reminder_config,
            tags,
            is_default,
            status
        } = req.body;

        // 验证必填字段
        if (!template_code || !template_name || !category || !steps) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段'
            });
        }

        // 检查模板编码是否已存在
        const [existing] = await pool.query(
            'SELECT id FROM task_templates WHERE template_code = ? AND org_id <=> ? AND is_deleted = 0',
            [template_code, org_id || null]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: '模板编码已存在'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO task_templates (
                template_code, template_name, description, org_id, scope,
                category, priority, estimated_duration, assigned_role,
                steps, reminder_config, tags, is_default, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                template_code,
                template_name,
                description || null,
                org_id || null,
                scope || 'org',
                category,
                priority || 'medium',
                estimated_duration || null,
                assigned_role || null,
                JSON.stringify(steps),
                reminder_config ? JSON.stringify(reminder_config) : null,
                tags ? JSON.stringify(tags) : null,
                is_default || 0,
                status || 'active'
            ]
        );

        res.json({
            success: true,
            message: '任务模板创建成功',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('创建任务模板失败:', error);
        res.status(500).json({
            success: false,
            message: '创建任务模板失败',
            error: error.message
        });
    }
});

// 更新任务模板
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            template_name,
            description,
            category,
            priority,
            estimated_duration,
            assigned_role,
            steps,
            reminder_config,
            tags,
            status
        } = req.body;

        const [existing] = await pool.query(
            'SELECT id FROM task_templates WHERE id = ? AND is_deleted = 0',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '任务模板不存在'
            });
        }

        await pool.query(
            `UPDATE task_templates SET
                template_name = ?,
                description = ?,
                category = ?,
                priority = ?,
                estimated_duration = ?,
                assigned_role = ?,
                steps = ?,
                reminder_config = ?,
                tags = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
                template_name,
                description || null,
                category,
                priority || 'medium',
                estimated_duration || null,
                assigned_role || null,
                JSON.stringify(steps),
                reminder_config ? JSON.stringify(reminder_config) : null,
                tags ? JSON.stringify(tags) : null,
                status || 'active',
                id
            ]
        );

        res.json({
            success: true,
            message: '任务模板更新成功'
        });
    } catch (error) {
        console.error('更新任务模板失败:', error);
        res.status(500).json({
            success: false,
            message: '更新任务模板失败',
            error: error.message
        });
    }
});

// 删除任务模板（软删除）
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.query(
            'SELECT id FROM task_templates WHERE id = ? AND is_deleted = 0',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '任务模板不存在'
            });
        }

        await pool.query(
            'UPDATE task_templates SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: '任务模板删除成功'
        });
    } catch (error) {
        console.error('删除任务模板失败:', error);
        res.status(500).json({
            success: false,
            message: '删除任务模板失败',
            error: error.message
        });
    }
});

// 增加使用次数
router.post('/:id/use', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'UPDATE task_templates SET usage_count = usage_count + 1 WHERE id = ? AND is_deleted = 0',
            [id]
        );

        res.json({
            success: true,
            message: '使用次数已更新'
        });
    } catch (error) {
        console.error('更新使用次数失败:', error);
        res.status(500).json({
            success: false,
            message: '更新使用次数失败',
            error: error.message
        });
    }
});

// 复制任务模板
router.post('/:id/copy', async (req, res) => {
    try {
        const { id } = req.params;
        const { new_name, new_code } = req.body;

        if (!new_name || !new_code) {
            return res.status(400).json({
                success: false,
                message: '请提供新的模板名称和编码'
            });
        }

        // 获取原模板
        const [templates] = await pool.query(
            'SELECT * FROM task_templates WHERE id = ? AND is_deleted = 0',
            [id]
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: '原模板不存在'
            });
        }

        const template = templates[0];

        // 检查新编码是否已存在
        const [existing] = await pool.query(
            'SELECT id FROM task_templates WHERE template_code = ? AND org_id <=> ? AND is_deleted = 0',
            [new_code, template.org_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: '新的模板编码已存在'
            });
        }

        // 创建副本
        const [result] = await pool.query(
            `INSERT INTO task_templates (
                template_code, template_name, description, org_id, scope,
                category, priority, estimated_duration, assigned_role,
                steps, reminder_config, tags, is_default, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                new_code,
                new_name,
                template.description,
                template.org_id,
                template.scope,
                template.category,
                template.priority,
                template.estimated_duration,
                template.assigned_role,
                JSON.stringify(template.steps),
                template.reminder_config ? JSON.stringify(template.reminder_config) : null,
                template.tags ? JSON.stringify(template.tags) : null,
                0, // 副本不是默认模板
                'draft' // 副本初始状态为草稿
            ]
        );

        res.json({
            success: true,
            message: '模板复制成功',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('复制任务模板失败:', error);
        res.status(500).json({
            success: false,
            message: '复制任务模板失败',
            error: error.message
        });
    }
});

module.exports = router;
