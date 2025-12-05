const db = require('../config/db');

/**
 * 客户案例模型
 */
class Case {
    /**
     * 根据ID获取案例详情
     */
    static async findById(id) {
        const sql = `
            SELECT
                cc.id,
                cc.customer_id,
                cc.org_id,
                cc.case_title,
                cc.case_type,
                cc.service_period,
                cc.service_frequency,
                cc.initial_problems,
                cc.treatment_plan,
                cc.products_used,
                cc.results,
                cc.before_photos,
                cc.after_photos,
                cc.customer_feedback,
                cc.satisfaction_score,
                cc.is_featured,
                cc.is_public,
                cc.display_order,
                cc.created_at,
                cc.updated_at,
                c.name as customer_name,
                c.phone as customer_phone
            FROM customer_cases cc
            LEFT JOIN customers c ON cc.customer_id = c.id
            WHERE cc.id = ? AND cc.is_deleted = 0
        `;

        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    /**
     * 获取案例列表（分页）
     */
    static async getList({ page = 1, pageSize = 10, org_id, case_type, is_featured, keyword }) {
        const offset = (page - 1) * pageSize;

        let whereClauses = ['cc.is_deleted = 0'];
        const params = [];

        // 多租户隔离：必须按组织过滤
        if (org_id) {
            whereClauses.push('cc.org_id = ?');
            params.push(parseInt(org_id));
        }

        if (case_type) {
            whereClauses.push('cc.case_type = ?');
            params.push(case_type);
        }

        if (is_featured !== undefined && is_featured !== null) {
            whereClauses.push('cc.is_featured = ?');
            params.push(is_featured ? 1 : 0);
        }

        if (keyword) {
            whereClauses.push('(cc.case_title LIKE ? OR c.name LIKE ? OR cc.initial_problems LIKE ?)');
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
        }

        const whereClause = whereClauses.join(' AND ');

        // 获取总数
        const countSql = `
            SELECT COUNT(*) as total
            FROM customer_cases cc
            LEFT JOIN customers c ON cc.customer_id = c.id
            WHERE ${whereClause}
        `;
        const countResult = await db.query(countSql, params);
        const total = countResult[0]?.total || 0;

        // 获取列表
        const sql = `
            SELECT
                cc.id,
                cc.customer_id,
                cc.org_id,
                cc.case_title,
                cc.case_type,
                cc.service_period,
                cc.service_frequency,
                cc.initial_problems,
                cc.treatment_plan,
                cc.products_used,
                cc.results,
                cc.before_photos,
                cc.after_photos,
                cc.customer_feedback,
                cc.satisfaction_score,
                cc.is_featured,
                cc.is_public,
                cc.display_order,
                cc.created_at,
                cc.updated_at,
                c.name as customer_name,
                c.phone as customer_phone
            FROM customer_cases cc
            LEFT JOIN customers c ON cc.customer_id = c.id
            WHERE ${whereClause}
            ORDER BY cc.is_featured DESC, cc.display_order DESC, cc.created_at DESC
            LIMIT ${parseInt(pageSize)} OFFSET ${parseInt(offset)}
        `;

        const rows = await db.query(sql, params);

        return {
            items: rows,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }

    /**
     * 创建案例
     */
    static async create(data) {
        const sql = `
            INSERT INTO customer_cases (
                customer_id,
                org_id,
                case_title,
                case_type,
                service_period,
                service_frequency,
                initial_problems,
                treatment_plan,
                products_used,
                results,
                before_photos,
                after_photos,
                customer_feedback,
                satisfaction_score,
                is_featured,
                is_public,
                display_order,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.customer_id || null,
            data.org_id,
            data.case_title,
            data.case_type || 'other',
            data.service_period || null,
            data.service_frequency || null,
            data.initial_problems || null,
            data.treatment_plan || null,
            data.products_used ? JSON.stringify(data.products_used) : null,
            data.results || null,
            data.before_photos ? JSON.stringify(data.before_photos) : null,
            data.after_photos ? JSON.stringify(data.after_photos) : null,
            data.customer_feedback || null,
            data.satisfaction_score || null,
            data.is_featured ? 1 : 0,
            data.is_public ? 1 : 0,
            data.display_order || 0,
            data.created_by || null
        ];

        const result = await db.query(sql, params);
        return result.insertId;
    }

    /**
     * 更新案例
     */
    static async update(id, data) {
        const updateData = {
            ...data,
            updated_at: new Date()
        };

        // 移除不允许更新的字段
        delete updateData.id;
        delete updateData.created_at;
        delete updateData.is_deleted;

        // 处理JSON字段
        if (updateData.products_used && typeof updateData.products_used === 'object') {
            updateData.products_used = JSON.stringify(updateData.products_used);
        }
        if (updateData.before_photos && typeof updateData.before_photos === 'object') {
            updateData.before_photos = JSON.stringify(updateData.before_photos);
        }
        if (updateData.after_photos && typeof updateData.after_photos === 'object') {
            updateData.after_photos = JSON.stringify(updateData.after_photos);
        }

        const fields = Object.keys(updateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updateData[field]);

        const sql = `
            UPDATE customer_cases
            SET ${setClause}
            WHERE id = ? AND is_deleted = 0
        `;

        const params = [...values, id];
        const result = await db.query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * 删除案例（软删除）
     */
    static async delete(id) {
        const sql = `
            UPDATE customer_cases
            SET is_deleted = 1, updated_at = NOW()
            WHERE id = ?
        `;

        const result = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * 更新展示状态
     */
    static async updateFeatured(id, is_featured) {
        const sql = `
            UPDATE customer_cases
            SET is_featured = ?, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `;

        const result = await db.query(sql, [is_featured ? 1 : 0, id]);
        return result.affectedRows > 0;
    }

    /**
     * 更新公开状态
     */
    static async updatePublic(id, is_public) {
        const sql = `
            UPDATE customer_cases
            SET is_public = ?, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `;

        const result = await db.query(sql, [is_public ? 1 : 0, id]);
        return result.affectedRows > 0;
    }

    /**
     * 获取统计信息
     */
    static async getStats(org_id = null) {
        let whereClause = 'is_deleted = 0';
        const params = [];

        if (org_id) {
            whereClause += ' AND org_id = ?';
            params.push(org_id);
        }

        const sql = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured_count,
                SUM(CASE WHEN is_public = 1 THEN 1 ELSE 0 END) as public_count,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_count
            FROM customer_cases
            WHERE ${whereClause}
        `;

        const rows = await db.query(sql, params);
        return rows[0];
    }
}

module.exports = { Case };
