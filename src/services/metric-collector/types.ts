export type Metric = {
  key: string;
  value: string;
}

export type Metrics<T> = T extends Metric[] ? T : never;