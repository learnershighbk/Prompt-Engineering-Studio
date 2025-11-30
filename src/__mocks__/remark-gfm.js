// remark-gfm 모킹 (ESM 모듈 호환성 문제로 테스트 환경에서 사용)
module.exports = function remarkGfm() {
  // remark-gfm 플러그인은 빈 함수로 모킹
  return () => {};
};
