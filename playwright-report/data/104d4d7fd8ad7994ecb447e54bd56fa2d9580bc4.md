# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - radiogroup "언어 선택" [ref=e4]:
      - img [ref=e5]
      - radio "KOR" [checked] [ref=e8]
      - radio "ENG" [ref=e9]
    - generic [ref=e11]:
      - generic [ref=e12]:
        - img [ref=e17]
        - generic [ref=e19]:
          - heading "Prompt Lab" [level=1] [ref=e20]
          - paragraph [ref=e21]: 학번 또는 사번을 입력하세요
      - generic [ref=e23]:
        - generic [ref=e24]:
          - textbox "학번 또는 사번을 입력하세요" [ref=e25]:
            - /placeholder: 9자리 숫자 입력
            - text: "202400001"
          - alert [ref=e26]:
            - img [ref=e27]
            - generic [ref=e29]: Request failed with status code 500
        - button "시작하기" [ref=e30]
        - paragraph [ref=e31]: 9/9
      - generic [ref=e32]:
        - img [ref=e33]
        - generic [ref=e35]: AI 기반 프롬프트 엔지니어링 학습
    - paragraph [ref=e37]: © 2025 Prompt Lab. KDI School of Public Policy and Management
  - alert [ref=e38]
```