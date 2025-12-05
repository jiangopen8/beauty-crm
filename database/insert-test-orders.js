/**
 * 插入测试订单数据
 */
const { getPool } = require('./db.config');

async function insertTestOrders() {
    const pool = getPool();

    try {
        console.log('📝 开始插入测试订单数据...\n');

        // 检查是否已有订单
        const [existing] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE is_deleted = 0');
        if (existing[0].count > 0) {
            console.log(`⚠️  数据库中已有 ${existing[0].count} 条订单数据,跳过插入。\n`);
            return;
        }

        // 测试订单数据
        const testOrders = [
            // 已完成订单
            {
                order_no: 'ORD202512030001',
                org_id: 1,
                store_id: 1,
                customer_id: 1,
                customer_name: '张小姐',
                customer_phone: '13800138001',
                counselor_id: 1,
                beautician_id: 2,
                original_amount: 680.00,
                discount_amount: 80.00,
                final_amount: 600.00,
                payment_method: 'wechat',
                payment_status: 'paid',
                paid_amount: 600.00,
                order_status: 'completed',
                service_date: '2025-12-01',
                service_start_time: '14:00:00',
                service_end_time: '16:00:00',
                remark: '客户皮肤状态良好,服务满意'
            },
            {
                order_no: 'ORD202512030002',
                org_id: 1,
                store_id: 1,
                customer_id: 2,
                customer_name: '王女士',
                customer_phone: '13800138002',
                counselor_id: 1,
                beautician_id: 3,
                original_amount: 1280.00,
                discount_amount: 0.00,
                final_amount: 1280.00,
                payment_method: 'alipay',
                payment_status: 'paid',
                paid_amount: 1280.00,
                order_status: 'completed',
                service_date: '2025-12-02',
                service_start_time: '15:00:00',
                service_end_time: '17:30:00',
                remark: 'VIP客户,服务满意'
            },
            // 进行中订单
            {
                order_no: 'ORD202512030003',
                org_id: 1,
                store_id: 1,
                customer_id: 3,
                customer_name: '李小姐',
                customer_phone: '13800138003',
                counselor_id: 1,
                beautician_id: 2,
                original_amount: 3680.00,
                discount_amount: 680.00,
                final_amount: 3000.00,
                payment_method: 'card',
                payment_status: 'paid',
                paid_amount: 3000.00,
                order_status: 'in_progress',
                service_date: '2025-12-04',
                service_start_time: '10:00:00',
                service_end_time: '12:00:00',
                remark: '疗程套餐,已完成2次,共5次'
            },
            // 待确认订单
            {
                order_no: 'ORD202512030004',
                org_id: 1,
                store_id: 1,
                customer_id: 4,
                customer_name: '赵女士',
                customer_phone: '13800138004',
                counselor_id: 1,
                beautician_id: null,
                original_amount: 880.00,
                discount_amount: 0.00,
                final_amount: 880.00,
                payment_method: 'wechat',
                payment_status: 'paid',
                paid_amount: 880.00,
                order_status: 'confirmed',
                service_date: '2025-12-04',
                service_start_time: '14:00:00',
                service_end_time: '16:00:00',
                remark: '新客户首次体验'
            },
            {
                order_no: 'ORD202512030005',
                org_id: 1,
                store_id: 1,
                customer_id: 5,
                customer_name: '刘小姐',
                customer_phone: '13800138005',
                counselor_id: 1,
                beautician_id: null,
                original_amount: 580.00,
                discount_amount: 30.00,
                final_amount: 550.00,
                payment_method: 'alipay',
                payment_status: 'paid',
                paid_amount: 550.00,
                order_status: 'confirmed',
                service_date: '2025-12-05',
                service_start_time: '10:00:00',
                service_end_time: '11:30:00',
                remark: '会员客户'
            },
            // 待支付订单
            {
                order_no: 'ORD202512030006',
                org_id: 1,
                store_id: 1,
                customer_id: 6,
                customer_name: '陈女士',
                customer_phone: '13800138006',
                counselor_id: 1,
                beautician_id: null,
                original_amount: 1580.00,
                discount_amount: 80.00,
                final_amount: 1500.00,
                payment_method: null,
                payment_status: 'unpaid',
                paid_amount: 0.00,
                order_status: 'pending',
                service_date: '2025-12-06',
                service_start_time: '15:00:00',
                service_end_time: '17:00:00',
                remark: '待客户确认支付'
            },
            {
                order_no: 'ORD202512030007',
                org_id: 1,
                store_id: 1,
                customer_id: 2,
                customer_name: '王女士',
                customer_phone: '13800138002',
                counselor_id: 1,
                beautician_id: null,
                original_amount: 280.00,
                discount_amount: 0.00,
                final_amount: 280.00,
                payment_method: null,
                payment_status: 'unpaid',
                paid_amount: 0.00,
                order_status: 'pending',
                service_date: '2025-12-04',
                service_start_time: '16:00:00',
                service_end_time: '17:00:00',
                remark: '线上预约待付款'
            },
            // 已取消订单
            {
                order_no: 'ORD202512030008',
                org_id: 1,
                store_id: 1,
                customer_id: 7,
                customer_name: '周女士',
                customer_phone: '13800138007',
                counselor_id: 1,
                beautician_id: null,
                original_amount: 780.00,
                discount_amount: 0.00,
                final_amount: 780.00,
                payment_method: null,
                payment_status: 'unpaid',
                paid_amount: 0.00,
                order_status: 'cancelled',
                service_date: '2025-12-03',
                service_start_time: '14:00:00',
                service_end_time: '15:30:00',
                remark: null,
                cancel_reason: '客户时间冲突取消'
            }
        ];

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
            console.log(`✅ 已插入: ${order.order_no} - ${order.customer_name}`);
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
        console.error(error);
        throw error;
    } finally {
        await pool.end();
    }
}

// 执行
insertTestOrders()
    .then(() => {
        console.log('\n✅ 所有操作完成!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ 操作失败:', error);
        process.exit(1);
    });
