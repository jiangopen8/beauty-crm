const express = require('express');
const router = express.Router();
const CustomerDiagnosisGroup = require('../models/CustomerDiagnosisGroup');
const { getPool } = require('../config/db');

const pool = getPool();

/**
 * GET /api/customer-diagnosis-groups
 * 获取客户的所有诊断组
 * 查询参数: customer_id (必填)
 */
router.get('/', async (req, res) => {
    try {
        const { customer_id } = req.query;

        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: '缺少必填参数: customer_id'
            });
        }

        console.log(`📡 获取客户 ${customer_id} 的诊断组...`);

        // 使用Model方法获取分组数据
        const groups = await CustomerDiagnosisGroup.findByCustomerId(customer_id);

        console.log(`✅ 成功获取 ${groups.length} 个诊断组`);

        res.json({
            success: true,
            data: groups
        });

    } catch (error) {
        console.error('❌ 获取诊断组失败:', error);
        res.status(500).json({
            success: false,
            message: '获取诊断组失败',
            error: error.message
        });
    }
});

/**
 * GET /api/customer-diagnosis-groups/group/:groupId
 * 获取指定诊断组的详情及其包含的模板
 */
router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        console.log(`📡 获取诊断组 ${groupId} 的详情...`);

        const group = await CustomerDiagnosisGroup.findByGroupId(groupId);

        if (group.length === 0) {
            return res.status(404).json({
                success: false,
                message: '诊断组不存在'
            });
        }

        console.log(`✅ 成功获取诊断组详情`);

        res.json({
            success: true,
            data: group
        });

    } catch (error) {
        console.error('❌ 获取诊断组详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取诊断组详情失败',
            error: error.message
        });
    }
});

/**
 * POST /api/customer-diagnosis-groups
 * 创建新的诊断组（支持空诊断组）
 * 请求体:
 * {
 *   "customer_id": 2,
 *   "org_id": 1,
 *   "diagnosis_template_ids": [1, 2, 5],  // 可选，为空数组或不提供则创建空诊断组
 *   "group_name": "2025年春季体检",        // 可选
 *   "group_description": "年度常规体检",   // 可选
 *   "created_by": 1
 * }
 */
router.post('/', async (req, res) => {
    try {
        const {
            customer_id,
            org_id,
            diagnosis_template_ids,
            group_name,
            group_description,
            created_by
        } = req.body;

        // 验证必填字段
        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段: customer_id'
            });
        }

        // 如果提供了 diagnosis_template_ids，验证其为数组
        if (diagnosis_template_ids !== undefined && !Array.isArray(diagnosis_template_ids)) {
            return res.status(400).json({
                success: false,
                message: 'diagnosis_template_ids 必须是数组'
            });
        }

        const templateCount = diagnosis_template_ids ? diagnosis_template_ids.length : 0;
        console.log(`📡 创建诊断组: customer_id=${customer_id}, templates=${templateCount}个, name=${group_name || '未命名'}`);

        // 调用Model的批量创建方法（支持空数组）
        const result = await CustomerDiagnosisGroup.createBatch({
            customer_id,
            org_id: org_id || 1,
            diagnosis_template_ids: diagnosis_template_ids || [],
            group_name: group_name || null,
            group_description: group_description || null,
            created_by: created_by || null
        });

        console.log(`✅ 诊断组创建成功: ${result.group_id}`);

        // 获取刚创建的诊断组详情
        const groupDetails = await CustomerDiagnosisGroup.findByGroupId(result.group_id);

        res.json({
            success: true,
            message: templateCount === 0 ? '空诊断组创建成功' : '诊断组创建成功',
            data: {
                group_id: result.group_id,
                templates: groupDetails
            }
        });

    } catch (error) {
        console.error('❌ 创建诊断组失败:', error);
        res.status(500).json({
            success: false,
            message: '创建诊断组失败',
            error: error.message
        });
    }
});

/**
 * DELETE /api/customer-diagnosis-groups/group/:groupId
 * 删除指定的诊断组（软删除）
 * 同时会删除关联的 customer_diagnoses 记录
 */
router.delete('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        console.log(`📡 删除诊断组: ${groupId}`);

        // 首先检查诊断组是否存在
        const exists = await CustomerDiagnosisGroup.existsByGroupId(groupId);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: '诊断组不存在'
            });
        }

        // 删除诊断组（软删除）
        await CustomerDiagnosisGroup.deleteGroup(groupId);

        // 同时删除关联的诊断记录
        const sql = `
            UPDATE customer_diagnoses
            SET is_deleted = 1
            WHERE diagnosis_group_id = ? AND is_deleted = 0
        `;
        await pool.query(sql, [groupId]);

        console.log(`✅ 诊断组删除成功`);

        res.json({
            success: true,
            message: '诊断组删除成功'
        });

    } catch (error) {
        console.error('❌ 删除诊断组失败:', error);
        res.status(500).json({
            success: false,
            message: '删除诊断组失败',
            error: error.message
        });
    }
});

/**
 * GET /api/customer-diagnosis-groups/stats/:groupId
 * 获取诊断组的统计信息
 */
router.get('/stats/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        console.log(`📡 获取诊断组统计: ${groupId}`);

        // 获取组内模板数量
        const templateCount = await CustomerDiagnosisGroup.countTemplatesByGroupId(groupId);

        // 获取组内已完成的诊断数量
        const sql = `
            SELECT COUNT(*) as count
            FROM customer_diagnoses
            WHERE diagnosis_group_id = ? AND is_deleted = 0
        `;
        const [result] = await pool.query(sql, [groupId]);
        const diagnosisCount = result[0]?.count || 0;

        console.log(`✅ 诊断组统计完成: ${diagnosisCount}/${templateCount}`);

        res.json({
            success: true,
            data: {
                group_id: groupId,
                total_templates: templateCount,
                completed_diagnoses: diagnosisCount,
                pending_diagnoses: templateCount - diagnosisCount
            }
        });

    } catch (error) {
        console.error('❌ 获取诊断组统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取诊断组统计失败',
            error: error.message
        });
    }
});

/**
 * PUT /api/customer-diagnosis-groups/:groupId
 * 更新诊断组信息（名称、描述）
 * 请求体:
 * {
 *   "group_name": "新名称",
 *   "group_description": "新描述"
 * }
 */
router.put('/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { group_name, group_description } = req.body;

        console.log(`📡 更新诊断组信息: ${groupId}`);

        // 验证诊断组是否存在
        const exists = await CustomerDiagnosisGroup.existsByGroupId(groupId);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: '诊断组不存在'
            });
        }

        // 更新诊断组信息
        const sql = `
            UPDATE customer_diagnosis_groups
            SET group_name = ?, group_description = ?
            WHERE group_id = ? AND is_deleted = 0
        `;

        await pool.query(sql, [
            group_name || null,
            group_description || null,
            groupId
        ]);

        console.log(`✅ 诊断组信息更新成功`);

        res.json({
            success: true,
            message: '诊断组信息更新成功',
            data: {
                group_id: groupId,
                group_name: group_name || null,
                group_description: group_description || null
            }
        });

    } catch (error) {
        console.error('❌ 更新诊断组信息失败:', error);
        res.status(500).json({
            success: false,
            message: '更新诊断组信息失败',
            error: error.message
        });
    }
});

/**
 * POST /api/customer-diagnosis-groups/:groupId/templates
 * 向已有诊断组添加模板
 * 请求体:
 * {
 *   "diagnosis_template_ids": [3, 4, 6],
 *   "created_by": 1
 * }
 */
router.post('/:groupId/templates', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { diagnosis_template_ids, created_by } = req.body;

        // 验证必填字段
        if (!diagnosis_template_ids || !Array.isArray(diagnosis_template_ids)) {
            return res.status(400).json({
                success: false,
                message: 'diagnosis_template_ids 必须是数组'
            });
        }

        if (diagnosis_template_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: '至少需要添加一个诊断模板'
            });
        }

        console.log(`📡 向诊断组 ${groupId} 添加 ${diagnosis_template_ids.length} 个模板...`);

        // 调用Model方法添加模板
        const result = await CustomerDiagnosisGroup.addTemplatesToGroup(
            groupId,
            diagnosis_template_ids,
            created_by || null
        );

        console.log(`✅ 成功添加 ${result.added_count} 个模板`);

        // 获取更新后的诊断组详情
        const groupDetails = await CustomerDiagnosisGroup.findByGroupId(groupId);

        res.json({
            success: true,
            message: `成功添加 ${result.added_count} 个模板到诊断组`,
            data: {
                group_id: groupId,
                added_count: result.added_count,
                templates: groupDetails
            }
        });

    } catch (error) {
        console.error('❌ 添加模板到诊断组失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '添加模板到诊断组失败',
            error: error.message
        });
    }
});

module.exports = router;
