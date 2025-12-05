const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('现有客户列表:');
    const [customers] = await conn.execute('SELECT id, name, phone FROM customers LIMIT 10');
    customers.forEach(c => {
        console.log(`ID: ${c.id}, 姓名: ${c.name || '无'}, 电话: ${c.phone || '无'}`);
    });

    console.log('\n已有的客户资料:');
    const [profiles] = await conn.execute(
        'SELECT customer_id, COUNT(*) as count FROM customer_profiles WHERE is_deleted = 0 GROUP BY customer_id'
    );
    profiles.forEach(p => {
        console.log(`Customer ID: ${p.customer_id}, 资料数: ${p.count}`);
    });

    await conn.end();
})();
