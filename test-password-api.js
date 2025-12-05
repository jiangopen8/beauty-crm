const http = require('http');

function fetchAPI(url, options) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            method: options.method,
            headers: options.headers
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        json: () => Promise.resolve(JSON.parse(data))
                    });
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function testPasswordAPI() {
    console.log('====================================');
    console.log('测试修改密码API');
    console.log('====================================\n');

    const userId = 1;
    const oldPassword = '123456';
    const newPassword = 'test123456';

    console.log('步骤1: 测试修改密码（正确的旧密码）');
    console.log('参数:', { userId, oldPassword, newPassword });
    console.log('');

    try {
        const response = await fetchAPI(`http://localhost:5004/api/users/${userId}/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword
            })
        });

        const result = await response.json();
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(result, null, 2));
        console.log('');

        if (result.success) {
            console.log('✅ 测试1通过: 密码修改成功\n');

            // 步骤2: 测试用错误的旧密码修改
            console.log('步骤2: 测试修改密码（错误的旧密码）');
            const response2 = await fetchAPI(`http://localhost:5004/api/users/${userId}/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_password: 'wrongpassword',
                    new_password: 'anotherpass'
                })
            });

            const result2 = await response2.json();
            console.log('响应数据:', JSON.stringify(result2, null, 2));
            console.log('');

            if (!result2.success && result2.error?.code === 'INVALID_PASSWORD') {
                console.log('✅ 测试2通过: 正确拒绝错误的旧密码\n');
            } else {
                console.log('❌ 测试2失败: 应该拒绝错误的旧密码\n');
            }

            // 步骤3: 改回原密码
            console.log('步骤3: 将密码改回原密码');
            const response3 = await fetchAPI(`http://localhost:5004/api/users/${userId}/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_password: newPassword,
                    new_password: oldPassword
                })
            });

            const result3 = await response3.json();
            console.log('响应数据:', JSON.stringify(result3, null, 2));
            console.log('');

            if (result3.success) {
                console.log('✅ 测试3通过: 密码已还原\n');
            } else {
                console.log('❌ 测试3失败: 密码还原失败\n');
            }

        } else {
            console.log('❌ 测试1失败:', result.error?.message || '未知错误');
        }

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
    }

    console.log('====================================');
    console.log('测试完成');
    console.log('====================================');
}

testPasswordAPI();
