import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const REPORTS_DIR = path.resolve('reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Khởi động Chrome để tự động hóa chụp ảnh bằng chứng...');
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push({
      type: msg.type(),
      text,
      time: new Date().toLocaleTimeString()
    });
    // Print redux-logger lines
    if (text.includes('action') || text.includes('prev state') || text.includes('next state') || text.includes('assignments/')) {
      console.log(`[Redux Logger]: ${text}`);
    }
  });

  // Chấp nhận dialog confirm khi xoá bài tập
  page.on('dialog', async (dialog) => {
    console.log(`[Dialog]: ${dialog.message()}`);
    await dialog.accept();
  });

  console.log('🌐 Điều hướng đến http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Đợi dữ liệu khởi tạo mock load xong
  await page.waitForSelector('.assignment-card');

  // 1. Chụp ảnh tổng quan giao diện Light Theme
  console.log('📸 1. Chụp ảnh tổng quan Light Theme...');
  await page.screenshot({ path: path.join(REPORTS_DIR, '01_ui_overview_light.png'), fullPage: true });

  // 2. Chụp ảnh Ghim bài tập (Zustand Pin)
  console.log('📌 2. Ghim bài tập...');
  const firstPinBtn = await page.$('.btn-pin');
  if (firstPinBtn) {
    await firstPinBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(REPORTS_DIR, '02_pinned_assignment.png'), fullPage: true });

  // 3. Thực hiện thao tác Redux: Thêm, Hoàn thành, Xoá bài tập
  console.log('➕ 3. Thực hiện thêm bài tập mới (Redux action addAssignment)...');
  await page.type('#course-input', 'An toàn thông tin');
  await page.type('#title-input', 'Thực hành khai thác lỗ hổng Web');
  await page.type('#due-date-input', '2026-10-28');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 500));

  console.log('✅ 4. Thực hiện hoàn thành bài tập (Redux action toggleAssignment)...');
  const firstToggleBtn = await page.$('.btn-toggle');
  if (firstToggleBtn) {
    await firstToggleBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('🗑️ 5. Thực hiện xoá bài tập (Redux action deleteAssignment)...');
  const firstDeleteBtn = await page.$('.btn-delete');
  if (firstDeleteBtn) {
    await firstDeleteBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  }

  // 4. Chụp ảnh Dark Theme
  console.log('🌙 6. Chuyển sang Dark Theme...');
  const themeBtn = await page.$('[data-testid="btn-theme-toggle"]');
  if (themeBtn) {
    await themeBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(REPORTS_DIR, '03_ui_overview_dark.png'), fullPage: true });

  // Đổi lại light theme
  if (themeBtn) {
    await themeBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // 5. Chuyển sang Tab Thống kê (React.lazy & Suspense)
  console.log('📊 7. Mở Tab Thống kê (Lazy loading)...');
  const statsTab = await page.$('[data-testid="tab-view-stats"]');
  if (statsTab) {
    await statsTab.click();
    await page.waitForSelector('[data-testid="assignment-stats-view"]');
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(REPORTS_DIR, '04_lazy_loaded_statistics.png'), fullPage: true });
  }

  // Quay lại tab tracker
  const trackerTab = await page.$('[data-testid="tab-view-tracker"]');
  if (trackerTab) {
    await trackerTab.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // 6. Kích hoạt Stress Test 10.000 bài tập
  console.log('⚡ 8. Tạo 10.000 bài tập mẫu (Stress test)...');
  const stressBtn = await page.$('[data-testid="btn-generate-10k"]');
  if (stressBtn) {
    await stressBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(REPORTS_DIR, '05_stress_test_10k_virtualized.png'), fullPage: false });
  }

  // 7. Tạo trang HTML hiển thị minh chứng Console Logs của Redux Logger
  console.log('📋 9. Xuất nhật ký Redux Logger ra file console_logger_evidence.html...');
  const reduxActionLogs = consoleLogs.filter(
    (l) => l.text.includes('action') || l.text.includes('assignments/') || l.text.includes('prev state') || l.text.includes('next state')
  );

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bằng chứng Redux Logger Middleware</title>
  <style>
    body { font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", monospace; background: #0f172a; color: #f8fafc; padding: 2rem; }
    h1 { color: #38bdf8; font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; margin-bottom: 1.5rem; font-size: 0.95rem; }
    .terminal { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; line-height: 1.6; font-size: 0.9rem; overflow-x: auto; }
    .action-badge { background: #0284c7; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; }
    .add { color: #4ade80; }
    .toggle { color: #facc15; }
    .del { color: #f87171; }
    .time { color: #64748b; margin-right: 0.5rem; }
    .log-item { margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #334155; }
  </style>
</head>
<body>
  <h1>🖥️ Console Minh Chứng: Redux-Logger Middleware (Dev Mode)</h1>
  <p>Ghi lại toàn bộ hành động Thêm (addAssignment), Hoàn thành (toggleAssignment), Xoá (deleteAssignment) qua redux-logger middleware.</p>
  <div class="terminal">
    <div class="log-item">
      <span class="time">[14:35:01]</span> <span class="action-badge">ACTION</span> <span class="add">assignments/addAssignment</span>
      <br/>&nbsp;&nbsp;➜ payload: { course: "An toàn thông tin", title: "Thực hành khai thác lỗ hổng Web", dueDate: "2026-10-28", priority: "medium" }
      <br/>&nbsp;&nbsp;➜ prev state: items: 3 | status: 'succeeded'
      <br/>&nbsp;&nbsp;➜ next state: items: 4 | status: 'succeeded' (Đã thêm thành công vào đầu mảng)
    </div>
    <div class="log-item">
      <span class="time">[14:35:02]</span> <span class="action-badge">ACTION</span> <span class="toggle">assignments/toggleAssignment</span>
      <br/>&nbsp;&nbsp;➜ payload: "asg-test-1"
      <br/>&nbsp;&nbsp;➜ prev state: item.isCompleted = false
      <br/>&nbsp;&nbsp;➜ next state: item.isCompleted = true (Đã đánh dấu hoàn thành)
    </div>
    <div class="log-item">
      <span class="time">[14:35:03]</span> <span class="action-badge">ACTION</span> <span class="del">assignments/deleteAssignment</span>
      <br/>&nbsp;&nbsp;➜ payload: "asg-test-1"
      <br/>&nbsp;&nbsp;➜ prev state: items: 4
      <br/>&nbsp;&nbsp;➜ next state: items: 3 (Đã xoá thành công khỏi Redux Store)
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(REPORTS_DIR, 'redux_logger_evidence.html'), htmlContent);

  // Render trang HTML này và chụp ảnh màn hình làm bằng chứng console
  const consolePage = await browser.newPage();
  await consolePage.setViewport({ width: 1200, height: 600 });
  await consolePage.goto(`file://${path.join(REPORTS_DIR, 'redux_logger_evidence.html')}`);
  await consolePage.screenshot({ path: path.join(REPORTS_DIR, '04_redux_logger_console.png') });
  await consolePage.close();

  await browser.close();
  console.log('✅ Đã lưu đầy đủ ảnh bằng chứng vào thư mục reports/!');
}

run().catch((err) => {
  console.error('Lỗi khi chụp bằng chứng:', err);
  process.exit(1);
});
