export interface MasterDataRecord {
  code: string;
  name: string;
}

export interface MasterDataOption {
  value: string;
  label: string;
}

export function toSelectItems(items: MasterDataRecord[]): MasterDataOption[] {
  return items.map((item) => ({
    value: item.code,
    label: item.name ? `${item.code} — ${item.name}` : item.code,
  }));
}

export function containsCode(items: MasterDataRecord[], code: string): boolean {
  return items.some((item) => item.code.toLowerCase() === code.toLowerCase());
}
