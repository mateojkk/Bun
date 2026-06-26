const API_URL = process.env.API_URL || ""

export async function query(templateId: string, query: Record<string, unknown> = {}) {
  const res = await fetch(`${API_URL}/api/daml/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId, query }),
  })
  return res.json()
}

export async function command(
  commandType: "create" | "exercise",
  templateId: string,
  contractId: string | null,
  choice: string,
  argument: Record<string, unknown>
) {
  const res = await fetch(`${API_URL}/api/daml/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commandType, templateId, contractId, choice, argument }),
  })
  return res.json()
}

export async function createContract(templateId: string, payload: Record<string, unknown>) {
  return command("create", templateId, null, "", payload)
}

export async function exercise(contractId: string, templateId: string, choice: string, argument: Record<string, unknown> = {}) {
  return command("exercise", templateId, contractId, choice, argument)
}
