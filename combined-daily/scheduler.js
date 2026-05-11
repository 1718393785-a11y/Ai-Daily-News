const schedule = require('node-schedule');
const { main } = require('./daily_news.js');

console.log('🤖 AI 每日日报定时任务已启动');
console.log('⏰ 设置为: 每天早上 9:00 自动运行');
console.log('📂 保存位置: ./digests/ 目录');
console.log('🔢 保留份数: 最新20份（自动清理旧文件）');
console.log('----------------------------------------');

// 检查当前时间
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// 每天早上9点运行
const job = schedule.scheduleJob('0 0 9 * * *', async function() {
  console.log(`\n[${getCurrentTime()}] ⏰ 触发定时任务 - 开始生成每日AI日报...`);

  try {
    await main();
    console.log(`[${getCurrentTime()}] ✅ 日报生成完成`);
    console.log('----------------------------------------');
    console.log('⏳ 等待下一次运行 (明天 9:00)...');
  } catch (error) {
    console.error(`[${getCurrentTime()}] ❌ 生成失败:`, error.message);
    console.log('----------------------------------------');
    console.log('⏳ 等待下一次运行 (明天 9:00)...');
  }
});

// 立即运行一次（测试用）
console.log(`\n[${getCurrentTime()}] 🚀 系统启动，立即生成一份日报测试...`);
main().then(() => {
  console.log(`\n[${getCurrentTime()}] ✅ 测试完成`);
  console.log('----------------------------------------');
  console.log('⏳ 等待定时任务，下次运行时间: 明天早上 9:00');
}).catch(err => {
  console.error(`[${getCurrentTime()}] ❌ 测试运行失败:`, err.message);
});

// 处理退出
process.on('SIGINT', function() {
  console.log('\n\n👋 收到退出信号，停止定时任务...');
  job.cancel();
  console.log('✅ 定时任务已停止，程序退出');
  process.exit(0);
});

process.on('SIGTERM', function() {
  console.log('\n\n👋 收到终止信号，停止定时任务...');
  job.cancel();
  console.log('✅ 定时任务已停止，程序退出');
  process.exit(0);
});
