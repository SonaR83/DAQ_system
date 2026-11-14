from typing import Any

from fastapi import APIRouter, HTTPException

from udp import udp_roundtrip

router = APIRouter(prefix="/voltage")


@router.get("/get_last_value")
async def get_last_voltage_value() -> dict[str, Any]:
    message: str = "voltage"
    host: str = "127.0.0.1"
    port: int = 61557
    enc_out: str = "utf-8"  # чем кодируем исходящее сообщение
    enc_in: str = "utf-8"  # чем декодируем входящий ответ
    errors: str = "strict"  # 'strict' | 'replace' | 'ignore'
    timeout: float = 1.5  # секунды ожидания ответа
    # Строку HTTP-параметра кодируем, например, в cp1251
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
        "response_text": float(text),
    }


@router.get("/get_all")
async def get_voltage_list() -> dict[str, Any]:
    message: str = "voltage_list"
    host: str = "127.0.0.1"
    port: int = 61557
    enc_out: str = "utf-8"  # чем кодируем исходящее сообщение
    enc_in: str = "utf-8"  # чем декодируем входящий ответ
    errors: str = "strict"  # 'strict' | 'replace' | 'ignore'
    timeout: float = 1.5  # секунды ожидания ответа
    # Строку HTTP-параметра кодируем, например, в cp1251
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

    # Декодируем ответ (как правило, та же кодировка)
    try:
        text: str = data.decode(enc_in, errors="replace")
    except Exception as e:
        # В крайнем случае отдадим сырые байты в hex
        raise HTTPException(status_code=502,
                            detail=f"Decode error ({enc_in}): {e}")
    # ["14.3",/n]
    voltage_list: list[float] = [float(x) for x in text.strip().split(",") if x]
    return {
        "sent_to": f"{host}:{port}",
        "out_encoding": enc_out,
        "in_encoding": enc_in,
        "from": f"{addr[0]}:{addr[1]}",
        "response_len": len(data),
        "response_text": voltage_list,
    }
