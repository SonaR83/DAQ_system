from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from schemas.voltage import VoltageListResponse, VoltageResponse
from services.udp import send_command

router = APIRouter(prefix="/voltage")


@router.get("/get_last_value", response_model=VoltageResponse)
async def get_last_voltage_value() -> VoltageResponse:
    message: str = "voltage"
    reply = await send_command(message)
    try:
        return VoltageResponse.model_validate(reply)
    except ValidationError as e:
        # Устройство прислало данные, которые не удалось разобрать
        raise HTTPException(
            status_code=502,
            detail=f"Invalid data from device ({message}): "
                   f"{reply['response_text']!r} - {e.errors()[0]['msg']}")


@router.get("/get_all", response_model=VoltageListResponse)
async def get_voltage_list() -> VoltageListResponse:
    message: str = "voltage_list"
    reply = await send_command(message)
    try:
        return VoltageListResponse.model_validate(reply)
    except ValidationError as e:
        # Устройство прислало данные, которые не удалось разобрать
        raise HTTPException(
            status_code=502,
            detail=f"Invalid data from device ({message}): "
                   f"{reply['response_text']!r} - {e.errors()[0]['msg']}")
