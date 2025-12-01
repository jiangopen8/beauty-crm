// ============================================
// 数据库配置文件示例
// 复制此文件为 db.config.js 并修改相应配置
// ============================================

const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
    // 阿里云RDS连接信息
    host: 'your-rds-host.mysql.rds.aliyuncs.com',  // RDS主机地址
    port: 3306,                                     // 端口
    user: 'your_username',                          // 数据库用户名
    password: 'your_password',                      // 数据库密码
    database: 'beauty_crm',                         // 数据库名

    // 连接池配置
    waitForConnections: true,                       // 等待可用连接
    connectionLimit: 10,                            // 最大连接数
    queueLimit: 0,                                  // 队列长度限制（0为无限制）
    enableKeepAlive: true,                          // 保持连接活跃
    keepAliveInitialDelay: 0,                       // 保活初始延迟

    // 字符集
    charset: 'utf8mb4',

    // 时区设置
    timezone: '+08:00',

    // 连接超时（毫秒）
    connectTimeout: 10000,

    // 其他配置
    multipleStatements: false,                      // 禁止多语句查询（安全）
    namedPlaceholders: true,                        // 启用命名占位符
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接函数
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ 数据库连接成功！');
        console.log('数据库:', dbConfig.database);
        console.log('主机:', dbConfig.host);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        return false;
    }
}

// 查询包装函数
async function query(sql, params = []) {
    try {
        const [rows, fields] = await pool.execute(sql, params);
        return { success: true, data: rows, fields };
    } catch (error) {
        console.error('查询错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 事务包装函数
async function transaction(callback) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const result = await callback(connection);
        await connection.commit();
        connection.release();
        return { success: true, data: result };
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('事务错误:', error.message);
        return { success: false, error: error.message };
    }
}

// 导出
module.exports = {
    pool,
    query,
    transaction,
    testConnection
};

// ============================================
// 使用示例
// ============================================

/*
// 1. 基础查询
const db = require('./db.config');

async function getCustomers() {
    const result = await db.query(
        'SELECT * FROM customers WHERE org_id = ? AND status = ?',
        [1, 'active']
    );

    if (result.success) {
        console.log('客户列表:', result.data);
    } else {
        console.error('查询失败:', result.error);
    }
}

// 2. 插入数据
async function createCustomer(customer) {
    const result = await db.query(
        `INSERT INTO customers (customer_no, name, phone, org_id, store_id)
         VALUES (?, ?, ?, ?, ?)`,
        [customer.customerNo, customer.name, customer.phone, customer.orgId, customer.storeId]
    );

    if (result.success) {
        console.log('客户创建成功，ID:', result.data.insertId);
    }
}

// 3. 使用事务
async function createOrder(orderData) {
    const result = await db.transaction(async (connection) => {
        // 1. 创建订单
        const [orderResult] = await connection.execute(
            `INSERT INTO orders (order_no, customer_id, total_amount, org_id)
             VALUES (?, ?, ?, ?)`,
            [orderData.orderNo, orderData.customerId, orderData.totalAmount, orderData.orgId]
        );

        const orderId = orderResult.insertId;

        // 2. 创建订单明细
        for (const item of orderData.items) {
            await connection.execute(
                `INSERT INTO order_items (order_id, service_id, quantity, unit_price)
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.serviceId, item.quantity, item.unitPrice]
            );
        }

        // 3. 更新客户统计
        await connection.execute(
            `UPDATE customers
             SET total_orders = total_orders + 1,
                 total_consumption = total_consumption + ?
             WHERE id = ?`,
            [orderData.totalAmount, orderData.customerId]
        );

        return orderId;
    });

    if (result.success) {
        console.log('订单创建成功，ID:', result.data);
    } else {
        console.error('订单创建失败:', result.error);
    }
}

// 4. 测试连接
db.testConnection();
*/
