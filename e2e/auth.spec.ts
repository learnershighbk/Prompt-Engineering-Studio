import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('유효한 학번으로 로그인 성공', async ({ page }) => {
    await page.goto('/');
    
    // 학번 입력 필드 찾기 및 입력
    const input = page.locator('input[type="text"]').first();
    await input.fill('202400001');
    
    // 시작하기 버튼 클릭
    const submitButton = page.locator('button[type="button"]').filter({ hasText: /시작하기|Start/i });
    await submitButton.click();
    
    // 학습 목록 페이지로 이동 확인
    await expect(page).toHaveURL(/\/learn/);
    
    // 레슨 카드가 표시되는지 확인
    await expect(page.locator('h1')).toBeVisible();
  });

  test('유효하지 않은 학번(8자리)으로 에러 표시', async ({ page }) => {
    await page.goto('/');
    
    // 8자리 학번 입력
    const input = page.locator('input[type="text"]').first();
    await input.fill('12345678');
    
    // 시작하기 버튼 클릭 시도
    const submitButton = page.locator('button[type="button"]').filter({ hasText: /시작하기|Start/i });
    
    // 버튼이 비활성화되어 있거나 에러 메시지가 표시되는지 확인
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      await submitButton.click();
      // 에러 메시지 확인
      await expect(page.locator('[role="alert"]')).toBeVisible();
    } else {
      // 버튼이 비활성화되어 있으면 정상 (9자리 미만이므로)
      expect(isDisabled).toBe(true);
    }
  });

  test('9자리 초과 입력 차단', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('input[type="text"]').first();
    await input.fill('1234567890');
    
    // 입력값이 9자리로 제한되는지 확인
    const value = await input.inputValue();
    expect(value.length).toBeLessThanOrEqual(9);
  });

  test('숫자가 아닌 문자 입력 차단', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('input[type="text"]').first();
    await input.fill('12345abcd');
    
    // 숫자만 남아있는지 확인
    const value = await input.inputValue();
    expect(/^\d*$/.test(value)).toBe(true);
  });
});

