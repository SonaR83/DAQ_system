from schemas.udp import UdpResponseBase


class TextResponse(UdpResponseBase):
    response_text: str
