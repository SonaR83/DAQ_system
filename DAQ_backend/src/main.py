# main.py
from fastapi import FastAPI

from cors import configure_cors
from api.v1.router.voltage import router as voltage_router
from api.v1.router.system import router as system_router

app = FastAPI()
configure_cors(app)
app.include_router(voltage_router)
app.include_router(system_router)
