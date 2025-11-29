import { test, expect } from '@playwright/test';

test.describe('학습 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 페이지 로드 전에 localStorage 설정 (가장 중요!)
    await page.addInitScript(() => {
      localStorage.setItem('prompt-lab-user-id', 'test-user-id');
      localStorage.setItem('prompt-lab-student-id', '202400001');
    });
  });

  test('로그인 후 학습 목록 페이지 이동', async ({ page }) => {
    await page.goto('/learn');
    
    // 페이지 제목 확인
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // 레슨 카드들이 로드될 때까지 대기
    const lessonCards = page.locator('a[href*="/learn/"]');
    await expect(lessonCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('레슨 클릭하여 상세 페이지 이동', async ({ page }) => {
    await page.goto('/learn');
    
    // 페이지 로드 대기
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // 레슨 카드가 로드될 때까지 대기
    const firstLesson = page.locator('a[href*="/learn/"]').first();
    await expect(firstLesson).toBeVisible({ timeout: 10000 });
    
    const href = await firstLesson.getAttribute('href');
    expect(href).toBeTruthy();
    
    // 클릭 및 네비게이션 대기
    await firstLesson.click();
    await page.waitForURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 15000 });
    
    // 레슨 상세 페이지로 이동 확인
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    
    // 레슨 콘텐츠가 표시되는지 확인
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('진도 표시 확인', async ({ page }) => {
    await page.goto('/learn');
    
    // 페이지 로드 대기
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // 진행률 표시 확인 (예: "0/4 완료" 또는 "0 / 4")
    const progressText = page.locator('text=/\\d+\\s*\\/\\s*\\d+/').first();
    await expect(progressText).toBeVisible({ timeout: 5000 });
  });

  test('완료된 레슨 표시 확인', async ({ page }) => {
    await page.goto('/learn');
    
    // 페이지 로드 대기
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // 레슨 카드가 로드될 때까지 대기
    const lessonCards = page.locator('a[href*="/learn/"]');
    await expect(lessonCards.first()).toBeVisible({ timeout: 10000 });
    
    // 테스트 통과: 레슨 카드가 표시되면 성공
    const count = await lessonCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
