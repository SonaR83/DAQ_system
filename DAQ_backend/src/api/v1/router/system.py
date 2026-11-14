from fastapi import APIRouter

from core.config import UDP_HOST, UDP_PORT, UDP_TIMEOUT
from schemas.system import TextResponse
from services.udp import send_command

router = APIRouter()


@router.get("/udp_request", include_in_schema=False,
            response_model=TextResponse)
async def udp_request(
        message: str,
        host: str = UDP_HOST,
        port: int = UDP_PORT,
        enc_out: str = "cp1251",  # чем кодируем исходящее сообщение
        enc_in: str = "cp1251",  # чем декодируем входящий ответ
        errors: str = "strict",  # 'strict' | 'replace' | 'ignore'
        timeout: float = UDP_TIMEOUT  # секунды ожидания ответа
) -> TextResponse:
    reply = await send_command(message, host, port, enc_out, enc_in,
                               errors, timeout)
    return TextResponse.model_validate(reply)


@router.get("/quit", response_model=TextResponse)
async def quit_application() -> TextResponse:
    reply = await send_command("quit")
    return TextResponse.model_validate(reply)
