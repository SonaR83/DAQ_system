import socket
import asyncio


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
