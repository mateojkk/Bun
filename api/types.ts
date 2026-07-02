export type JsonResponse = {
  status(code: number): JsonResponse
  json(body: unknown): void
}

export type ApiRequest<TBody = any> = {
  method?: string
  body: TBody
}
