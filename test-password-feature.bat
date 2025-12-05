@echo off
chcp 65001 >nul
echo ========================================
echo 修改密码功能 - 快速测试脚本
echo ========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js 已安装:
node --version
echo.

REM 检查npm是否安装
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到npm
    pause
    exit /b 1
)

echo [✓] npm 已安装:
npm --version
echo.

REM 检查依赖是否已安装
if not exist "node_modules" (
    echo [提示] 正在安装项目依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [✓] 依赖安装完成
    echo.
)

REM 检查MySQL连接
echo [检查] 正在测试数据库连接...
node database/test-connection.js >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [警告] 数据库连接失败，请检查配置
    echo 配置文件: api/config/database.js
    echo.
    echo 是否继续启动服务器？（服务器将无法访问数据库）
    choice /C YN /M "继续(Y) 或 退出(N)"
    if errorlevel 2 exit /b 1
) else (
    echo [✓] 数据库连接正常
)
echo.

REM 检查端口占用
netstat -ano | findstr ":3000" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [警告] 端口3000已被占用
    echo 正在尝试结束占用进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    timeout /t 2 >nul
)

echo ========================================
echo 启动服务器
echo ========================================
echo.
echo [提示] 服务器将在 http://localhost:3000 运行
echo [提示] 按 Ctrl+C 可以停止服务器
echo.

REM 启动服务器
echo [启动] 正在启动后端服务器...
start "美业CRM后端服务器" cmd /k "node api/server.js"

REM 等待服务器启动
echo [等待] 服务器启动中，请稍候...
timeout /t 3 >nul

REM 测试服务器是否启动成功
echo [测试] 正在测试服务器连接...
powershell -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; Write-Output '[✓] 服务器启动成功' } catch { Write-Output '[错误] 服务器启动失败' }" 2>nul
echo.

echo ========================================
echo 打开测试页面
echo ========================================
echo.
echo 选择要打开的测试页面:
echo.
echo [1] 独立测试页面 (test-change-password.html)
echo [2] 设置页面 (settings.html)
echo [3] 不打开，仅启动服务器
echo.

choice /C 123 /N /M "请选择 [1-3]: "

if errorlevel 3 (
    echo.
    echo [提示] 服务器已启动，您可以手动访问:
    echo   - 测试页面: http://localhost:3000/test-change-password.html
    echo   - 设置页面: http://localhost:3000/settings.html
    goto end
)

if errorlevel 2 (
    echo.
    echo [打开] 设置页面...
    start http://localhost:3000/settings.html
    goto end
)

if errorlevel 1 (
    echo.
    echo [打开] 独立测试页面...
    start http://localhost:3000/test-change-password.html
    goto end
)

:end
echo.
echo ========================================
echo 测试信息
echo ========================================
echo.
echo 测试用户信息:
echo   用户名: admin
echo   密码: 123456
echo   用户ID: 1
echo.
echo 可用的页面:
echo   - 独立测试页面: http://localhost:3000/test-change-password.html
echo   - 设置页面: http://localhost:3000/settings.html
echo   - 主页: http://localhost:3000/index.html
echo.
echo 快速测试步骤:
echo   1. 打开测试页面
echo   2. 点击"填充默认值"按钮
echo   3. 点击"提交修改"
echo   4. 查看结果提示
echo.
echo 文档位置:
echo   - 完整使用指南: 修改密码功能-完整使用指南.md
echo.
echo ========================================
echo.
echo [提示] 服务器正在后台运行
echo [提示] 关闭此窗口不会停止服务器
echo [提示] 要停止服务器，请关闭服务器窗口或按Ctrl+C
echo.

pause
