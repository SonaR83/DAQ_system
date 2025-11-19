import { Button, Card, Label, TextInput } from "flowbite-react"
import { useState } from "react"

type VoltageResponse = {
  response_text: number
}

type VoltageListResponse = {
  response_text: number[]
}

export function Welcome() {
  const [voltage, setVoltage] = useState<number>(0)
  const [mean, setMean] = useState<number>(0)

  const getLastVoltageValue = async () => {
    const res = await fetch("http://localhost:8000/voltage/get_last_value", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
    if (!res.ok) {
      throw new Error("Ошибка ответа сервера")
    }

    const data: VoltageResponse = await res.json()
    setVoltage(Number(data.response_text.toFixed(4)))
  }

  const getMean = async () => {
    const res = await fetch("http://localhost:8000/voltage/get_all", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })

    if (!res.ok) {
      throw new Error("Ошибка ответа сервера")
    }

    const data: VoltageListResponse = await res.json()
    const sum = data.response_text.reduce((a, b) => a + b, 0)
    const meanVal = Number((sum / data.response_text.length).toFixed(4))
    setMean(meanVal)
  }

  return (
    <div className="flex items-center justify-center pt-16 pb-4">
      <div className="flex items-center justify-center">
        <Card className="max-w-md w-6xl">
          <div className="max-w-xs">
            <Label className="ml-4" htmlFor="last_value">
              Последнее значение напряжения
            </Label>
            <div className="flex m-2 flex-col">
              <TextInput
                className="m-1 w-40"
                id="last_value"
                type="number"
                min={0}
                max={120}
                value={voltage}
                readOnly
              />
              <Button className="m-1 w-40" onClick={getLastVoltageValue}>
                Измерить
              </Button>
            </div>
          </div>
          <div className="max-w-xs">
            <Label className="ml-4" htmlFor="mean_value">
              Среднее
            </Label>
            <div className="flex m-2 flex-col">
              <TextInput
                className="m-1 w-40"
                id="mean_value"
                type="number"
                min={0}
                max={120}
                value={mean}
                readOnly
              />
              <Button className="m-1 w-40" onClick={getMean}>
                Измерить
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
