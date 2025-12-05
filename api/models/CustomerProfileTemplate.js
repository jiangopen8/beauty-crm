/**
 * CustomerProfileTemplate 模型
 * 客户资料模板管理
 */

const db = require('../../database/db.config');

class CustomerProfileTemplate {
    /**
     * 获取模板列表
     * @param {Object} filters - 筛选条件
     */
    static async getList(filters = {}) {
        let sql = `
            SELECT
                cpt.*,
                o.org_name,
                creator.username as creator_name,
                updater.username as updater_name
            FROM customer_profile_templates cpt
            LEFT JOIN organizations o ON cpt.org_id = o.id
            LEFT JOIN users creator ON cpt.created_by = creator.id
            LEFT JOIN users updater ON cpt.updated_by = updater.id
            WHERE cpt.is_deleted = 0
        `;

        const params = [];

        // 筛选条件
        if (filters.org_id) {
            sql += ` AND (cpt.org_id = ? OR cpt.scope = 'global')`;
            params.push(parseInt(filters.org_id));
        }

        if (filters.scope) {
            sql += ` AND cpt.scope = ?`;
            params.push(filters.scope);
        }

        if (filters.apply_scene) {
            sql += ` AND cpt.apply_scene = ?`;
            params.push(filters.apply_scene);
        }

        if (filters.status) {
            sql += ` AND cpt.status = ?`;
            params.push(filters.status);
        }

        if (filters.search) {
            sql += ` AND (cpt.template_name LIKE ? OR cpt.template_code LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        // 排序
        sql += ` ORDER BY cpt.is_default DESC, cpt.created_at DESC`;

        // 分页变量声明
        let page, pageSize;

        // 分页
        if (filters.page && filters.pageSize) {
            page = parseInt(filters.page);
            pageSize = parseInt(filters.pageSize);
            const offset = (page - 1) * pageSize;
            sql += ` LIMIT ? OFFSET ?`;
            params.push(pageSize, offset);
        }

        const results = await db.query(sql, params);

        // 获取总数（用于分页）
        if (filters.page && filters.pageSize) {
            let countSql = `
                SELECT COUNT(*) as total
                FROM customer_profile_templates cpt
                WHERE cpt.is_deleted = 0
            `;
            const countParams = [];

            if (filters.org_id) {
                countSql += ` AND (cpt.org_id = ? OR cpt.scope = 'global')`;
                countParams.push(parseInt(filters.org_id));
            }

            if (filters.scope) {
                countSql += ` AND cpt.scope = ?`;
                countParams.push(filters.scope);
            }

            if (filters.apply_scene) {
                countSql += ` AND cpt.apply_scene = ?`;
                countParams.push(filters.apply_scene);
            }

            if (filters.status) {
                countSql += ` AND cpt.status = ?`;
                countParams.push(filters.status);
            }

            if (filters.search) {
                countSql += ` AND (cpt.template_name LIKE ? OR cpt.template_code LIKE ?)`;
                const searchTerm = `%${filters.search}%`;
                countParams.push(searchTerm, searchTerm);
            }

            const [countResult] = await db.query(countSql, countParams);

            return {
                items: results,
                total: countResult.total,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(countResult.total / pageSize)
            };
        }

        return results;
    }

    /**
     * 根据ID获取模板详情
     * @param {number} id - 模板ID
     */
    static async getById(id) {
        const sql = `
            SELECT
                cpt.*,
                o.org_name,
                creator.username as creator_name,
                updater.username as updater_name
            FROM customer_profile_templates cpt
            LEFT JOIN organizations o ON cpt.org_id = o.id
            LEFT JOIN users creator ON cpt.created_by = creator.id
            LEFT JOIN users updater ON cpt.updated_by = updater.id
            WHERE cpt.id = ? AND cpt.is_deleted = 0
        `;

        const results = await db.query(sql, [id]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * 创建模板
     * @param {Object} data - 模板数据
     */
    static async create(data) {
        const sql = `
            INSERT INTO customer_profile_templates (
                template_code,
                template_name,
                description,
                org_id,
                scope,
                apply_scene,
                fields,
                field_groups,
                version,
                is_default,
                status,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.template_code || `TPL_PROFILE_${Date.now()}`,
            data.template_name,
            data.description || null,
            data.org_id || null,
            data.scope || 'org',
            data.apply_scene || 'all',
            JSON.stringify(data.fields || []),
            JSON.stringify(data.field_groups || []),
            data.version || '1.0',
            data.is_default || 0,
            data.status || 'active',
            data.created_by || null
        ];

        const result = await db.query(sql, params);
        return this.getById(result.insertId);
    }

    /**
     * 更新模板
     * @param {number} id - 模板ID
     * @param {Object} data - 更新数据
     */
    static async update(id, data) {
        const sql = `
            UPDATE customer_profile_templates
            SET
                template_name = ?,
                description = ?,
                scope = ?,
                apply_scene = ?,
                fields = ?,
                field_groups = ?,
                version = ?,
                status = ?,
                updated_by = ?,
                updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `;

        const params = [
            data.template_name,
            data.description || null,
            data.scope || 'org',
            data.apply_scene || 'all',
            JSON.stringify(data.fields || []),
            JSON.stringify(data.field_groups || []),
            data.version || '1.0',
            data.status || 'active',
            data.updated_by || null,
            id
        ];

        await db.query(sql, params);
        return this.getById(id);
    }

    /**
     * 更新模板状态
     * @param {number} id - 模板ID
     * @param {string} status - 状态
     */
    static async updateStatus(id, status) {
        const sql = `
            UPDATE customer_profile_templates
            SET status = ?, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `;

        await db.query(sql, [status, id]);
        return this.getById(id);
    }

    /**
     * 删除模板（软删除）
     * @param {number} id - 模板ID
     */
    static async delete(id) {
        const sql = `
            UPDATE customer_profile_templates
            SET is_deleted = 1, updated_at = NOW()
            WHERE id = ?
        `;

        await db.query(sql, [id]);
        return { success: true };
    }

    /**
     * 增加使用次数
     * @param {number} id - 模板ID
     */
    static async incrementUsageCount(id) {
        const sql = `
            UPDATE customer_profile_templates
            SET usage_count = usage_count + 1
            WHERE id = ? AND is_deleted = 0
        `;

        await db.query(sql, [id]);
        return this.getById(id);
    }

    /**
     * 获取统计信息
     * @param {number} orgId - 组织ID
     */
    static async getStats(orgId = null) {
        let sql = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
                SUM(usage_count) as total_usage
            FROM customer_profile_templates
            WHERE is_deleted = 0
        `;

        const params = [];

        if (orgId) {
            sql += ` AND (org_id = ? OR scope = 'global')`;
            params.push(parseInt(orgId));
        }

        const [result] = await db.query(sql, params);
        return result;
    }

    /**
     * 复制模板
     * @param {number} id - 源模板ID
     * @param {Object} data - 新模板数据
     */
    static async duplicate(id, data) {
        const sourceTemplate = await this.getById(id);
        if (!sourceTemplate) {
            throw new Error('源模板不存在');
        }

        const newTemplate = {
            template_code: data.template_code || `${sourceTemplate.template_code}_COPY_${Date.now()}`,
            template_name: data.template_name || `${sourceTemplate.template_name}（副本）`,
            description: sourceTemplate.description,
            org_id: data.org_id || sourceTemplate.org_id,
            scope: data.scope || sourceTemplate.scope,
            apply_scene: sourceTemplate.apply_scene,
            fields: sourceTemplate.fields,
            field_groups: sourceTemplate.field_groups,
            version: '1.0',
            is_default: 0,
            status: 'draft',
            created_by: data.created_by
        };

        return this.create(newTemplate);
    }
}

module.exports = CustomerProfileTemplate;
