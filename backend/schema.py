from pydantic import BaseModel, Field
from typing import Dict, Optional

class Meta(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = Field(default=None, pattern="^(M|F)$")

class InterpretRequest(BaseModel):
    meta: Meta = Meta()
    fields: Dict[str, float]  # {"HBA1C": 6.2, ...}

class InterpretResult(BaseModel):
    code: str
    value: float
    unit: str
    status: str
    icon: str
    range_text: str
    message: str
