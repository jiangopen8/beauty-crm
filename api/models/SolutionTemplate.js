/**
 * SolutionTemplate 模型
 * 方案模板管理
 */

const db = require('../../database/db.config');

class SolutionTemplate {
    /**
     * 获取模板列表
     * @param {Object} filters - 筛选条件
     */
    static async getList(filters = {}) {
        let sql = `
            SELECT
                st.*,
                o.org_name,
                creator.username as creator_name,
                updater.username as updater_name
            FROM solution_templates st
            LEFT JOIN organizations o ON st.org_id = o.id
            LEFT JOIN users creator ON st.created_by = creator.id
            LEFT JOIN users updater ON st.updated_by = updater.id
            WHERE st.is_deleted = 0
        `;

        const params = [];

        // 筛选条件
        if (filters.org_id) {
            sql += ` AND (st.org_id = ? OR st.scope = 'global')`;
            params.push(parseInt(filters.org_id));
        }

        if (filters.category) {
            sql += ` AND st.category = ?`;
            params.push(filters.category);
        }

        if (filters.scope) {
            sql += ` AND st.scope = ?`;
            params.push(filters.scope);
        }

        if (filters.status) {
            sql += ` AND st.status = ?`;
            params.push(filters.status);
        }

        if (filters.search) {
            sql += ` AND (st.template_name LIKE ? OR st.template_code LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        // 排序
        sql += ` ORDER BY st.created_at DESC`;

        // 分页变量声明（需要在两个if块外部声明）
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
                FROM solution_templates st
                WHERE st.is_deleted = 0
            `;
            const countParams = [];

            if (filters.org_id) {
                countSql += ` AND (st.org_id = ? OR st.scope = 'global')`;
                countParams.push(parseInt(filters.org_id));
            }

            if (filters.category) {
                countSql += ` AND st.category = ?`;
                countParams.push(filters.category);
            }

            if (filters.scope) {
                countSql += ` AND st.scope = ?`;
                countParams.push(filters.scope);
            }

            if (filters.status) {
                countSql += ` AND st.status = ?`;
                countParams.push(filters.status);
            }

            if (filters.search) {
                countSql += ` AND (st.template_name LIKE ? OR st.template_code LIKE ?)`;
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
                st.*,
                o.org_name,
                creator.username as creator_name,
                updater.username as updater_name
            FROM solution_templates st
            LEFT JOIN organizations o ON st.org_id = o.id
            LEFT JOIN users creator ON st.created_by = creator.id
            LEFT JOIN users updater ON st.updated_by = updater.id
            WHERE st.id = ? AND st.is_deleted = 0
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
            INSERT INTO solution_templates (
                template_code,
                template_name,
                category,
                org_id,
                scope,
                suitable_skin_types,
                suitable_problems,
                target_group,
                course_duration,
                treatment_frequency,
                steps,
                products,
                services,
                expected_effects,
                precautions,
                estimated_price_min,
                estimated_price_max,
                cover_image,
                case_photos,
                status,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.template_code || `TPL_${Date.now()}`,
            data.template_name,
            data.category,
            data.org_id || null,
            data.scope || 'org',
            JSON.stringify(data.suitable_skin_types || []),
            JSON.stringify(data.suitable_problems || []),
            data.target_group || null,
            data.course_duration || null,
            data.treatment_frequency || null,
            JSON.stringify(data.steps || []),
            JSON.stringify(data.products || []),
            JSON.stringify(data.services || []),
            data.expected_effects || null,
            data.precautions || null,
            data.estimated_price_min || null,
            data.estimated_price_max || null,
            data.cover_image || null,
            JSON.stringify(data.case_photos || []),
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
            UPDATE solution_templates
            SET
                template_name = ?,
                category = ?,
                scope = ?,
                suitable_skin_types = ?,
                suitable_problems = ?,
                target_group = ?,
                course_duration = ?,
                treatment_frequency = ?,
                steps = ?,
                products = ?,
                services = ?,
                expected_effects = ?,
                precautions = ?,
                estimated_price_min = ?,
                estimated_price_max = ?,
                cover_image = ?,
                case_photos = ?,
                status = ?,
                updated_by = ?,
                updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `;

        const params = [
            data.template_name,
            data.category,
            data.scope || 'org',
            JSON.stringify(data.suitable_skin_types || []),
            JSON.stringify(data.suitable_problems || []),
            data.target_group || null,
            data.course_duration || null,
            data.treatment_frequency || null,
            JSON.stringify(data.steps || []),
            JSON.stringify(data.products || []),
            JSON.stringify(data.services || []),
            data.expected_effects || null,
            data.precautions || null,
            data.estimated_price_min || null,
            data.estimated_price_max || null,
            data.cover_image || null,
            JSON.stringify(data.case_photos || []),
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
            UPDATE solution_templates
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
            UPDATE solution_templates
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
            UPDATE solution_templates
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
                SUM(usage_count) as total_usage
            FROM solution_templates
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
}

module.exports = SolutionTemplate;
