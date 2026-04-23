from pydantic import BaseModel, ConfigDict, Field


class SummaryResponseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    persona_id: str = Field(default="", alias="personaId")
    title     : str = ""
    category  : str = ""
    published : str = ""
    source    : str = ""
    news_url  : str = Field(default="", alias="newsUrl")
    content   : str = ""