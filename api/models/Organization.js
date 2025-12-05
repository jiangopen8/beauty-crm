/**
 * Organization 模型
 * 机构/组织管理
 */

const db = require('../../database/db.config');

// 机构类型枚举
const ORG_TYPE = {
    PLATFORM: 'platform',      // 总部
    FRANCHISEE: 'franchisee',  // 加盟商
    STORE: 'store'             // 门店
};

// 机构状态枚举
const ORG_STATUS = {
    ACTIVE: 'active',          // 正常
    INACTIVE: 'inactive',      // 停用
    SUSPENDED: 'suspended'     // 暂停
};

// 加盟商等级枚举
const FRANCHISEE_LEVEL = {
    FLAGSHIP: 'flagship',      // 旗舰店
    STANDARD: 'standard',      // 标准店
    COMMUNITY: 'community'     // 社区店
};

class Organization {
    /**
     * 根据ID查找机构
     */
    static async findById(id) {
        const sql = `
            SELECT
                o.*,
                parent.org_name as parent_name
            FROM organizations o
            LEFT JOIN organizations parent ON o.parent_id = parent.id
            WHERE o.id = ?
            LIMIT 1
        `;
        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    /**
     * 根据机构编码查找
     */
    static async findByOrgCode(orgCode) {
        const sql = `
            SELECT * FROM organizations
            WHERE org_code = ?
            LIMIT 1
        `;
        const rows = await db.query(sql, [orgCode]);
        return rows[0] || null;
    }

    /**
     * 获取机构列表（支持分页和过滤）
     */
    static async getList({
        page = 1,
        pageSize = 10,
        org_type,
        status,
        level,
        parent_id,
        keyword
    }) {
        const offset = (page - 1) * pageSize;

        let whereClauses = [];
        const params = [];

        // 机构类型过滤
        if (org_type) {
            whereClauses.push('o.org_type = ?');
            params.push(org_type);
        }

        // 状态过滤
        if (status) {
            whereClauses.push('o.status = ?');
            params.push(status);
        }

        // 层级过滤
        if (level) {
            whereClauses.push('o.level = ?');
            params.push(parseInt(level));
        }

        // 上级机构过滤
        if (parent_id !== undefined && parent_id !== null) {
            if (parent_id === 0 || parent_id === '0') {
                whereClauses.push('o.parent_id IS NULL');
            } else {
                whereClauses.push('o.parent_id = ?');
                params.push(parseInt(parent_id));
            }
        }

        // 关键词搜索
        if (keyword) {
            whereClauses.push('(o.org_name LIKE ? OR o.org_code LIKE ? OR o.contact_person LIKE ?)');
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
        }

        const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        // 获取总数
        const countSql = `
            SELECT COUNT(*) as total
            FROM organizations o
            ${whereClause}
        `;
        const countResult = await db.query(countSql, params);
        const total = countResult[0]?.total || 0;

        // 获取列表
        const sql = `
            SELECT
                o.*,
                parent.org_name as parent_name,
                (SELECT COUNT(*) FROM organizations WHERE parent_id = o.id) as children_count
            FROM organizations o
            LEFT JOIN organizations parent ON o.parent_id = parent.id
            ${whereClause}
            ORDER BY o.level ASC, o.created_at DESC
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
     * 获取树形结构的组织列表
     */
    static async getTree() {
        const sql = `
            SELECT
                o.*,
                (SELECT COUNT(*) FROM organizations WHERE parent_id = o.id) as children_count
            FROM organizations o
            ORDER BY o.level ASC, o.created_at ASC
        `;
        const rows = await db.query(sql);

        // 构建树形结构
        const map = {};
        const tree = [];

        // 第一遍：创建映射
        rows.forEach(org => {
            map[org.id] = { ...org, children: [] };
        });

        // 第二遍：建立父子关系
        rows.forEach(org => {
            if (org.parent_id && map[org.parent_id]) {
                map[org.parent_id].children.push(map[org.id]);
            } else {
                tree.push(map[org.id]);
            }
        });

        return tree;
    }

    /**
     * 创建机构
     */
    static async create(data) {
        // 验证机构编码唯一性
        const existing = await this.findByOrgCode(data.org_code);
        if (existing) {
            throw new Error('机构编码已存在');
        }

        const sql = `
            INSERT INTO organizations (
                org_code, org_name, org_type, parent_id, level,
                franchisee_level, contract_no, contract_start_date, contract_end_date,
                revenue_share_rate, contact_person, contact_phone, contact_email,
                province, city, district, address, longitude, latitude, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.org_code,
            data.org_name,
            data.org_type,
            data.parent_id || null,
            data.level || 1,
            data.franchisee_level || null,
            data.contract_no || null,
            data.contract_start_date || null,
            data.contract_end_date || null,
            data.revenue_share_rate || 0,
            data.contact_person || null,
            data.contact_phone || null,
            data.contact_email || null,
            data.province || null,
            data.city || null,
            data.district || null,
            data.address || null,
            data.longitude || null,
            data.latitude || null,
            data.status || ORG_STATUS.ACTIVE
        ];

        const result = await db.query(sql, params);
        return result.insertId;
    }

    /**
     * 更新机构信息
     */
    static async update(id, data) {
        const org = await this.findById(id);
        if (!org) {
            throw new Error('机构不存在');
        }

        // 如果修改了机构编码，检查唯一性
        if (data.org_code && data.org_code !== org.org_code) {
            const existing = await this.findByOrgCode(data.org_code);
            if (existing) {
                throw new Error('机构编码已存在');
            }
        }

        const fields = [];
        const params = [];

        if (data.org_code !== undefined) {
            fields.push('org_code = ?');
            params.push(data.org_code);
        }
        if (data.org_name !== undefined) {
            fields.push('org_name = ?');
            params.push(data.org_name);
        }
        if (data.org_type !== undefined) {
            fields.push('org_type = ?');
            params.push(data.org_type);
        }
        if (data.parent_id !== undefined) {
            fields.push('parent_id = ?');
            params.push(data.parent_id || null);
        }
        if (data.level !== undefined) {
            fields.push('level = ?');
            params.push(data.level);
        }
        if (data.franchisee_level !== undefined) {
            fields.push('franchisee_level = ?');
            params.push(data.franchisee_level || null);
        }
        if (data.contract_no !== undefined) {
            fields.push('contract_no = ?');
            params.push(data.contract_no || null);
        }
        if (data.contract_start_date !== undefined) {
            fields.push('contract_start_date = ?');
            params.push(data.contract_start_date || null);
        }
        if (data.contract_end_date !== undefined) {
            fields.push('contract_end_date = ?');
            params.push(data.contract_end_date || null);
        }
        if (data.revenue_share_rate !== undefined) {
            fields.push('revenue_share_rate = ?');
            params.push(data.revenue_share_rate);
        }
        if (data.contact_person !== undefined) {
            fields.push('contact_person = ?');
            params.push(data.contact_person || null);
        }
        if (data.contact_phone !== undefined) {
            fields.push('contact_phone = ?');
            params.push(data.contact_phone || null);
        }
        if (data.contact_email !== undefined) {
            fields.push('contact_email = ?');
            params.push(data.contact_email || null);
        }
        if (data.province !== undefined) {
            fields.push('province = ?');
            params.push(data.province || null);
        }
        if (data.city !== undefined) {
            fields.push('city = ?');
            params.push(data.city || null);
        }
        if (data.district !== undefined) {
            fields.push('district = ?');
            params.push(data.district || null);
        }
        if (data.address !== undefined) {
            fields.push('address = ?');
            params.push(data.address || null);
        }
        if (data.longitude !== undefined) {
            fields.push('longitude = ?');
            params.push(data.longitude || null);
        }
        if (data.latitude !== undefined) {
            fields.push('latitude = ?');
            params.push(data.latitude || null);
        }
        if (data.status !== undefined) {
            fields.push('status = ?');
            params.push(data.status);
        }

        if (fields.length === 0) {
            return org;
        }

        params.push(id);
        const sql = `UPDATE organizations SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(sql, params);

        return await this.findById(id);
    }

    /**
     * 删除机构
     */
    static async delete(id) {
        // 检查是否有子机构
        const sql = 'SELECT COUNT(*) as count FROM organizations WHERE parent_id = ?';
        const result = await db.query(sql, [id]);

        if (result[0].count > 0) {
            throw new Error('该机构下有子机构，无法删除');
        }

        // 检查是否有关联用户
        const userSql = 'SELECT COUNT(*) as count FROM users WHERE org_id = ?';
        const userResult = await db.query(userSql, [id]);

        if (userResult[0].count > 0) {
            throw new Error('该机构下有关联用户，无法删除');
        }

        const deleteSql = 'DELETE FROM organizations WHERE id = ?';
        await db.query(deleteSql, [id]);
        return true;
    }

    /**
     * 更新机构状态
     */
    static async updateStatus(id, status) {
        if (!Object.values(ORG_STATUS).includes(status)) {
            throw new Error('无效的状态值');
        }

        const sql = 'UPDATE organizations SET status = ? WHERE id = ?';
        await db.query(sql, [status, id]);
        return await this.findById(id);
    }

    /**
     * 获取机构统计信息
     */
    static async getStats() {
        const sql = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN org_type = 'platform' THEN 1 ELSE 0 END) as platform_count,
                SUM(CASE WHEN org_type = 'franchisee' THEN 1 ELSE 0 END) as franchisee_count,
                SUM(CASE WHEN org_type = 'store' THEN 1 ELSE 0 END) as store_count,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_count,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_count
            FROM organizations
        `;
        const rows = await db.query(sql);
        return rows[0];
    }
}

module.exports = {
    Organization,
    ORG_TYPE,
    ORG_STATUS,
    FRANCHISEE_LEVEL
};
