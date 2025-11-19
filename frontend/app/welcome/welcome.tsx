import { Button, Card, Label, TextInput } from "flowbite-react"
import { useState, useEffect } from "react"

export function Welcome() {
  const [voltage, setVoltage] = useState(0)
  const [mean, setMean] = useState(0)
  console.log("render")
  useEffect(() => {
    // console.log('render')
  }, [voltage, setVoltage, mean, setMean])
  const getVoltage = async () => {
    const res = await fetch(`http://localhost:8000/voltage/get_last_value`, {
      method: "get",
      headers: {
        accept: "application/json",
      },
    })
    if (!res.ok) {
      throw new Error("Ошибка ответа сервера")
    }
    const data = await res.json()
    setVoltage(Number(data.response_text.toFixed(4)))
  }
  const getMean = async () => {
    const res = await fetch(`http://localhost:8000/voltage/get_all`, {
      method: "get",
      headers: {
        accept: "application/json",
      },
    })
    if (!res.ok) {
      throw new Error("Ошибка ответа сервера")
    }
    const data = await res.json()
    const sum = data.response_text.reduce((a: number, b: number) => a + b, 0)
    const meanVal: number = Number((sum / data.response_text.length).toFixed(4))
    setMean(meanVal)
  }
  return (
    <div className="flex items-center justify-center pt-16 pb-4">
      <div className="flex items-center justify-cente">
        <Card className="max-w-md w-6xl">
          <div className="max-w-xs">
            <Label className="ml-4" htmlFor="age">
              Последнее значение напряжения
            </Label>
            <div className="flex m-2 flex-column">
              <TextInput
                className="m-1 w-40"
                id="last_value"
                type="number"
                min={0}
                max={120}
                value={voltage}
                readOnly
              />
              <Button className="m-1 w-40" onClick={() => getVoltage()}>
                Измерить
              </Button>
            </div>
          </div>
          <div className="max-w-xs">
            <Label className="ml-4" htmlFor="age">
              Среднее
            </Label>
            <div className="flex m-2 flex-column">
              <TextInput
                className="m-1 w-40"
                id="mean_value"
                type="number"
                min={0}
                max={120}
                value={mean}
                readOnly
              />
              <Button className="m-1 w-40" onClick={() => getMean()}>
                Измерить
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
