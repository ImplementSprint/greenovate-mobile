export const isPresent = (value: string) => value.trim().length > 0;

export const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

export const requireFields = (fields: Record<string, string>) =>
  Object.entries(fields)
    .filter(([, value]) => !isPresent(value))
    .map(([key]) => key);
