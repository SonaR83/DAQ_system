# main.py
from fastapi import FastAPI, HTTPException
import socket
# import anyio  # ставится с uvicorn[standard] или просто: pip install anyio
import asyncio

from cors import configure_cors

app = FastAPI()
configure_cors(app)

async def udp_roundtrip(host: str, port: int, payload: bytes,
                        timeout: float = 1.0, bufsize: int = 65535):
    """
    Отправляем UDP-пакет и ожидаем 1 ответ (blocking IO), но запускаем в потоке,
    чтобы не блокировать event loop FastAPI.
    """

    def _send_recv():
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


@app.get("/udp_request", include_in_schema=False)
async def udp_request(
        message: str,
        host: str = "127.0.0.1",
        port: int = 61557,
        enc_out: str = "cp1251",  # чем кодируем исходящее сообщение
        enc_in: str = "cp1251",  # чем декодируем входящий ответ
        errors: str = "strict",  # 'strict' | 'replace' | 'ignore'
        timeout: float = 1.5  # секунды ожидания ответа
):
    # Строку HTTP-параметра кодируем, например, в cp1251
    try:
        payload = message.encode(enc_out, errors=errors)
    except Exception as e:
        raise HTTPException(status_code=400,
                            detail=f"Encode error ({enc_out}): {e}")

    # Отправляем и ждём ответ
    try:
        data, addr = await udp_roundtrip(host, port, payload, timeout=timeout)
    except TimeoutError:
        raise HTTPException(status_code=504, detail="UDP response timeout")

    # Декодируем ответ (как правило, та же кодировка)
    try:
        text = data.decode(enc_in, errors="replace")
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


@app.get("/voltage/get_last_value")
async def get_last_voltage_value():
    message = "voltage"
    host: str = "127.0.0.1"
    port: int = 61557
    enc_out: str = "utf-8"  # чем кодируем исходящее сообщение
    enc_in: str = "utf-8"  # чем декодируем входящий ответ
    errors: str = "strict"  # 'strict' | 'replace' | 'ignore'
    timeout: float = 1.5  # секунды ожидания ответа
    # Строку HTTP-параметра кодируем, например, в cp1251
    try:
        payload = message.encode(enc_out, errors=errors)
    except Exception as e:
        raise HTTPException(status_code=400,
                            detail=f"Encode error ({enc_out}): {e}")

    # Отправляем и ждём ответ
    try:
        data, addr = await udp_roundtrip(host, port, payload, timeout=timeout)
    except TimeoutError:
        raise HTTPException(status_code=504, detail="UDP response timeout")

    # Декодируем ответ (как правило, та же кодировка)
    try:
        text = data.decode(enc_in, errors="replace")
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
        "response_text": float(text),
    }


@app.get("/voltage/get_all")
async def get_voltage_list():
    message = "voltage_list"
    host: str = "127.0.0.1"
    port: int = 61557
    enc_out: str = "utf-8"  # чем кодируем исходящее сообщение
    enc_in: str = "utf-8"  # чем декодируем входящий ответ
    errors: str = "strict"  # 'strict' | 'replace' | 'ignore'
    timeout: float = 1.5  # секунды ожидания ответа
    # Строку HTTP-параметра кодируем, например, в cp1251
    try:
        payload = message.encode(enc_out, errors=errors)
    except Exception as e:
        raise HTTPException(status_code=400,
                            detail=f"Encode error ({enc_out}): {e}")

    # Отправляем и ждём ответ
    try:
        data, addr = await udp_roundtrip(host, port, payload, timeout=timeout)
    except TimeoutError:
        raise HTTPException(status_code=504, detail="UDP response timeout")

    # Декодируем ответ (как правило, та же кодировка)
    try:
        text = data.decode(enc_in, errors="replace")
    except Exception as e:
        # В крайнем случае отдадим сырые байты в hex
        raise HTTPException(status_code=502,
                            detail=f"Decode error ({enc_in}): {e}")
    # ["14.3",/n]
    voltage_list = [float(x) for x in text.strip().split(",") if x]
    return {
        "sent_to": f"{host}:{port}",
        "out_encoding": enc_out,
        "in_encoding": enc_in,
        "from": f"{addr[0]}:{addr[1]}",
        "response_len": len(data),
        "response_text": voltage_list,
    }


@app.get("/quit")
async def quit_application():
    message = "quit"
    host: str = "127.0.0.1"
    port: int = 61557
    enc_out: str = "utf-8"  # чем кодируем исходящее сообщение
    enc_in: str = "utf-8"  # чем декодируем входящий ответ
    errors: str = "strict"  # 'strict' | 'replace' | 'ignore'
    timeout: float = 1.5  # секунды ожидания ответа
    # Строку HTTP-параметра кодируем, например, в cp1251
    try:
        payload = message.encode(enc_out, errors=errors)
    except Exception as e:
        raise HTTPException(status_code=400,
                            detail=f"Encode error ({enc_out}): {e}")

    # Отправляем и ждём ответ
    try:
        data, addr = await udp_roundtrip(host, port, payload, timeout=timeout)
    except TimeoutError:
        raise HTTPException(status_code=504, detail="UDP response timeout")

    # Декодируем ответ (как правило, та же кодировка)
    try:
        text = data.decode(enc_in, errors="replace")
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