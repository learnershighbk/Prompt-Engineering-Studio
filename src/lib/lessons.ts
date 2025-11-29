import type { Locale } from "@/i18n/config";

type Language = Locale;

export interface LessonExample {
  title: string;
  description: string;
  prompt: string;
  expectedBehavior?: string;
}

export interface LessonPractice {
  instruction: string;
  starterPrompt: string;
  hints: string[];
}

export interface Lesson {
  slug: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  content: string;
  examples: LessonExample[];
  practice: LessonPractice;
}

const lessonsKo: Lesson[] = [
  {
    slug: "intro",
    title: "Prompt Engineering 개요",
    description:
      "Prompt Engineering의 정의와 정책 연구에서의 중요성, 기본 원칙을 학습합니다.",
    duration: "10분",
    order: 1,
    content: `## Prompt Engineering이란?

Prompt Engineering은 AI 모델에게 원하는 결과를 얻기 위해 **효과적인 입력(프롬프트)을 설계하는 기술**입니다.

### 왜 정책학도에게 중요한가요?

같은 AI 모델이라도 프롬프트를 어떻게 작성하느냐에 따라 정책 분석의 품질이 크게 달라집니다.

**나쁜 예시:**
\`\`\`
저출산 정책 분석해줘
\`\`\`

**좋은 예시:**
\`\`\`
한국의 저출산 대응 정책 중 '육아휴직 급여 인상'에 대해
Bardach의 8단계 정책분석 프레임워크를 적용하여 분석해주세요.
정책 목표, 대안, 예상 효과를 포함해주세요.
대상 독자는 정책학 석사과정 학생입니다.
\`\`\`

### 정책 연구에서 AI 활용

- **문헌 검토 효율화**: 대량의 정책 문서 요약 및 핵심 논점 추출
- **정책 브리핑 작성**: 구조화된 정책 보고서 초안 작성
- **이해관계자 분석**: 다양한 관점에서의 정책 영향 분석
- **비교 정책 분석**: 국가별/시기별 정책 비교

### 좋은 프롬프트의 3가지 원칙

1. **명확성 (Clarity)**: 분석 대상, 범위, 관점을 구체적으로 표현
2. **맥락 (Context)**: 이론적 프레임워크, 배경 정보 제공
3. **형식 (Format)**: 원하는 출력 형태 명시 (표, 개조식, 에세이 등)

### 이 과정에서 배울 내용

- **Zero-shot Prompting**: 정책 요약, 개념 설명에 활용
- **Few-shot Prompting**: 일관된 형식의 정책 사례 분석
- **Chain of Thought**: 복잡한 정책 효과 추론 및 인과관계 분석`,
    examples: [
      {
        title: "정책 브리핑 작성",
        description:
          "구체적인 요구사항을 제시하여 정책 브리핑을 작성하는 예시입니다.",
        prompt: `다음 요구사항에 맞춰 정책 브리핑을 작성해주세요:

- 정책: 한국의 그린뉴딜 정책 (2020)
- 구조: 배경, 목표, 핵심 과제, 쟁점, 평가
- 분량: 각 항목 2-3문장
- 대상 독자: 정책학 석사과정 학생
- 톤: 객관적이고 분석적인`,
        expectedBehavior:
          "명확한 요구사항을 제시하면 AI가 구조화된 정책 브리핑을 작성합니다.",
      },
    ],
    practice: {
      instruction: "아래 간단한 프롬프트를 정책 분석에 적합하게 개선해보세요.",
      starterPrompt: "ODA 효과성 분석해줘",
      hints: [
        "어떤 국가 또는 지역의 ODA인가요?",
        "어떤 분야(교육, 보건, 인프라)의 ODA인가요?",
        "어떤 분석 프레임워크를 적용할까요?",
        "누구를 위한 분석인가요? (학술 논문, 정책 브리핑, 발표)",
      ],
    },
  },
  {
    slug: "zero-shot",
    title: "Zero-shot Prompting",
    description:
      "예시 없이 지시만으로 AI에게 정책 분석 작업을 요청하는 방법을 학습합니다.",
    duration: "15분",
    order: 2,
    content: `## Zero-shot Prompting이란?

Zero-shot Prompting은 **예시를 제공하지 않고** 작업 지시만으로 AI에게 원하는 결과를 요청하는 방법입니다.

"Zero-shot"은 "0개의 예시"라는 의미입니다.

### 정책 연구에서 언제 사용하나요?

- 정책 문서 요약 및 핵심 논점 추출
- 정책 개념 정의 및 설명 요청
- 이해관계자 목록 및 입장 분석
- 정책 용어 해설
- SWOT, PEST 등 기본 프레임워크 적용

### 정책 분석 예시

**정책 요약:**
\`\`\`
다음 OECD 보고서의 핵심 내용을 3가지 bullet point로 요약해주세요.
대상 독자는 한국 기획재정부 공무원입니다.

[보고서 내용]
\`\`\`

**이해관계자 분석:**
\`\`\`
한국의 '국민연금 개혁'에 대한 주요 이해관계자를 분석해주세요.

다음 형식으로 작성:
| 이해관계자 | 입장 | 주요 관심사 | 영향력 |
\`\`\`

**개발지표 해석:**
\`\`\`
베트남의 HDI(인간개발지수) 변화를 해석하고
정책적 시사점을 도출해주세요.
- HDI: 0.703 (2021) → 0.726 (2023)
\`\`\`

### 효과적인 Zero-shot 프롬프트 작성법

1. **분석 대상 명확히 지정**: 어떤 정책, 어떤 국가, 어떤 시기
2. **출력 형식 구체화**: 표, bullet point, 에세이 형식
3. **대상 독자 명시**: 정책입안자, 연구자, 학생
4. **분량 제한 설정**: 문장 수, 단어 수 지정

### 한계

- 복잡한 다단계 분석에는 부적합
- 일관된 형식의 반복 작업에는 Few-shot이 효과적
- 특정 분석 프레임워크 적용 시 예시 필요할 수 있음`,
    examples: [
      {
        title: "정책 이해관계자 분석",
        description:
          "정책 분석의 핵심인 이해관계자 분석을 Zero-shot으로 수행하는 예시입니다.",
        prompt: `한국의 '국민연금 개혁'에 대한 주요 이해관계자를 분석해주세요.

다음 형식으로 작성:
| 이해관계자 | 입장 | 주요 관심사 | 영향력 |

최소 5개 이해관계자 그룹을 포함해주세요.`,
        expectedBehavior:
          "AI가 정부, 노동계, 경영계, 시민단체, 청년세대 등 다양한 이해관계자의 입장을 표 형식으로 분석합니다.",
      },
      {
        title: "개발지표 해석",
        description:
          "국제개발 관련 지표를 해석하고 정책적 시사점을 도출하는 예시입니다.",
        prompt: `다음 국가의 HDI(인간개발지수) 데이터를 해석하고,
정책적 시사점을 도출해주세요.

- 국가: 베트남
- HDI: 0.703 (2021) → 0.726 (2023)
- 구성요소: 기대수명 75.4세, 평균교육연수 8.2년, 1인당 GNI $8,660

UNDP의 HDI 분류 기준을 참고하여 분석해주세요.`,
        expectedBehavior:
          "AI가 HDI 변화의 의미, 각 구성요소의 기여도, 향후 정책 방향을 분석합니다.",
      },
    ],
    practice: {
      instruction:
        "아래 Zero-shot 프롬프트를 개선하여 더 유용한 정책 분석 결과를 얻어보세요.",
      starterPrompt: "기후변화 정책 설명해줘",
      hints: [
        "어떤 국가 또는 지역의 정책인가요?",
        "어떤 측면(완화/적응/재정)에 초점을 맞출까요?",
        "누구를 위한 설명인가요? (정책입안자, 연구자, 일반시민)",
        "어떤 형식으로 받고 싶나요? (개요, 비교표, 상세 분석)",
      ],
    },
  },
  {
    slug: "few-shot",
    title: "Few-shot Prompting",
    description:
      "몇 가지 예시를 제공하여 AI가 일관된 형식으로 분석하도록 유도하는 방법을 학습합니다.",
    duration: "15분",
    order: 3,
    content: `## Few-shot Prompting이란?

Few-shot Prompting은 **몇 개의 예시(shot)를 제공**하여 AI가 원하는 패턴을 학습하고 일관된 출력을 생성하도록 하는 방법입니다.

### 정책 연구에서 언제 사용하나요?

- 여러 정책/국가를 동일한 형식으로 비교 분석할 때
- 특정 분석 프레임워크를 일관되게 적용할 때
- 정책 평가 보고서 시리즈를 작성할 때
- 데이터 분류/코딩 작업을 수행할 때

### Few-shot 프롬프트 구조

\`\`\`
[작업 설명]

예시 1:
입력: [입력 예시]
출력: [출력 예시]

예시 2:
입력: [입력 예시]
출력: [출력 예시]

실제 작업:
입력: [실제 입력]
출력:
\`\`\`

### 정책 비교 분석 예시

\`\`\`
각 국가의 탄소중립 정책을 다음 형식으로 분석해주세요.

예시 1:
국가: 독일
목표연도: 2045년
핵심전략: 재생에너지 확대, 석탄발전 폐쇄, 수소경제 육성
주요과제: 산업구조 전환, 에너지 안보
평가: 야심찬 목표이나 러시아 가스 의존이 리스크

예시 2:
국가: 일본
목표연도: 2050년
핵심전략: 원자력 재가동, 암모니아/수소 발전, CCUS
주요과제: 후쿠시마 후유증, 높은 화석연료 의존
평가: 기술중심 접근이나 원전 사회적 수용성 과제

실제 작업:
국가: 한국
\`\`\`

### 효과적인 Few-shot 활용법

1. **대표적인 예시 선택**: 다양한 케이스를 포괄하는 예시
2. **일관된 형식**: 모든 예시가 동일한 구조
3. **2-3개 예시가 적절**: 너무 많으면 토큰 낭비
4. **경계 케이스 포함**: 예외적인 상황도 예시로 제공`,
    examples: [
      {
        title: "정책 비교 분석",
        description:
          "여러 국가의 정책을 일관된 형식으로 비교 분석하는 예시입니다.",
        prompt: `각 국가의 저출산 대응 정책을 다음 형식으로 분석해주세요.

예시 1:
국가: 프랑스
주요정책: 가족수당, 육아휴직, 공공보육
특징: 보편적 지원, 일-가정 양립 중심
출산율(2023): 1.68
평가: 유럽 내 상대적 성공 사례

예시 2:
국가: 일본
주요정책: 아동수당, 보육시설 확대
특징: 근로환경 개선 병행, 지방자치단체 역할 확대
출산율(2023): 1.20
평가: 다양한 노력에도 출산율 지속 하락

실제 작업:
국가: 한국`,
        expectedBehavior:
          "AI가 제시된 형식에 맞춰 한국의 저출산 대응 정책을 분석합니다.",
      },
    ],
    practice: {
      instruction:
        "Few-shot 형식을 사용하여 SDGs(지속가능발전목표) 달성 현황을 비교 분석해보세요.",
      starterPrompt: `SDG 4(양질의 교육) 달성 현황을 분석해주세요.

예시:
국가: 핀란드
현황: 
목표:`,
      hints: [
        "예시를 1-2개 더 추가해보세요",
        "분석 항목을 구체화하세요 (지표, 정책, 과제 등)",
        "비교하고 싶은 국가를 명시하세요",
        "출처나 기준연도를 명시하면 더 정확한 답변을 얻을 수 있어요",
      ],
    },
  },
  {
    slug: "chain-of-thought",
    title: "Chain of Thought",
    description:
      "AI가 단계별로 추론하도록 유도하여 복잡한 정책 분석을 수행하는 방법을 학습합니다.",
    duration: "20분",
    order: 4,
    content: `## Chain of Thought (CoT)란?

Chain of Thought는 AI가 **단계별로 추론 과정을 명시**하도록 유도하는 기법입니다. 복잡한 문제를 작은 단계로 나누어 해결합니다.

### 정책 연구에서 언제 사용하나요?

- 정책 인과관계 분석
- 다단계 정책 효과 추론
- 복잡한 의사결정 과정 분석
- 정책 대안 평가 및 비교
- 논증 구조 분석

### CoT 프롬프트 유형

**명시적 CoT:**
\`\`\`
단계별로 분석해주세요:
1단계: 문제 정의
2단계: 원인 분석
3단계: 대안 도출
4단계: 대안 평가
5단계: 결론
\`\`\`

**유도형 CoT:**
\`\`\`
이 정책의 효과를 분석하기 전에,
먼저 정책의 목표와 수단을 정리하고,
그 다음 예상되는 인과 경로를 설명한 후,
마지막으로 실제 효과를 평가해주세요.
\`\`\`

**간단한 CoT:**
\`\`\`
[분석 요청]
단계별로 생각해주세요. (Let's think step by step.)
\`\`\`

### 정책 효과 분석 예시

\`\`\`
한국의 '주 52시간 근무제'의 효과를 다음 단계로 분석해주세요:

1단계 - 정책 설계:
- 정책 목표는 무엇인가?
- 어떤 수단을 사용하나?
- 대상 집단은 누구인가?

2단계 - 인과 경로:
- 정책 수단이 어떻게 목표 달성으로 이어지나?
- 어떤 가정이 필요한가?

3단계 - 실제 효과:
- 의도한 효과는 달성되었나?
- 의도하지 않은 효과는 무엇인가?

4단계 - 평가:
- 정책은 성공적이었나?
- 개선점은 무엇인가?
\`\`\`

### CoT 활용 팁

1. **분석 프레임워크 활용**: Bardach 8단계, 정책논증 모델 등
2. **질문 형태로 단계 구성**: AI가 스스로 답을 찾도록 유도
3. **중간 결론 요청**: 각 단계별 소결론 도출
4. **가정 명시 요청**: 추론의 전제 조건 명확화`,
    examples: [
      {
        title: "정책 효과 추론",
        description:
          "Chain of Thought를 활용하여 정책의 인과관계를 분석하는 예시입니다.",
        prompt: `한국의 '최저임금 인상' 정책 효과를 단계별로 분석해주세요.

1단계 - 정책 이론:
최저임금 인상이 어떤 경로로 노동시장에 영향을 미치는지 이론적으로 설명해주세요.

2단계 - 예상 효과:
긍정적 효과와 부정적 효과를 각각 열거해주세요.

3단계 - 실증 분석:
한국의 2018-2019년 급격한 최저임금 인상 사례를 바탕으로 실제 효과를 분석해주세요.

4단계 - 결론:
정책 설계 개선을 위한 시사점을 도출해주세요.`,
        expectedBehavior:
          "AI가 각 단계별로 체계적인 분석을 제공하며, 이론과 실증의 연결고리를 설명합니다.",
      },
    ],
    practice: {
      instruction:
        "Chain of Thought를 활용하여 개발협력 사업의 효과성을 분석해보세요.",
      starterPrompt: "한국의 베트남 ODA 사업 효과 분석해줘",
      hints: [
        "분석 단계를 명시적으로 구조화해보세요",
        "정책 목표와 수단을 먼저 정리하도록 요청하세요",
        "예상 인과경로를 설명하도록 요청하세요",
        "의도한/의도하지 않은 효과를 구분하여 분석하도록 요청하세요",
      ],
    },
  },
];

const lessonsEn: Lesson[] = [
  {
    slug: "intro",
    title: "Introduction to Prompt Engineering",
    description:
      "Learn the definition, importance in policy research, and fundamental principles of Prompt Engineering.",
    duration: "10 min",
    order: 1,
    content: `## What is Prompt Engineering?

Prompt Engineering is the skill of **designing effective inputs (prompts) to achieve desired results** from AI models.

### Why is it important for policy students?

The quality of policy analysis varies significantly depending on how you write prompts, even with the same AI model.

**Bad example:**
\`\`\`
Analyze fertility policy
\`\`\`

**Good example:**
\`\`\`
Please analyze Korea's parental leave benefit increase policy
using Bardach's 8-step policy analysis framework.
Include policy objectives, alternatives, and expected effects.
The target audience is master's students in public policy.
\`\`\`

### AI Applications in Policy Research

- **Literature review**: Summarize policy documents and extract key points
- **Policy briefings**: Draft structured policy reports
- **Stakeholder analysis**: Analyze policy impacts from various perspectives
- **Comparative policy analysis**: Compare policies across countries and time periods

### Three Principles of Good Prompts

1. **Clarity**: Clearly express the subject, scope, and perspective
2. **Context**: Provide theoretical frameworks and background information
3. **Format**: Specify desired output format (tables, bullet points, essays)

### What You'll Learn

- **Zero-shot Prompting**: For policy summaries and concept explanations
- **Few-shot Prompting**: For consistent policy case analysis
- **Chain of Thought**: For complex policy effect reasoning and causal analysis`,
    examples: [
      {
        title: "Policy Briefing",
        description:
          "An example of writing a policy briefing with specific requirements.",
        prompt: `Please write a policy briefing according to these requirements:

- Policy: Korea's Green New Deal (2020)
- Structure: Background, Objectives, Key Tasks, Issues, Evaluation
- Length: 2-3 sentences per section
- Target audience: Master's students in public policy
- Tone: Objective and analytical`,
        expectedBehavior:
          "With clear requirements, AI produces a structured policy briefing.",
      },
    ],
    practice: {
      instruction:
        "Improve the simple prompt below to get more useful policy analysis results.",
      starterPrompt: "Analyze ODA effectiveness",
      hints: [
        "Which country or region's ODA?",
        "Which sector (education, health, infrastructure)?",
        "What analytical framework to apply?",
        "Who is the analysis for? (academic paper, policy brief, presentation)",
      ],
    },
  },
  {
    slug: "zero-shot",
    title: "Zero-shot Prompting",
    description:
      "Learn how to request policy analysis tasks from AI using only instructions without examples.",
    duration: "15 min",
    order: 2,
    content: `## What is Zero-shot Prompting?

Zero-shot Prompting requests desired results from AI **without providing examples**, using only task instructions.

"Zero-shot" means "zero examples."

### When to use in policy research?

- Policy document summarization and key point extraction
- Policy concept definitions and explanations
- Stakeholder listing and position analysis
- Policy terminology explanation
- Basic framework application (SWOT, PEST, etc.)

### Policy Analysis Examples

**Policy Summary:**
\`\`\`
Summarize the key points of this OECD report in 3 bullet points.
The target audience is Korean Ministry of Finance officials.

[Report content]
\`\`\`

**Stakeholder Analysis:**
\`\`\`
Analyze the main stakeholders of Korea's 'National Pension Reform'.

Format as:
| Stakeholder | Position | Key Concerns | Influence |
\`\`\`

### Effective Zero-shot Prompt Writing

1. **Specify the analysis target**: Which policy, country, time period
2. **Clarify output format**: Table, bullet points, essay format
3. **State target audience**: Policymakers, researchers, students
4. **Set length limits**: Number of sentences or words

### Limitations

- Not suitable for complex multi-step analysis
- Few-shot is more effective for consistent formatting
- May need examples for specific analytical frameworks`,
    examples: [
      {
        title: "Stakeholder Analysis",
        description:
          "An example of performing stakeholder analysis using Zero-shot.",
        prompt: `Please analyze the main stakeholders of Korea's 'National Pension Reform'.

Format as:
| Stakeholder | Position | Key Concerns | Influence |

Include at least 5 stakeholder groups.`,
        expectedBehavior:
          "AI analyzes various stakeholders including government, labor, business, civil society, and youth in table format.",
      },
    ],
    practice: {
      instruction:
        "Improve the Zero-shot prompt below to get more useful policy analysis results.",
      starterPrompt: "Explain climate change policy",
      hints: [
        "Which country or region's policy?",
        "What aspect (mitigation/adaptation/finance)?",
        "Who is this explanation for?",
        "What format do you want? (overview, comparison table, detailed analysis)",
      ],
    },
  },
  {
    slug: "few-shot",
    title: "Few-shot Prompting",
    description:
      "Learn how to guide AI to analyze consistently by providing a few examples.",
    duration: "15 min",
    order: 3,
    content: `## What is Few-shot Prompting?

Few-shot Prompting provides **a few examples (shots)** to help AI learn desired patterns and generate consistent outputs.

### When to use in policy research?

- Comparing multiple policies/countries in the same format
- Applying specific analytical frameworks consistently
- Writing policy evaluation report series
- Data classification/coding tasks

### Few-shot Prompt Structure

\`\`\`
[Task description]

Example 1:
Input: [input example]
Output: [output example]

Example 2:
Input: [input example]
Output: [output example]

Actual task:
Input: [actual input]
Output:
\`\`\`

### Effective Few-shot Usage

1. **Choose representative examples**: Cover diverse cases
2. **Consistent format**: All examples have the same structure
3. **2-3 examples are optimal**: Too many wastes tokens
4. **Include edge cases**: Provide exceptional situations as examples`,
    examples: [
      {
        title: "Policy Comparison",
        description:
          "An example of comparing policies across countries in a consistent format.",
        prompt: `Please analyze each country's fertility policy in this format:

Example 1:
Country: France
Key Policies: Family allowance, parental leave, public childcare
Features: Universal support, work-life balance focus
Fertility Rate (2023): 1.68
Evaluation: Relative success case in Europe

Example 2:
Country: Japan
Key Policies: Child allowance, childcare facility expansion
Features: Combined with work environment improvement
Fertility Rate (2023): 1.20
Evaluation: Continued decline despite various efforts

Actual task:
Country: South Korea`,
        expectedBehavior:
          "AI analyzes Korea's fertility policy following the given format.",
      },
    ],
    practice: {
      instruction:
        "Use Few-shot format to compare SDG achievement status analysis.",
      starterPrompt: `Please analyze SDG 4 (Quality Education) achievement status.

Example:
Country: Finland
Status: 
Goals:`,
      hints: [
        "Add 1-2 more examples",
        "Make analysis items more specific (indicators, policies, challenges)",
        "Specify countries you want to compare",
        "Including sources or base years will get more accurate answers",
      ],
    },
  },
  {
    slug: "chain-of-thought",
    title: "Chain of Thought",
    description:
      "Learn how to guide AI to reason step by step for complex policy analysis.",
    duration: "20 min",
    order: 4,
    content: `## What is Chain of Thought (CoT)?

Chain of Thought guides AI to **explicitly show its reasoning process step by step**. It breaks complex problems into smaller steps.

### When to use in policy research?

- Policy causal relationship analysis
- Multi-stage policy effect reasoning
- Complex decision-making process analysis
- Policy alternative evaluation and comparison
- Argument structure analysis

### Types of CoT Prompts

**Explicit CoT:**
\`\`\`
Please analyze step by step:
Step 1: Problem definition
Step 2: Cause analysis
Step 3: Alternative generation
Step 4: Alternative evaluation
Step 5: Conclusion
\`\`\`

**Guided CoT:**
\`\`\`
Before analyzing this policy's effects,
first organize the policy's objectives and means,
then explain the expected causal pathway,
and finally evaluate the actual effects.
\`\`\`

**Simple CoT:**
\`\`\`
[Analysis request]
Let's think step by step.
\`\`\`

### CoT Tips

1. **Use analytical frameworks**: Bardach's 8 steps, policy argumentation models
2. **Structure steps as questions**: Guide AI to find answers
3. **Request intermediate conclusions**: Draw sub-conclusions per step
4. **Request assumption clarification**: Clarify preconditions for reasoning`,
    examples: [
      {
        title: "Policy Effect Reasoning",
        description:
          "An example of analyzing policy causal relationships using Chain of Thought.",
        prompt: `Please analyze the effects of Korea's 'Minimum Wage Increase' policy step by step.

Step 1 - Policy Theory:
Explain theoretically how minimum wage increases affect the labor market.

Step 2 - Expected Effects:
List both positive and negative effects.

Step 3 - Empirical Analysis:
Analyze actual effects based on Korea's rapid minimum wage increase in 2018-2019.

Step 4 - Conclusion:
Draw implications for policy design improvement.`,
        expectedBehavior:
          "AI provides systematic analysis for each step, explaining the connection between theory and evidence.",
      },
    ],
    practice: {
      instruction:
        "Use Chain of Thought to analyze the effectiveness of development cooperation projects.",
      starterPrompt: "Analyze Korea's ODA project effectiveness in Vietnam",
      hints: [
        "Explicitly structure the analysis steps",
        "Ask to organize policy objectives and means first",
        "Request explanation of expected causal pathways",
        "Ask to distinguish between intended and unintended effects",
      ],
    },
  },
];

export function getLessons(language: Language): Lesson[] {
  return language === "ko" ? lessonsKo : lessonsEn;
}

export function getLesson(slug: string, language: Language): Lesson | null {
  const lessons = getLessons(language);
  return lessons.find((lesson) => lesson.slug === slug) || null;
}

export function getLessonSlugs(): string[] {
  return ["intro", "zero-shot", "few-shot", "chain-of-thought"];
}

export function getNextLesson(
  currentSlug: string,
  language: Language
): Lesson | null {
  const lessons = getLessons(language);
  const currentIndex = lessons.findIndex((l) => l.slug === currentSlug);
  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return null;
  }
  return lessons[currentIndex + 1];
}

export function getPreviousLesson(
  currentSlug: string,
  language: Language
): Lesson | null {
  const lessons = getLessons(language);
  const currentIndex = lessons.findIndex((l) => l.slug === currentSlug);
  if (currentIndex <= 0) {
    return null;
  }
  return lessons[currentIndex - 1];
}

