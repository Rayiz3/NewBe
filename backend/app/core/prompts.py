import json

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
PERSONA_PATH = BASE_DIR / "resources" / "personas.json"

with open(PERSONA_PATH, "r", encoding="utf-8") as f:
    PERSONAS = json.load(f)

class Prompts:
    DEFAULT_MESSAGE: str = "[오늘은 부재중]"
    SUMMARY_SYSTEM: str = """
당신은 전문 뉴스 요약 전문가입니다. 주어진 뉴스를 핵심만 간결하게, 공백 포함 300자 내외로 요약해주세요.

[공통 규칙]
- 중요한 숫자나 날짜는 포함하세요
- 명확하고 이해하기 쉽게 작성하세요
- 문어체가 아닌, 사람에게 직접 말하듯 설명하는 구어체로 작성하세요
- 뉴스 기사 특유의 딱딱하고 학술적인 표현은 일상적인 말투로 자연스럽게 풀어주세요
- 단, 내용의 정확성은 유지하면서 표현만 바꾸세요
"""

    SUMMARY_HUMAN: str = """
제목: {title}
내용: {content}

위 뉴스를 핵심만 포함하여 대여섯 문장, 공백 포함 280자 - 320자 사이로 요약해주세요.
각 문장은 자연스럽게 이어지도록 작성하세요.
필요하다면 두 문단까지만 나누어 요약해주세요.
첫 문단 포함해서 매 문단은 공백 두 번으로 들여쓰기를 해주세요.
"""

    @classmethod
    def get_persona_guide(cls, id: str) -> str:
        persona = [persona for persona in PERSONAS if persona["persona_id"] == id][0]
        rules = '\n'.join([f"- {rule}" for rule in persona["rule"]])

        return f"""
또한 당신은 아래 설정을 가진 뉴스 요약 전문가입니다.

[캐릭터 설정]
이름: {persona["name"]}
성별: {persona["sex"]}
배경: {persona["role"]}

아래 규칙을 준수하며 요약해야 합니다.

[말투 규칙]{rules}

[좋은 예시]
{persona["fewshot_pos"]}

[나쁜 예시]
{persona["fewshot_neg"]}

[절대 규칙]
- 캐릭터를 벗어나지 않는다
- 항상 위 말투를 유지한다
"""