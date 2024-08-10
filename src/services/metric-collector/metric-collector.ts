import { Metric } from "./types";

class MetricCollector {
  metrics: Metric[];

  constructor() {
    this.metrics = []
  }

  updateMetrics(metrics: Metric[]) {
    this.metrics = metrics;
  }

  getMetrics(): Metric[] {
    return this.metrics;
  }
}

export default MetricCollector;