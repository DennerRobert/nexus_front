/**
 * Utilitários de deserialização: converte campos de data (ISO string → Date)
 * nas respostas da API antes de salvar no estado das stores.
 */

const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
};

/**
 * Converte os campos de data de um único objeto.
 * Os campos `createdAt` e `updatedAt` são convertidos por padrão.
 * Passe `extraFields` para campos de data adicionais específicos do tipo.
 */
export const deserialize = <T>(
  obj: T,
  extraFields: string[] = [],
): T => {
  const dateFields = ["createdAt", "updatedAt", ...extraFields];
  const result = { ...(obj as Record<string, unknown>) };

  for (const field of dateFields) {
    if (field in result && result[field] != null) {
      result[field] = toDate(result[field]);
    }
  }

  return result as T;
};

/**
 * Aplica `deserialize` a todos os itens de um array.
 */
export const deserializeList = <T>(
  items: T[],
  extraFields: string[] = [],
): T[] => items.map((item) => deserialize(item, extraFields));
