/**
 * 智能插入测试订单数据
 * 会先查询现有客户,然后使用真实的客户ID
 */
const { getPool } = require('./db.config');

async function insertTestOrdersSmart() {
    const pool = getPool();

    try {
        console.log('📝 开始插入测试订单数据...\n');

        // 检查是否已有订单
        const [existing] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE is_deleted = 0');
        if (existing[0].count > 0) {
            console.log(`⚠️  数据库中已有 ${existing[0].count} 条订单数据。`);
            const [orders] = await pool.query('SELECT * FROM orders WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT 5');
            console.log('\n最近的订单:');
            console.table(orders.map(o => ({
                订单号: o.order_no,
                客户: o.customer_name,
                金额: o.final_amount,
                状态: o.order_status,
                支付: o.payment_status
            })));
            return;
        }

        // 获取真实的客户ID
        const [customers] = await pool.query('SELECT id, name, phone FROM customers WHERE is_deleted = 0 ORDER BY id LIMIT 10');

        if (customers.length === 0) {
            console.log('❌ 数据库中没有客户数据,无法创建订单。请先创建客户。\n');
            return;
        }

        console.log(`✅ 找到 ${customers.length} 个客户\n`);

        // 测试订单数据 (使用真实客户ID)
        const testOrders = [];

        // 为每个客户创建1-2个订单
        for (let i = 0; i < Math.min(8, customers.length); i++) {
            const customer = customers[i % customers.length];
            const orderIndex = i + 1;

            // 随机生成订单数据
            const statuses = ['completed', 'in_progress', 'confirmed', 'pending', 'cancelled'];
            const paymentStatuses = ['paid', 'unpaid', 'partial'];
            const order_status = statuses[i % statuses.length];
            const payment_status = order_status === 'cancelled' ? 'unpaid' : (order_status === 'pending' ? 'unpaid' : 'paid');

            const original_amount = 300 + Math.floor(Math.random() * 2000);
            const discount_amount = order_status === 'completed' ? Math.floor(original_amount * 0.1) : 0;
            const final_amount = original_amount - discount_amount;

            testOrders.push({
                order_no: `ORD2025120300${String(orderIndex).padStart(2, '0')}`,
                org_id: 1,
                store_id: 1,
                customer_id: customer.id,
                customer_name: customer.name,
                customer_phone: customer.phone,
                counselor_id: 1,
                beautician_id: order_status !== 'pending' ? 2 : null,
                original_amount,
                discount_amount,
                final_amount,
                payment_method: payment_status === 'paid' ? (i % 3 === 0 ? 'wechat' : (i % 3 === 1 ? 'alipay' : 'card')) : null,
                payment_status,
                paid_amount: payment_status === 'paid' ? final_amount : 0,
                order_status,
                service_date: `2025-12-0${Math.min(1 + Math.floor(i / 2), 9)}`,
                service_start_time: `${10 + (i % 6)}:00:00`,
                service_end_time: `${12 + (i % 6)}:00:00`,
                remark: order_status === 'completed' ? '服务满意' : (order_status === 'pending' ? '待确认' : null),
                cancel_reason: order_status === 'cancelled' ? '客户时间冲突' : null
            });
        }

        // 插入数据
        let insertedCount = 0;
        for (const order of testOrders) {
            await pool.query(
                `INSERT INTO orders (
                    order_no, org_id, store_id, customer_id, customer_name, customer_phone,
                    counselor_id, beautician_id, original_amount, discount_amount, final_amount,
                    payment_method, payment_status, paid_amount, order_status,
                    service_date, service_start_time, service_end_time, remark, cancel_reason,
                    created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order.order_no, order.org_id, order.store_id, order.customer_id,
                    order.customer_name, order.customer_phone, order.counselor_id,
                    order.beautician_id, order.original_amount, order.discount_amount,
                    order.final_amount, order.payment_method, order.payment_status,
                    order.paid_amount, order.order_status, order.service_date,
                    order.service_start_time, order.service_end_time, order.remark,
                    order.cancel_reason, 1
                ]
            );
            insertedCount++;
            console.log(`✅ 已插入: ${order.order_no} - ${order.customer_name} (${order.order_status})`);
        }

        console.log(`\n✅ 成功插入 ${insertedCount} 条测试订单数据!\n`);

        // 显示统计
        const [stats] = await pool.query(`
            SELECT
                order_status,
                COUNT(*) as count,
                SUM(final_amount) as total
            FROM orders
            WHERE is_deleted = 0
            GROUP BY order_status
        `);

        console.log('📊 订单统计:');
        console.table(stats);

    } catch (error) {
        console.error('❌ 插入测试数据失败:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

// 执行
insertTestOrdersSmart()
    .then(() => {
        console.log('\n✅ 所有操作完成!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ 操作失败:', error);
        process.exit(1);
    });
