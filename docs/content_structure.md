# Content Structure Specification

## 프로젝트명
Prompt Lab - Prompt Engineering 학습 플랫폼

---

## 1. 개요

### 1.1 대상 학습자
| 프로그램 | 주요 활용 분야 |
|----------|---------------|
| MPP (공공정책학 석사) | 정책 분석, 정책 평가, 공공재정 분석 |
| MDP (개발정책학 석사) | ODA 효과성, SDGs 분석, 개발 사례 연구 |
| MPM (공공관리학 석사) | 조직 분석, 거버넌스, 행정개혁 사례 |
| DS&PM (데이터사이언스·정책관리 석사) | 데이터 해석, 증거기반정책, 정량분석 |

### 1.2 학습 단원 목록
| 순서 | slug | 한국어 제목 | 영어 제목 | 예상 시간 | 정책학 활용 |
|------|------|-------------|-----------|-----------|------------|
| 1 | `intro` | Prompt Engineering 개요 | Introduction to Prompt Engineering | 10분 | 정책 분석 도구로서의 AI |
| 2 | `zero-shot` | Zero-shot Prompting | Zero-shot Prompting | 15분 + 실습 | 정책 요약, 이해관계자 분석 |
| 3 | `few-shot` | Few-shot Prompting | Few-shot Prompting | 15분 + 실습 | 정책 사례 비교, 표준화된 분석 |
| 4 | `chain-of-thought` | Chain of Thought | Chain of Thought | 15분 + 실습 | 정책 효과 추론, 인과관계 분석 |

### 1.2 콘텐츠 파일 구조
```
data/
└── lessons/
    ├── ko/
    │   ├── intro.json
    │   ├── zero-shot.json
    │   ├── few-shot.json
    │   └── chain-of-thought.json
    └── en/
        ├── intro.json
        ├── zero-shot.json
        ├── few-shot.json
        └── chain-of-thought.json
```

---

## 2. 콘텐츠 데이터 타입

### 2.1 TypeScript 정의
```typescript
// src/types/lesson.ts

export interface Lesson {
  slug: string
  title: string
  description: string
  duration: string
  order: number
  content: string           // Markdown 형식
  examples: Example[]
  practice: Practice
}

export interface Example {
  title: string
  description: string
  prompt: string
  expectedBehavior?: string  // 예상 동작 설명
}

export interface Practice {
  instruction: string
  starterPrompt: string
  hints?: string[]
}

export interface LessonMeta {
  slug: string
  title: string
  description: string
  duration: string
  order: number
}
```

---

## 3. 단원별 콘텐츠 상세

### 3.1 Prompt Engineering 개요 (intro)

#### 한국어 (`data/lessons/ko/intro.json`)
```json
{
  "slug": "intro",
  "title": "Prompt Engineering 개요",
  "description": "Prompt Engineering의 정의와 정책 연구에서의 중요성, 기본 원칙을 학습합니다.",
  "duration": "10분",
  "order": 1,
  "content": "## Prompt Engineering이란?\n\nPrompt Engineering은 AI 모델에게 원하는 결과를 얻기 위해 **효과적인 입력(프롬프트)을 설계하는 기술**입니다.\n\n### 왜 정책학도에게 중요한가요?\n\n같은 AI 모델이라도 프롬프트를 어떻게 작성하느냐에 따라 정책 분석의 품질이 크게 달라집니다.\n\n**나쁜 예시:**\n```\n저출산 정책 분석해줘\n```\n\n**좋은 예시:**\n```\n한국의 저출산 대응 정책 중 '육아휴직 급여 인상'에 대해\nBardach의 8단계 정책분석 프레임워크를 적용하여 분석해주세요.\n정책 목표, 대안, 예상 효과를 포함해주세요.\n대상 독자는 정책학 석사과정 학생입니다.\n```\n\n### 정책 연구에서 AI 활용\n\n- **문헌 검토 효율화**: 대량의 정책 문서 요약 및 핵심 논점 추출\n- **정책 브리핑 작성**: 구조화된 정책 보고서 초안 작성\n- **이해관계자 분석**: 다양한 관점에서의 정책 영향 분석\n- **비교 정책 분석**: 국가별/시기별 정책 비교\n\n### 좋은 프롬프트의 3가지 원칙\n\n1. **명확성 (Clarity)**: 분석 대상, 범위, 관점을 구체적으로 표현\n2. **맥락 (Context)**: 이론적 프레임워크, 배경 정보 제공\n3. **형식 (Format)**: 원하는 출력 형태 명시 (표, 개조식, 에세이 등)\n\n### 이 과정에서 배울 내용\n\n- **Zero-shot Prompting**: 정책 요약, 개념 설명에 활용\n- **Few-shot Prompting**: 일관된 형식의 정책 사례 분석\n- **Chain of Thought**: 복잡한 정책 효과 추론 및 인과관계 분석",
  "examples": [
    {
      "title": "정책 브리핑 작성",
      "description": "구체적인 요구사항을 제시하여 정책 브리핑을 작성하는 예시입니다.",
      "prompt": "다음 요구사항에 맞춰 정책 브리핑을 작성해주세요:\n\n- 정책: 한국의 그린뉴딜 정책 (2020)\n- 구조: 배경, 목표, 핵심 과제, 쟁점, 평가\n- 분량: 각 항목 2-3문장\n- 대상 독자: 정책학 석사과정 학생\n- 톤: 객관적이고 분석적인",
      "expectedBehavior": "명확한 요구사항을 제시하면 AI가 구조화된 정책 브리핑을 작성합니다."
    }
  ],
  "practice": {
    "instruction": "아래 간단한 프롬프트를 정책 분석에 적합하게 개선해보세요.",
    "starterPrompt": "ODA 효과성 분석해줘",
    "hints": [
      "어떤 국가 또는 지역의 ODA인가요?",
      "어떤 분야(교육, 보건, 인프라)의 ODA인가요?",
      "어떤 분석 프레임워크를 적용할까요?",
      "누구를 위한 분석인가요? (학술 논문, 정책 브리핑, 발표)"
    ]
  }
}
```

#### 영어 (`data/lessons/en/intro.json`)
```json
{
  "slug": "intro",
  "title": "Introduction to Prompt Engineering",
  "description": "Learn the definition, importance in policy research, and basic principles of Prompt Engineering.",
  "duration": "10 min",
  "order": 1,
  "content": "## What is Prompt Engineering?\n\nPrompt Engineering is the skill of **designing effective inputs (prompts) to get desired results from AI models**.\n\n### Why is it important for policy students?\n\nEven with the same AI model, the quality of policy analysis varies significantly depending on how you write the prompt.\n\n**Bad example:**\n```\nAnalyze climate policy\n```\n\n**Good example:**\n```\nAnalyze the European Union's Carbon Border Adjustment Mechanism (CBAM)\nusing Kingdon's Multiple Streams Framework.\nInclude: problem stream, policy stream, political stream, and policy window.\nTarget audience: Master's students in public policy.\n```\n\n### AI Applications in Policy Research\n\n- **Literature Review**: Summarizing policy documents and extracting key arguments\n- **Policy Briefs**: Drafting structured policy reports\n- **Stakeholder Analysis**: Analyzing policy impacts from multiple perspectives\n- **Comparative Policy Analysis**: Cross-country and temporal policy comparisons\n\n### 3 Principles of Good Prompts\n\n1. **Clarity**: Specify analysis target, scope, and perspective\n2. **Context**: Provide theoretical frameworks and background information\n3. **Format**: Specify desired output format (table, bullet points, essay, etc.)\n\n### What You'll Learn\n\n- **Zero-shot Prompting**: Policy summaries, concept explanations\n- **Few-shot Prompting**: Consistent format for policy case analysis\n- **Chain of Thought**: Complex policy effect reasoning and causal analysis",
  "examples": [
    {
      "title": "Policy Brief Writing",
      "description": "An example of writing a policy brief with specific requirements.",
      "prompt": "Please write a policy brief according to the following requirements:\n\n- Policy: EU Green Deal (2019)\n- Structure: Background, Objectives, Key Initiatives, Challenges, Assessment\n- Length: 2-3 sentences per section\n- Target audience: Master's students in development policy\n- Tone: Objective and analytical",
      "expectedBehavior": "With clear requirements, AI writes a structured policy brief."
    }
  ],
  "practice": {
    "instruction": "Improve the simple prompt below to make it suitable for policy analysis.",
    "starterPrompt": "Analyze ODA effectiveness",
    "hints": [
      "Which country or region's ODA?",
      "Which sector (education, health, infrastructure)?",
      "What analytical framework to apply?",
      "Who is the analysis for? (academic paper, policy brief, presentation)"
    ]
  }
}
```

---

### 3.2 Zero-shot Prompting

#### 한국어 (`data/lessons/ko/zero-shot.json`)
```json
{
  "slug": "zero-shot",
  "title": "Zero-shot Prompting",
  "description": "예시 없이 지시만으로 AI에게 정책 분석 작업을 요청하는 방법을 학습합니다.",
  "duration": "15분",
  "order": 2,
  "content": "## Zero-shot Prompting이란?\n\nZero-shot Prompting은 **예시를 제공하지 않고** 작업 지시만으로 AI에게 원하는 결과를 요청하는 방법입니다.\n\n\"Zero-shot\"은 \"0개의 예시\"라는 의미입니다.\n\n### 정책 연구에서 언제 사용하나요?\n\n- 정책 문서 요약 및 핵심 논점 추출\n- 정책 개념 정의 및 설명 요청\n- 이해관계자 목록 및 입장 분석\n- 정책 용어 해설\n- SWOT, PEST 등 기본 프레임워크 적용\n\n### 정책 분석 예시\n\n**정책 요약:**\n```\n다음 OECD 보고서의 핵심 내용을 3가지 bullet point로 요약해주세요.\n대상 독자는 한국 기획재정부 공무원입니다.\n\n[보고서 내용]\n```\n\n**이해관계자 분석:**\n```\n한국의 '국민연금 개혁'에 대한 주요 이해관계자를 분석해주세요.\n\n다음 형식으로 작성:\n| 이해관계자 | 입장 | 주요 관심사 | 영향력 |\n```\n\n**개발지표 해석:**\n```\n베트남의 HDI(인간개발지수) 변화를 해석하고\n정책적 시사점을 도출해주세요.\n- HDI: 0.703 (2021) → 0.726 (2023)\n```\n\n### 효과적인 Zero-shot 프롬프트 작성법\n\n1. **분석 대상 명확히 지정**: 어떤 정책, 어떤 국가, 어떤 시기\n2. **출력 형식 구체화**: 표, bullet point, 에세이 형식\n3. **대상 독자 명시**: 정책입안자, 연구자, 학생\n4. **분량 제한 설정**: 문장 수, 단어 수 지정\n\n### 한계\n\n- 복잡한 다단계 분석에는 부적합\n- 일관된 형식의 반복 작업에는 Few-shot이 효과적\n- 특정 분석 프레임워크 적용 시 예시 필요할 수 있음",
  "examples": [
    {
      "title": "정책 이해관계자 분석",
      "description": "정책 분석의 핵심인 이해관계자 분석을 Zero-shot으로 수행하는 예시입니다.",
      "prompt": "한국의 '국민연금 개혁'에 대한 주요 이해관계자를 분석해주세요.\n\n다음 형식으로 작성:\n| 이해관계자 | 입장 | 주요 관심사 | 영향력 |\n\n최소 5개 이해관계자 그룹을 포함해주세요.",
      "expectedBehavior": "AI가 정부, 노동계, 경영계, 시민단체, 청년세대 등 다양한 이해관계자의 입장을 표 형식으로 분석합니다."
    },
    {
      "title": "개발지표 해석",
      "description": "국제개발 관련 지표를 해석하고 정책적 시사점을 도출하는 예시입니다.",
      "prompt": "다음 국가의 HDI(인간개발지수) 데이터를 해석하고,\n정책적 시사점을 도출해주세요.\n\n- 국가: 베트남\n- HDI: 0.703 (2021) → 0.726 (2023)\n- 구성요소: 기대수명 75.4세, 평균교육연수 8.2년, 1인당 GNI $8,660\n\nUNDP의 HDI 분류 기준을 참고하여 분석해주세요.",
      "expectedBehavior": "AI가 HDI 변화의 의미, 각 구성요소의 기여도, 향후 정책 방향을 분석합니다."
    }
  ],
  "practice": {
    "instruction": "아래 Zero-shot 프롬프트를 개선하여 더 유용한 정책 분석 결과를 얻어보세요.",
    "starterPrompt": "기후변화 정책 설명해줘",
    "hints": [
      "어떤 국가 또는 지역의 정책인가요?",
      "어떤 측면(완화/적응/재정)에 초점을 맞출까요?",
      "누구를 위한 설명인가요? (정책입안자, 연구자, 일반시민)",
      "어떤 형식으로 받고 싶나요? (개요, 비교표, 상세 분석)"
    ]
  }
}
```

#### 영어 (`data/lessons/en/zero-shot.json`)
```json
{
  "slug": "zero-shot",
  "title": "Zero-shot Prompting",
  "description": "Learn how to request policy analysis tasks from AI with instructions only, without providing examples.",
  "duration": "15 min",
  "order": 2,
  "content": "## What is Zero-shot Prompting?\n\nZero-shot Prompting is a method of requesting desired results from AI **without providing examples**, using only task instructions.\n\n\"Zero-shot\" means \"zero examples.\"\n\n### When to use it in policy research?\n\n- Summarizing policy documents and extracting key arguments\n- Defining and explaining policy concepts\n- Stakeholder listing and position analysis\n- Policy terminology explanation\n- Applying basic frameworks (SWOT, PEST, etc.)\n\n### Policy Analysis Examples\n\n**Policy Summary:**\n```\nSummarize the key points of this World Bank report in 3 bullet points.\nTarget audience: Policy analysts at the Ministry of Finance.\n\n[Report content]\n```\n\n**Stakeholder Analysis:**\n```\nAnalyze the key stakeholders for 'Universal Basic Income' policy.\n\nFormat as:\n| Stakeholder | Position | Key Concerns | Influence |\n```\n\n**Development Indicator Interpretation:**\n```\nInterpret the HDI changes for Rwanda and\nderive policy implications.\n- HDI: 0.534 (2021) → 0.548 (2023)\n```\n\n### How to Write Effective Zero-shot Prompts\n\n1. **Specify analysis target clearly**: Which policy, country, time period\n2. **Define output format**: Table, bullet points, essay format\n3. **State target audience**: Policymakers, researchers, students\n4. **Set length constraints**: Number of sentences, words\n\n### Limitations\n\n- Not suitable for complex multi-step analysis\n- Few-shot is more effective for consistent format repetitive tasks\n- May need examples when applying specific analytical frameworks",
  "examples": [
    {
      "title": "Policy Stakeholder Analysis",
      "description": "A Zero-shot example performing stakeholder analysis, a core element of policy analysis.",
      "prompt": "Analyze the key stakeholders for the 'Carbon Border Adjustment Mechanism (CBAM)' in the EU.\n\nFormat as:\n| Stakeholder | Position | Key Concerns | Influence Level |\n\nInclude at least 5 stakeholder groups.",
      "expectedBehavior": "AI analyzes various stakeholders including EU industries, trading partners, environmental groups, and consumers in table format."
    },
    {
      "title": "Development Indicator Interpretation",
      "description": "An example of interpreting international development indicators and deriving policy implications.",
      "prompt": "Interpret the following country's HDI (Human Development Index) data and\nderive policy implications.\n\n- Country: Rwanda\n- HDI: 0.534 (2021) → 0.548 (2023)\n- Components: Life expectancy 66.1 years, Mean years of schooling 4.4, GNI per capita $2,210\n\nPlease reference UNDP's HDI classification criteria in your analysis.",
      "expectedBehavior": "AI analyzes the meaning of HDI changes, contribution of each component, and future policy directions."
    }
  ],
  "practice": {
    "instruction": "Improve the Zero-shot prompt below to get more useful policy analysis results.",
    "starterPrompt": "Explain SDG progress",
    "hints": [
      "Which SDG goal specifically?",
      "Which country or region?",
      "What time period for comparison?",
      "What format do you want? (overview, comparison table, detailed analysis)"
    ]
  }
}
```

---

### 3.3 Few-shot Prompting

#### 한국어 (`data/lessons/ko/few-shot.json`)
```json
{
  "slug": "few-shot",
  "title": "Few-shot Prompting",
  "description": "몇 가지 예시를 통해 AI에게 일관된 정책 분석 패턴을 학습시키는 방법을 배웁니다.",
  "duration": "15분",
  "order": 3,
  "content": "## Few-shot Prompting이란?\n\nFew-shot Prompting은 **몇 가지 예시를 함께 제공**하여 AI가 원하는 패턴을 학습하도록 유도하는 방법입니다.\n\n\"Few-shot\"은 \"적은 수의 예시\"라는 의미입니다.\n\n### Zero-shot vs Few-shot\n\n| 구분 | Zero-shot | Few-shot |\n|------|-----------|----------|\n| 예시 | 없음 | 2~5개 제공 |\n| 적합한 상황 | 단순 요약, 개념 설명 | 정책 사례 비교, 일관된 형식 분석 |\n| 정책 활용 | 이해관계자 분석 | 여러 국가 정책 비교 분석 |\n\n### 정책 연구에서 언제 사용하나요?\n\n- 여러 국가의 정책을 **동일한 기준**으로 비교\n- 정책 문서를 **일관된 형식**으로 요약\n- 정책 성공/실패 사례 **분류 및 분석**\n- 연구 논문 초록을 **표준화된 구조**로 정리\n\n### Few-shot 프롬프트 구조\n\n```\n[작업 설명]\n\n예시 1:\n정책: [정책 A]\n분석: [분석 결과 A]\n\n예시 2:\n정책: [정책 B]\n분석: [분석 결과 B]\n\n실제 작업:\n정책: [분석할 정책]\n분석:\n```\n\n### 좋은 예시 선택 팁\n\n1. **다양성**: 선진국/개발도상국, 성공/실패 사례 포함\n2. **대표성**: 전형적인 정책 사례 선택\n3. **일관성**: 동일한 분석 프레임워크 유지\n4. **적절한 수**: 2-5개가 적당 (너무 많으면 혼란)\n\n### 주의사항\n\n- 예시의 품질이 분석 품질을 결정\n- 편향된 예시는 편향된 분석 유발\n- 정책 맥락이 다른 예시는 혼란 야기",
  "examples": [
    {
      "title": "정책 사례 분류 (성공/실패 요인)",
      "description": "예시를 통해 정책 성공/실패 분석 패턴을 학습시키는 예시입니다.",
      "prompt": "다음 정책 사례들을 분석하고, 새로운 사례도 같은 형식으로 분석해주세요.\n\n예시 1:\n정책: 르완다 의료보험 개혁 (Mutuelles de Santé)\n결과: 성공\n핵심 요인: 강력한 정치적 의지, 커뮤니티 기반 접근, 단계적 확대\n교훈: 지역사회 참여가 보편적 의료보장의 핵심\n\n예시 2:\n정책: 베네수엘라 가격통제 정책 (2003-2013)\n결과: 실패\n핵심 요인: 시장 왜곡, 공급 부족 초래, 암시장 형성\n교훈: 가격통제는 공급측 인센티브를 고려해야 함\n\n분석할 정책:\n정책: 인도네시아 연료보조금 개혁 (2015)\n결과:\n핵심 요인:\n교훈:",
      "expectedBehavior": "예시 패턴을 학습하여 인도네시아 사례를 동일한 구조로 분석합니다."
    },
    {
      "title": "정책 브리핑 표준화",
      "description": "일관된 형식으로 정책 브리핑을 작성하는 Few-shot 예시입니다.",
      "prompt": "다음 형식에 맞춰 정책 브리핑을 작성해주세요.\n\n예시:\n정책명: 한국 그린뉴딜 (2020)\n---\n[배경] 코로나19 경제위기 + 기후변화 대응 필요성\n[목표] 2025년까지 73.4조원 투자, 일자리 65.9만개 창출\n[핵심 과제] ①그린 리모델링 ②그린 에너지 ③그린 모빌리티\n[쟁점] 재원 조달 방안, 기존 산업 전환 지원\n[평가] OECD 그린회복 평가에서 긍정적 평가\n---\n\n작성할 정책: EU 탄소국경조정메커니즘 (CBAM)",
      "expectedBehavior": "동일한 형식으로 CBAM 정책을 구조화하여 분석합니다."
    }
  ],
  "practice": {
    "instruction": "Few-shot 프롬프트를 작성하여 SDGs 관련 국가별 정책을 비교 분석해보세요.",
    "starterPrompt": "다음 형식으로 국가별 SDG 4(양질의 교육) 정책을 분석해주세요.\n\n예시:\n국가: 핀란드\n정책: 무상 공교육 및 교사 전문성 강화\n접근법: 평등 중심, 표준화 시험 최소화\n성과: PISA 상위권 유지, 교육 형평성 높음\n\n분석할 국가: 싱가포르\n정책:\n접근법:\n성과:",
    "hints": [
      "예시를 하나 더 추가하면 어떨까요? (예: 한국)",
      "분석 항목을 더 구체화할 수 있나요? (예: 예산, 도전과제)",
      "개발도상국 사례도 포함해보세요.",
      "성과 지표를 구체적으로 명시해보세요."
    ]
  }
}
```

#### 영어 (`data/lessons/en/few-shot.json`)
```json
{
  "slug": "few-shot",
  "title": "Few-shot Prompting",
  "description": "Learn how to teach AI consistent policy analysis patterns through a few examples.",
  "duration": "15 min",
  "order": 3,
  "content": "## What is Few-shot Prompting?\n\nFew-shot Prompting is a method that **provides a few examples** to guide AI to learn desired patterns.\n\n\"Few-shot\" means \"a small number of examples.\"\n\n### Zero-shot vs Few-shot\n\n| Type | Zero-shot | Few-shot |\n|------|-----------|----------|\n| Examples | None | 2-5 provided |\n| Best for | Simple summaries, concept explanation | Policy case comparison, consistent format analysis |\n| Policy use | Stakeholder analysis | Multi-country policy comparison |\n\n### When to use it in policy research?\n\n- Comparing policies across countries with **consistent criteria**\n- Summarizing policy documents in **uniform format**\n- **Classifying and analyzing** policy success/failure cases\n- Organizing research abstracts in **standardized structure**\n\n### Few-shot Prompt Structure\n\n```\n[Task description]\n\nExample 1:\nPolicy: [Policy A]\nAnalysis: [Analysis Result A]\n\nExample 2:\nPolicy: [Policy B]\nAnalysis: [Analysis Result B]\n\nActual task:\nPolicy: [Policy to analyze]\nAnalysis:\n```\n\n### Tips for Choosing Good Examples\n\n1. **Diversity**: Include developed/developing countries, success/failure cases\n2. **Representativeness**: Choose typical policy cases\n3. **Consistency**: Maintain the same analytical framework\n4. **Right amount**: 2-5 is appropriate (too many causes confusion)\n\n### Cautions\n\n- Example quality determines analysis quality\n- Biased examples lead to biased analysis\n- Examples from different policy contexts cause confusion",
  "examples": [
    {
      "title": "Policy Case Classification (Success/Failure Factors)",
      "description": "An example of teaching policy success/failure analysis patterns through examples.",
      "prompt": "Analyze the following policy cases and analyze the new case in the same format.\n\nExample 1:\nPolicy: Rwanda Health Insurance Reform (Mutuelles de Santé)\nResult: Success\nKey Factors: Strong political will, community-based approach, phased expansion\nLesson: Community participation is key to universal health coverage\n\nExample 2:\nPolicy: Venezuela Price Control Policy (2003-2013)\nResult: Failure\nKey Factors: Market distortion, supply shortages, black market formation\nLesson: Price controls must consider supply-side incentives\n\nPolicy to analyze:\nPolicy: Brazil's Bolsa Família Program\nResult:\nKey Factors:\nLesson:",
      "expectedBehavior": "Learns from example patterns and analyzes the Brazil case in the same structure."
    },
    {
      "title": "Standardized Policy Brief",
      "description": "A Few-shot example for writing policy briefs in consistent format.",
      "prompt": "Write a policy brief following this format.\n\nExample:\nPolicy: EU Green Deal (2019)\n---\n[Background] Climate emergency + Economic transformation need\n[Objective] Climate neutrality by 2050, €1 trillion investment\n[Key Initiatives] ①Clean energy ②Sustainable industry ③Building renovation\n[Challenges] Just transition, financing gap, member state alignment\n[Assessment] Ambitious but implementation challenges remain\n---\n\nPolicy to write: China's Belt and Road Initiative (BRI)",
      "expectedBehavior": "Structures and analyzes BRI policy in the same format."
    }
  ],
  "practice": {
    "instruction": "Write a Few-shot prompt to compare and analyze country-level SDG policies.",
    "starterPrompt": "Analyze SDG 4 (Quality Education) policies by country in the following format.\n\nExample:\nCountry: Finland\nPolicy: Free public education and teacher professionalization\nApproach: Equity-focused, minimal standardized testing\nOutcome: Top PISA rankings, high educational equity\n\nCountry to analyze: South Korea\nPolicy:\nApproach:\nOutcome:",
    "hints": [
      "What if you add one more example? (e.g., Singapore)",
      "Can you add more analysis items? (e.g., budget, challenges)",
      "Include a developing country case.",
      "Specify concrete outcome indicators."
    ]
  }
}
```

---

### 3.4 Chain of Thought

#### 한국어 (`data/lessons/ko/chain-of-thought.json`)
```json
{
  "slug": "chain-of-thought",
  "title": "Chain of Thought (CoT)",
  "description": "단계별 추론을 유도하여 복잡한 정책 효과를 분석하는 방법을 학습합니다.",
  "duration": "15분",
  "order": 4,
  "content": "## Chain of Thought (CoT)란?\n\nChain of Thought는 AI에게 **단계별로 사고 과정을 설명하도록 유도**하여 복잡한 정책 문제를 분석하는 기법입니다.\n\n\"사고의 연쇄\"라는 의미로, 중간 추론 과정을 명시적으로 생성하게 합니다.\n\n### 왜 정책 분석에 효과적인가요?\n\n- 정책 효과의 **인과관계 추적**\n- 다중 이해관계자의 **반응 예측**\n- **의도하지 않은 결과**(unintended consequences) 식별\n- 논리적 오류 감소 및 **검증 가능**\n- 복잡한 정책 문제를 **작은 단계로 분해**\n\n### 기본 사용법\n\n**방법 1: 직접 요청**\n```\n이 정책의 효과를 단계별로 분석해주세요.\n```\n\n**방법 2: \"Let's think step by step\" 추가**\n```\n최저임금 인상이 고용에 미치는 영향을 분석해주세요.\nLet's think step by step.\n```\n\n**방법 3: 분석 단계 명시**\n```\n다음 단계에 따라 분석해주세요:\n1단계: 정책의 직접적 효과 식별\n2단계: 이해관계자별 반응 예측\n3단계: 2차 효과 및 파급효과 분석\n4단계: 장기적 균형 상태 추론\n5단계: 종합 평가 및 정책 제언\n```\n\n### Zero-shot CoT vs Few-shot CoT\n\n| 구분 | Zero-shot CoT | Few-shot CoT |\n|------|---------------|---------------|\n| 방법 | \"단계별로\" 키워드 추가 | 추론 과정 예시 제공 |\n| 간편성 | 매우 간단 | 예시 작성 필요 |\n| 적합한 상황 | 일반적인 정책 분석 | 특정 분석 프레임워크 적용 |\n\n### 정책 분야 적용\n\n- **정책 효과 추론**: 인과관계 사슬 분석\n- **비용-편익 분석**: 단계별 비용/편익 항목 도출\n- **이해관계자 분석**: 각 그룹의 반응 순차적 예측\n- **시나리오 분석**: 조건별 결과 추론\n- **정책 대안 평가**: 기준별 체계적 비교",
  "examples": [
    {
      "title": "정책 효과 인과관계 분석 (Zero-shot CoT)",
      "description": "\"단계별로\" 키워드를 추가하여 정책 효과의 인과관계를 분석하는 예시입니다.",
      "prompt": "한국 정부가 '주 52시간 근무제'를 도입했을 때 예상되는 효과를\n단계별로 분석해주세요.\n\n다음 관점을 포함해주세요:\n- 근로자 측면\n- 기업 측면\n- 거시경제 측면\n- 사회문화적 측면\n\n각 단계에서의 인과관계를 명확히 설명하고,\n의도하지 않은 결과(unintended consequences)도 고려해주세요.\n\nLet's think step by step.",
      "expectedBehavior": "AI가 근로시간 단축 → 여가시간 증가 → 소비 패턴 변화 등 인과관계를 단계별로 분석합니다."
    },
    {
      "title": "정책 대안 비교 분석 (Few-shot CoT)",
      "description": "예시를 통해 정책 대안을 단계별로 비교 분석하는 방식입니다.",
      "prompt": "다음 예시처럼 정책 대안을 단계별로 비교 분석해주세요.\n\n예시:\n문제: 대도시 교통 혼잡\n대안: 혼잡통행료 도입\n\n분석:\n1단계 (직접 효과): 통행료 부과 → 승용차 이용 비용 증가\n2단계 (행동 변화): 일부 운전자 대중교통 전환, 출퇴근 시간 조정\n3단계 (시스템 효과): 혼잡 감소, 통행 속도 향상, 대중교통 수요 증가\n4단계 (2차 효과): 대중교통 혼잡 증가 가능, 형평성 이슈 제기\n5단계 (장기 효과): 도시 구조 변화, 직주근접 촉진 가능\n\n종합 평가: 효과성 높으나 형평성 보완 필요\n\n---\n분석할 정책:\n문제: 개발도상국 농촌 빈곤\n대안: 조건부 현금이전 프로그램 (CCT)\n\n분석:",
      "expectedBehavior": "예시와 같은 형식으로 CCT 정책의 효과를 5단계로 분석합니다."
    }
  ],
  "practice": {
    "instruction": "Chain of Thought를 활용하여 복잡한 정책 문제를 분석해보세요.",
    "starterPrompt": "한 개발도상국이 '보편적 기본소득(UBI)'을 도입하려 합니다.\n이 정책의 예상 효과를 단계별로 분석해주세요.\n\n고려할 조건:\n- 국가: 인구 5천만, 1인당 GDP $3,000, 비공식 경제 비중 40%\n- 제안된 UBI: 월 $50 (빈곤선의 약 50%)\n- 재원: 기존 복지 프로그램 통합 + 부유세\n\nLet's think step by step.",
    "hints": [
      "재정적 지속가능성은 어떻게 분석할 수 있을까요?",
      "노동 공급에 미치는 영향의 인과관계는?",
      "비공식 경제와의 상호작용은?",
      "정치경제학적 관점(political economy)도 고려해보세요."
    ]
  }
}
```

#### 영어 (`data/lessons/en/chain-of-thought.json`)
```json
{
  "slug": "chain-of-thought",
  "title": "Chain of Thought (CoT)",
  "description": "Learn how to analyze complex policy effects by inducing step-by-step reasoning.",
  "duration": "15 min",
  "order": 4,
  "content": "## What is Chain of Thought (CoT)?\n\nChain of Thought is a technique that **guides AI to explain its thinking process step by step** to analyze complex policy problems.\n\nIt means \"chain of reasoning,\" making the AI explicitly generate intermediate reasoning steps.\n\n### Why is it effective for policy analysis?\n\n- **Tracing causal relationships** of policy effects\n- **Predicting reactions** of multiple stakeholders\n- Identifying **unintended consequences**\n- Reducing logical errors and **enabling verification**\n- **Breaking down** complex policy problems into smaller steps\n\n### Basic Usage\n\n**Method 1: Direct request**\n```\nPlease analyze the effects of this policy step by step.\n```\n\n**Method 2: Add \"Let's think step by step\"**\n```\nAnalyze the impact of minimum wage increase on employment.\nLet's think step by step.\n```\n\n**Method 3: Specify analysis steps**\n```\nPlease analyze according to these steps:\nStep 1: Identify direct policy effects\nStep 2: Predict stakeholder reactions\nStep 3: Analyze secondary and ripple effects\nStep 4: Infer long-term equilibrium\nStep 5: Comprehensive evaluation and recommendations\n```\n\n### Zero-shot CoT vs Few-shot CoT\n\n| Type | Zero-shot CoT | Few-shot CoT |\n|------|---------------|---------------|\n| Method | Add \"step by step\" keyword | Provide reasoning examples |\n| Simplicity | Very simple | Requires writing examples |\n| Best for | General policy analysis | Specific analytical frameworks |\n\n### Policy Applications\n\n- **Policy effect reasoning**: Causal chain analysis\n- **Cost-benefit analysis**: Step-by-step cost/benefit identification\n- **Stakeholder analysis**: Sequential prediction of group reactions\n- **Scenario analysis**: Conditional outcome reasoning\n- **Policy alternative evaluation**: Systematic criteria-based comparison",
  "examples": [
    {
      "title": "Policy Effect Causal Analysis (Zero-shot CoT)",
      "description": "An example of analyzing policy effect causality by adding \"step by step\" keyword.",
      "prompt": "Analyze the expected effects of the EU implementing\n'Carbon Border Adjustment Mechanism (CBAM)' step by step.\n\nInclude these perspectives:\n- EU industries\n- Trading partner countries\n- Global trade system\n- Climate goals\n\nClearly explain the causal relationships at each step,\nand consider unintended consequences.\n\nLet's think step by step.",
      "expectedBehavior": "AI analyzes causal relationships step by step: carbon pricing → import cost changes → trade pattern shifts, etc."
    },
    {
      "title": "Policy Alternative Comparison (Few-shot CoT)",
      "description": "Showing how to compare policy alternatives step by step through an example.",
      "prompt": "Compare policy alternatives step by step as in the following example.\n\nExample:\nProblem: Urban traffic congestion\nAlternative: Congestion pricing\n\nAnalysis:\nStep 1 (Direct effect): Toll charges → Increased car usage cost\nStep 2 (Behavioral change): Some drivers switch to public transit, adjust commute times\nStep 3 (System effect): Reduced congestion, improved travel speed, increased public transit demand\nStep 4 (Secondary effect): Possible public transit crowding, equity concerns raised\nStep 5 (Long-term effect): Urban structure changes, possible live-work proximity\n\nOverall evaluation: High effectiveness but equity measures needed\n\n---\nPolicy to analyze:\nProblem: Rural poverty in developing countries\nAlternative: Conditional Cash Transfer (CCT) program\n\nAnalysis:",
      "expectedBehavior": "Analyzes CCT policy effects in 5 steps following the example format."
    }
  ],
  "practice": {
    "instruction": "Use Chain of Thought to analyze a complex policy problem.",
    "starterPrompt": "A developing country is considering implementing 'Universal Basic Income (UBI)'.\nAnalyze the expected effects of this policy step by step.\n\nConditions to consider:\n- Country: Population 50 million, GDP per capita $3,000, informal economy 40%\n- Proposed UBI: $50/month (about 50% of poverty line)\n- Funding: Consolidating existing welfare programs + wealth tax\n\nLet's think step by step.",
    "hints": [
      "How would you analyze fiscal sustainability?",
      "What's the causal chain for labor supply effects?",
      "How does it interact with the informal economy?",
      "Consider political economy perspectives as well."
    ]
  }
}
```

---

## 4. 콘텐츠 로딩 유틸리티

### 4.1 콘텐츠 로더
```typescript
// src/lib/lessons.ts
import { Lesson, LessonMeta } from '@/types/lesson'

const LESSONS_ORDER = ['intro', 'zero-shot', 'few-shot', 'chain-of-thought']

export async function getLesson(slug: string, language: 'ko' | 'en'): Promise<Lesson | null> {
  try {
    const lesson = await import(`@/data/lessons/${language}/${slug}.json`)
    return lesson.default as Lesson
  } catch {
    return null
  }
}

export async function getAllLessons(language: 'ko' | 'en'): Promise<LessonMeta[]> {
  const lessons: LessonMeta[] = []
  
  for (const slug of LESSONS_ORDER) {
    const lesson = await getLesson(slug, language)
    if (lesson) {
      lessons.push({
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        order: lesson.order
      })
    }
  }
  
  return lessons.sort((a, b) => a.order - b.order)
}

export function getNextLesson(currentSlug: string): string | null {
  const currentIndex = LESSONS_ORDER.indexOf(currentSlug)
  if (currentIndex === -1 || currentIndex === LESSONS_ORDER.length - 1) {
    return null
  }
  return LESSONS_ORDER[currentIndex + 1]
}

export function getPreviousLesson(currentSlug: string): string | null {
  const currentIndex = LESSONS_ORDER.indexOf(currentSlug)
  if (currentIndex <= 0) {
    return null
  }
  return LESSONS_ORDER[currentIndex - 1]
}
```

---

## 5. UI 메시지 (i18n)

### 5.1 한국어 (`src/messages/ko.json`)
```json
{
  "common": {
    "appName": "Prompt Lab",
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "retry": "다시 시도"
  },
  "login": {
    "title": "학번 또는 사번을 입력하세요",
    "placeholder": "9자리 숫자 입력",
    "submit": "시작하기",
    "error": "학번 또는 사번은 9자리 숫자입니다"
  },
  "learn": {
    "title": "학습 목록",
    "progress": "{completed}/{total} 완료",
    "completed": "완료",
    "start": "학습 시작",
    "continue": "이어서 학습"
  },
  "lesson": {
    "practice": "실습",
    "content": "학습 내용",
    "examples": "예제",
    "tryIt": "직접 해보기",
    "markComplete": "완료로 표시",
    "completed": "완료됨",
    "previous": "이전 단원",
    "next": "다음 단원",
    "backToList": "목록으로"
  },
  "playground": {
    "title": "Playground",
    "description": "자유롭게 프롬프트를 실험해보세요",
    "placeholder": "프롬프트를 입력하세요...",
    "submit": "실행",
    "clear": "초기화",
    "copy": "복사",
    "copied": "복사됨!",
    "charCount": "{count}/4000자",
    "response": "AI 응답",
    "waiting": "AI가 응답을 생성하고 있습니다..."
  },
  "header": {
    "playground": "Playground",
    "language": "언어"
  }
}
```

### 5.2 영어 (`src/messages/en.json`)
```json
{
  "common": {
    "appName": "Prompt Lab",
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry"
  },
  "login": {
    "title": "Enter your student or employee ID",
    "placeholder": "Enter 9-digit number",
    "submit": "Get Started",
    "error": "ID must be exactly 9 digits"
  },
  "learn": {
    "title": "Lessons",
    "progress": "{completed}/{total} completed",
    "completed": "Completed",
    "start": "Start Learning",
    "continue": "Continue"
  },
  "lesson": {
    "practice": "Practice",
    "content": "Content",
    "examples": "Examples",
    "tryIt": "Try it yourself",
    "markComplete": "Mark as complete",
    "completed": "Completed",
    "previous": "Previous",
    "next": "Next",
    "backToList": "Back to list"
  },
  "playground": {
    "title": "Playground",
    "description": "Experiment with prompts freely",
    "placeholder": "Enter your prompt...",
    "submit": "Run",
    "clear": "Clear",
    "copy": "Copy",
    "copied": "Copied!",
    "charCount": "{count}/4000 chars",
    "response": "AI Response",
    "waiting": "AI is generating a response..."
  },
  "header": {
    "playground": "Playground",
    "language": "Language"
  }
}
```

---

## 6. 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 0.1 | 2025-11-25 | 초안 작성 |
