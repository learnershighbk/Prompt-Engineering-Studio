import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
  });

  test('유효한 학번으로 로그인 성공', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 hydration 대기 (로딩 스피너가 사라질 때까지)
    await page.waitForSelector('input[type="text"]', { state: 'visible' });
    
    // 학번 입력 필드 찾기 및 입력
    const input = page.locator('input[type="text"]').first();
    await input.waitFor({ state: 'visible' });
    await input.fill('202400001');
    
    // 버튼이 활성화될 때까지 대기
    const submitButton = page.locator('button[type="button"]').filter({ 
      hasText: /시작하기|Start|button/i 
    }).first();
    await submitButton.waitFor({ state: 'visible' });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    
    // API 호출 대기를 위해 네트워크 리스너 설정
    const navigationPromise = page.waitForURL(/\/learn/, { timeout: 10000 });
    await submitButton.click();
    
    // 학습 목록 페이지로 이동 확인
    await navigationPromise;
    await expect(page).toHaveURL(/\/learn/);
    
    // 레슨 카드가 표시되는지 확인
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });

  test('유효하지 않은 학번(8자리)으로 에러 표시', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[type="text"]', { state: 'visible' });
    
    // 8자리 학번 입력
    const input = page.locator('input[type="text"]').first();
    await input.fill('12345678');
    
    // 시작하기 버튼 클릭 시도
    const submitButton = page.locator('button[type="button"]').filter({ 
      hasText: /시작하기|Start/i 
    }).first();
    
    // 버튼이 비활성화되어 있는지 확인
    await expect(submitButton).toBeDisabled();
  });

  test('9자리 초과 입력 차단', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[type="text"]', { state: 'visible' });
    
    const input = page.locator('input[type="text"]').first();
    await input.fill('1234567890');
    
    // 입력값이 9자리로 제한되는지 확인
    const value = await input.inputValue();
    expect(value.length).toBeLessThanOrEqual(9);
  });

  test('숫자가 아닌 문자 입력 차단', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[type="text"]', { state: 'visible' });
    
    const input = page.locator('input[type="text"]').first();
    await input.fill('12345abcd');
    
    // 숫자만 남아있는지 확인
    const value = await input.inputValue();
    expect(/^\d*$/.test(value)).toBe(true);
  });
});

