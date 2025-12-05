const db = require('../config/db');

/**
 * 角色状态枚举
 */
const ROLE_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

/**
 * 数据权限范围枚举
 */
const DATA_SCOPE = {
    ALL: 'all',       // 全部数据
    ORG: 'org',       // 本机构数据
    STORE: 'store',   // 本门店数据
    SELF: 'self'      // 仅自己的数据
};

/**
 * 角色模型
 */
class Role {
    /**
     * 根据ID获取角色信息
     */
    static async findById(id) {
        const sql = `
            SELECT
                r.id,
                r.role_code,
                r.role_name,
                r.description,
                r.data_scope,
                r.status,
                r.created_at,
                r.updated_at
            FROM roles r
            WHERE r.id = ? AND r.is_deleted = 0
        `;

        const rows = await db.query(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        const role = rows[0];

        // 获取该角色的权限列表
        role.permissions = await this.getRolePermissions(id);

        // 获取该角色的用户数量
        role.user_count = await this.getUserCount(id);

        return role;
    }

    /**
     * 根据角色代码获取角色
     */
    static async findByCode(roleCode) {
        const sql = `
            SELECT
                r.*
            FROM roles r
            WHERE r.role_code = ? AND r.is_deleted = 0
        `;

        const rows = await db.query(sql, [roleCode]);
        return rows[0] || null;
    }

    /**
     * 获取角色列表（分页）
     */
    static async getList({ page = 1, pageSize = 20, status, keyword }) {
        const offset = (page - 1) * pageSize;

        let whereClauses = ['r.is_deleted = 0'];
        const params = [];

        if (status) {
            whereClauses.push('r.status = ?');
            params.push(status);
        }

        if (keyword) {
            whereClauses.push('(r.role_name LIKE ? OR r.role_code LIKE ? OR r.description LIKE ?)');
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
        }

        const whereClause = whereClauses.join(' AND ');

        // 获取总数
        const countSql = `
            SELECT COUNT(*) as total
            FROM roles r
            WHERE ${whereClause}
        `;
        const countResult = await db.query(countSql, params);
        const total = countResult[0]?.total || 0;

        // 获取列表
        const sql = `
            SELECT
                r.id,
                r.role_code,
                r.role_name,
                r.description,
                r.data_scope,
                r.status,
                r.created_at,
                r.updated_at
            FROM roles r
            WHERE ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT ${pageSize} OFFSET ${offset}
        `;

        const roles = await db.query(sql, params);

        // 为每个角色获取用户数量
        for (let role of roles) {
            role.user_count = await this.getUserCount(role.id);
            role.permissions = await this.getRolePermissions(role.id);
        }

        return {
            items: roles,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        };
    }

    /**
     * 创建角色
     */
    static async create(data) {
        const { role_code, role_name, description, data_scope = DATA_SCOPE.SELF, status = ROLE_STATUS.ACTIVE, created_by } = data;

        // 检查角色代码是否已存在
        const existing = await this.findByCode(role_code);
        if (existing) {
            throw new Error('角色代码已存在');
        }

        const sql = `
            INSERT INTO roles (
                role_code,
                role_name,
                description,
                data_scope,
                status,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await db.query(sql, [
            role_code,
            role_name,
            description || null,
            data_scope,
            status,
            created_by || null
        ]);

        return result.insertId;
    }

    /**
     * 更新角色
     */
    static async update(id, data) {
        const { role_name, description, data_scope, status } = data;

        const updateFields = [];
        const params = [];

        if (role_name !== undefined) {
            updateFields.push('role_name = ?');
            params.push(role_name);
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            params.push(description);
        }

        if (data_scope !== undefined) {
            updateFields.push('data_scope = ?');
            params.push(data_scope);
        }

        if (status !== undefined) {
            updateFields.push('status = ?');
            params.push(status);
        }

        if (updateFields.length === 0) {
            throw new Error('没有需要更新的字段');
        }

        params.push(id);

        const sql = `
            UPDATE roles
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_deleted = 0
        `;

        const result = await db.query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * 删除角色（软删除）
     */
    static async delete(id) {
        // 检查是否有用户关联
        const userCount = await this.getUserCount(id);
        if (userCount > 0) {
            throw new Error(`该角色还有 ${userCount} 个用户关联，无法删除`);
        }

        const sql = `
            UPDATE roles
            SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_deleted = 0
        `;

        const result = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * 获取角色的权限列表
     */
    static async getRolePermissions(roleId) {
        const sql = `
            SELECT
                p.id,
                p.permission_code,
                p.permission_name,
                p.resource_type
            FROM role_permissions rp
            INNER JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = ? AND p.is_deleted = 0
            ORDER BY p.sort_order ASC
        `;

        const rows = await db.query(sql, [roleId]);
        return rows.map(row => row.permission_code);
    }

    /**
     * 设置角色权限
     */
    static async setPermissions(roleId, permissionIds, created_by = null) {
        // 先删除原有权限
        await db.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

        // 插入新权限
        if (permissionIds && permissionIds.length > 0) {
            const values = permissionIds.map(permissionId =>
                `(${roleId}, ${permissionId}, ${created_by || 'NULL'})`
            ).join(',');

            const sql = `
                INSERT INTO role_permissions (role_id, permission_id, created_by)
                VALUES ${values}
            `;

            await db.query(sql);
        }

        return true;
    }

    /**
     * 获取角色的用户数量
     */
    static async getUserCount(roleId) {
        const sql = `
            SELECT COUNT(*) as count
            FROM user_roles
            WHERE role_id = ?
        `;

        const rows = await db.query(sql, [roleId]);
        return rows[0]?.count || 0;
    }

    /**
     * 获取角色统计信息
     */
    static async getStats() {
        const sql = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_count
            FROM roles
            WHERE is_deleted = 0
        `;

        const rows = await db.query(sql);
        const stats = rows[0] || { total: 0, active_count: 0, inactive_count: 0 };

        // 获取所有角色的总用户数
        const userCountSql = `
            SELECT COUNT(DISTINCT user_id) as total_users
            FROM user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE r.is_deleted = 0
        `;
        const userCountRows = await db.query(userCountSql);
        stats.total_users = userCountRows[0]?.total_users || 0;

        return stats;
    }

    /**
     * 为用户分配角色
     */
    static async assignToUser(userId, roleIds, created_by = null) {
        // 先删除用户原有角色
        await db.query('DELETE FROM user_roles WHERE user_id = ?', [userId]);

        // 插入新角色
        if (roleIds && roleIds.length > 0) {
            const values = roleIds.map(roleId =>
                `(${userId}, ${roleId}, ${created_by || 'NULL'})`
            ).join(',');

            const sql = `
                INSERT INTO user_roles (user_id, role_id, created_by)
                VALUES ${values}
            `;

            await db.query(sql);
        }

        return true;
    }

    /**
     * 获取用户的角色列表
     */
    static async getUserRoles(userId) {
        const sql = `
            SELECT
                r.id,
                r.role_code,
                r.role_name,
                r.data_scope
            FROM user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ? AND r.is_deleted = 0 AND r.status = 'active'
        `;

        return await db.query(sql, [userId]);
    }
}

module.exports = {
    Role,
    ROLE_STATUS,
    DATA_SCOPE
};
