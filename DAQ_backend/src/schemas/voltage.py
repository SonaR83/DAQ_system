from pydantic import field_validator

from schemas.udp import UdpResponseBase


class VoltageResponse(UdpResponseBase):
    response_text: float


class VoltageListResponse(UdpResponseBase):
    response_text: list[float]

    @field_validator("response_text", mode="before")
    @classmethod
    def split_text(cls, value: object) -> object:
        # LabVIEW присылает значения одной строкой: "14.3,14.2,"
        # Разбиваем по запятой и отбрасываем пустые элементы;
        # приведение каждого элемента к float делает сам Pydantic.
        if isinstance(value, str):
            return [x for x in value.strip().split(",") if x]
        return value
