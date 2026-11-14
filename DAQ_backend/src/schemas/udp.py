from pydantic import BaseModel, ConfigDict, Field


class UdpResponseBase(BaseModel):
    """Общие поля ответа: описывают, как прошёл UDP-обмен с LabVIEW."""

    # Разрешаем создавать модель и по имени поля (from_), и по алиасу (from)
    model_config = ConfigDict(populate_by_name=True)

    sent_to: str
    out_encoding: str
    in_encoding: str
    # "from" - зарезервированное слово Python, поэтому поле называется from_,
    # а в JSON ключ остаётся "from" (alias), чтобы не менять контракт API.
    from_: str = Field(alias="from")
    response_len: int
