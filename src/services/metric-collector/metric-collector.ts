import { Metric } from "./types";

class MetricCollector {
  metrics: unknown;

  constructor() {
    this.metrics = {}
  }

  updateMetrics(metrics: unknown) {
    this.metrics = metrics;
  }

  getMetrics(): unknown {
    return this.metrics;
  }
}

export default MetricCollector;