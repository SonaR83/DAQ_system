import socket
import asyncio

from fastapi import HTTPException

from core.config import UDP_ENCODING, UDP_HOST, UDP_PORT, UDP_TIMEOUT


async def udp_roundtrip(
        host: str, port: int, payload: bytes,
        timeout: float = 1.0, bufsize: int = 65535
) -> tuple[bytes, tuple[str, int]]:
    """
    Отправляем UDP-пакет и ожидаем 1 ответ (blocking IO), но запускаем в потоке,
    чтобы не блокировать event loop FastAPI.
    """

    def _send_recv() -> tuple[bytes, tuple[str, int]]:
        # User Datagram Protocol
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.settimeout(timeout)
            s.sendto(payload, (host, port))
            data, addr = s.recvfrom(bufsize)  # ждём первый ответ
            return data, addr

    try:
        # return await anyio.to_thread.run_sync(_send_recv)
        return await asyncio.to_thread(_send_recv)
    except socket.timeout:
        raise TimeoutError("UDP response timeout")


async def send_command(
        message: str,
        host: str = UDP_HOST,
        port: int = UDP_PORT,
        enc_out: str = UDP_ENCODING,  # чем кодируем исходящее сообщение
        enc_in: str = UDP_ENCODING,  # чем декодируем входящий ответ
        errors: str = "strict",  # 'strict' | 'replace' | 'ignore'
        timeout: float = UDP_TIMEOUT  # секунды ожидания ответа
) -> dict[str, str | int]:
    """
    Отправляет команду в LabVIEW по UDP и возвращает поля ответа
    (в том же виде, что и JSON эндпоинтов, ключ "from" включительно).
    """
    # Строку кодируем, например, в cp1251
    try:
        payload: bytes = message.encode(enc_out, errors=errors)
    except Exception as e:
        raise HTTPException(status_code=400,
                            detail=f"Encode error ({enc_out}): {e}")

    # Отправляем и ждём ответ
    try:
        data, addr = await udp_roundtrip(host, port, payload, timeout=timeout)
    except TimeoutError:
        raise HTTPException(status_code=504, detail="UDP response timeout")
    except ConnectionError:
        # На порту никто не слушает (LabVIEW не запущен): ОС получает ICMP
        # "port unreachable", и recvfrom падает с ConnectionResetError
        # (WinError 10054 в Windows). Без этого обработчика FastAPI вернул бы
        # 500 без CORS-заголовков, и браузер показал бы «сервер недоступен».
        raise HTTPException(
            status_code=503,
            detail=f"LabVIEW is not listening on {host}:{port} "
                   f"(UDP port unreachable)")

    # Декодируем ответ (как правило, та же кодировка)
    try:
        text: str = data.decode(enc_in, errors="replace")
    except Exception as e:
        # В крайнем случае отдадим сырые байты в hex
        raise HTTPException(status_code=502,
                            detail=f"Decode error ({enc_in}): {e}")

    return {
        "sent_to": f"{host}:{port}",
        "out_encoding": enc_out,
        "in_encoding": enc_in,
        "from": f"{addr[0]}:{addr[1]}",
        "response_len": len(data),
        "response_text": text,
    }
