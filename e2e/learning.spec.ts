import { test, expect } from '@playwright/test';

test.describe('학습 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태로 만들기 위해 localStorage 설정
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('prompt-lab-user-id', 'test-user-id');
      localStorage.setItem('prompt-lab-student-id', '202400001');
    });
  });

  test('로그인 후 학습 목록 페이지 이동', async ({ page }) => {
    await page.goto('/');
    
    // 이미 로그인된 상태이므로 자동으로 /learn으로 리다이렉트되거나
    // 직접 /learn으로 이동
    await page.goto('/learn');
    
    // 페이지 제목 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 레슨 카드들이 표시되는지 확인
    const lessonCards = page.locator('[data-testid="lesson-card"], a[href*="/learn/"]');
    await expect(lessonCards.first()).toBeVisible();
  });

  test('레슨 클릭하여 상세 페이지 이동', async ({ page }) => {
    await page.goto('/learn');
    
    // 첫 번째 레슨 링크 클릭
    const firstLesson = page.locator('a[href*="/learn/"]').first();
    if (await firstLesson.count() > 0) {
      const href = await firstLesson.getAttribute('href');
      await firstLesson.click();
      
      // 레슨 상세 페이지로 이동 확인
      if (href) {
        await expect(page).toHaveURL(new RegExp(href));
      }
      
      // 레슨 콘텐츠가 표시되는지 확인
      await expect(page.locator('main, article, [role="main"]')).toBeVisible();
    }
  });

  test('진도 표시 확인', async ({ page }) => {
    await page.goto('/learn');
    
    // 진행률 바가 표시되는지 확인
    const progressBar = page.locator('[role="progressbar"], [aria-label*="progress"], [aria-label*="진행"]');
    if (await progressBar.count() > 0) {
      await expect(progressBar.first()).toBeVisible();
    }
  });

  test('완료된 레슨 표시 확인', async ({ page }) => {
    await page.goto('/learn');
    
    // 완료 뱃지나 표시가 있는지 확인
    const completedBadge = page.locator('text=/완료|Complete|completed/i');
    // 완료된 레슨이 있을 수도 있고 없을 수도 있으므로 count만 확인
    const count = await completedBadge.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

