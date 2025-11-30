import { test, expect } from '@playwright/test';

test.describe('언어 전환 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 언어 설정 초기화
    await page.evaluate(() => {
      localStorage.removeItem('prompt-lab-language');
      document.cookie = 'NEXT_LOCALE=; path=/; max-age=0';
    });
  });

  test('기본 언어(한국어) 확인', async ({ page }) => {
    await page.goto('/');
    
    // 한국어 텍스트가 표시되는지 확인
    const koreanText = page.locator('text=/학번|시작하기|Prompt Lab/i').first();
    await expect(koreanText).toBeVisible();
  });

  test('언어 토글 클릭하여 영어로 전환', async ({ page }) => {
    await page.goto('/');
    
    // 언어 토글 버튼 찾기 (ENG 버튼)
    const engButton = page.locator('button').filter({ hasText: /ENG/i }).first();
    
    if (await engButton.count() > 0) {
      await engButton.click();
      
      // 페이지 새로고침 대기
      await page.waitForTimeout(500);
      
      // 영어 텍스트가 표시되는지 확인
      const englishText = page.locator('text=/Student ID|Start|Prompt Lab/i').first();
      await expect(englishText).toBeVisible();
    }
  });

  test('언어 토글 클릭하여 한국어로 전환', async ({ page }) => {
    // 먼저 영어로 설정
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('prompt-lab-language', 'en');
      document.cookie = 'NEXT_LOCALE=en; path=/; max-age=31536000';
    });
    
    await page.reload();
    
    // KOR 버튼 클릭
    const korButton = page.locator('button').filter({ hasText: /KOR/i }).first();
    
    if (await korButton.count() > 0) {
      await korButton.click();
      
      // 페이지 새로고침 대기
      await page.waitForTimeout(500);
      
      // 한국어 텍스트가 표시되는지 확인
      const koreanText = page.locator('text=/학번|시작하기/i').first();
      await expect(koreanText).toBeVisible();
    }
  });

  test('페이지 새로고침 후 언어 설정 유지', async ({ page }) => {
    await page.goto('/');
    
    // 영어로 전환
    const engButton = page.locator('button').filter({ hasText: /ENG/i }).first();
    if (await engButton.count() > 0) {
      await engButton.click();
      await page.waitForTimeout(500);
      
      // 페이지 새로고침
      await page.reload();
      
      // 영어가 유지되는지 확인
      const englishText = page.locator('text=/Student ID|Start/i').first();
      await expect(englishText).toBeVisible();
    }
  });

  test('언어 토글 UI 표시 확인', async ({ page }) => {
    await page.goto('/');
    
    // 언어 토글 컴포넌트가 표시되는지 확인
    const languageToggle = page.locator('[role="radiogroup"], button').filter({ hasText: /KOR|ENG/i }).first();
    await expect(languageToggle).toBeVisible();
  });
});





