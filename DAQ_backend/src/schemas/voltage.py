from schemas.udp import UdpResponseBase


class VoltageResponse(UdpResponseBase):
    response_text: float


class VoltageListResponse(UdpResponseBase):
    response_text: list[float]
