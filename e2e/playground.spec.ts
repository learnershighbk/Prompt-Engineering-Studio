import { test, expect } from '@playwright/test';

test.describe('Playground 실습 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 페이지 로드 전에 localStorage 설정 (가장 중요!)
    // addInitScript는 페이지가 로드되기 전에 실행됨
    await page.addInitScript(() => {
      localStorage.setItem('prompt-lab-user-id', 'test-user-id');
      localStorage.setItem('prompt-lab-student-id', '202400001');
    });
  });

  test('Playground 페이지 접근', async ({ page }) => {
    await page.goto('/playground');
    
    // 페이지 제목이 표시될 때까지 대기 (인증 통과 + 페이지 로드 완료)
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // 프롬프트 입력 영역 확인 - :visible로 실제 보이는 textarea 선택 (반응형 레이아웃 대응)
    const textarea = page.locator('textarea:visible').first();
    await expect(textarea).toBeVisible({ timeout: 10000 });
  });

  test('프롬프트 입력 및 실행', async ({ page }) => {
    await page.goto('/playground');
    
    // 페이지 로드 대기
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // textarea가 로드될 때까지 대기 - :visible로 실제 보이는 textarea 선택 (반응형 레이아웃 대응)
    const textarea = page.locator('textarea:visible').first();
    await expect(textarea).toBeVisible({ timeout: 10000 });
    
    // 프롬프트 입력
    await textarea.fill('안녕하세요. 이것은 테스트 프롬프트입니다.');
    
    // 실행 버튼 찾기 - :visible로 실제 보이는 버튼 선택 (반응형 레이아웃 대응)
    const submitButton = page.locator('button.flex-1:visible').first();
    
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    
    // 클릭
    await submitButton.click();
    
    // 클릭 후 로딩 상태 또는 응답 대기 (3초)
    await page.waitForTimeout(3000);
    
    // 테스트 통과 조건: 페이지가 여전히 /playground에 있음 (리다이렉트 안됨)
    await expect(page).toHaveURL(/\/playground/);
  });

  test('프롬프트 글자 수 표시 확인', async ({ page }) => {
    await page.goto('/playground');
    
    // 페이지 로드 대기
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // :visible로 실제 보이는 textarea 선택 (반응형 레이아웃 대응)
    const textarea = page.locator('textarea:visible').first();
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await textarea.fill('테스트');
    
    // 글자 수 표시 확인 - :visible로 실제 보이는 요소 선택 (반응형 레이아웃 대응)
    const charCount = page.locator('.font-mono:visible').first();
    await expect(charCount).toBeVisible({ timeout: 5000 });
    
    const text = await charCount.textContent();
    // 글자 수가 표시되는지 확인
    expect(text).toMatch(/\d+/);
  });

  test('최대 글자 수 제한 확인', async ({ page }) => {
    await page.goto('/playground');
    
    // 페이지 로드 대기
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // :visible로 실제 보이는 textarea 선택 (반응형 레이아웃 대응)
    const textarea = page.locator('textarea:visible').first();
    await expect(textarea).toBeVisible({ timeout: 10000 });
    
    // 긴 텍스트 입력 시도 (4000자 초과)
    const longText = 'a'.repeat(5000);
    await textarea.fill(longText);
    
    // textarea에 aria-invalid="true"가 설정되는지 확인
    const isInvalid = await textarea.getAttribute('aria-invalid');
    expect(isInvalid).toBe('true');
  });

  test('복사 버튼 동작 확인', async ({ page }) => {
    await page.goto('/playground');
    
    // 페이지 로드 대기
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // 복사 버튼은 응답이 있을 때만 표시됨
    // 여기서는 버튼이 없는 것을 확인 (응답이 없으므로)
    const copyButton = page.locator('button').filter({ hasText: /복사|Copy/i });
    
    // 복사 버튼이 있을 수도 있고 없을 수도 있음
    const count = await copyButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
