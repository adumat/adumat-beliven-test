import Config from "app/config"
import { EmployeeSeniority } from "app/models"

export function seniorityToText(n: EmployeeSeniority) {
  switch (n) {
    case 1:
      return "Junior"
    case 2:
      return "Mid"
    case 3:
      return "Senior"
  }
}

export function complexityToText(n: number) {
  return `${n}/${Config.MAX_PROJECT_COMPLEXITY}`
}
