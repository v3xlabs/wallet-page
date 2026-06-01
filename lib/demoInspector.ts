import type { DemoInspectorProps } from "../components/wallet/DemoInspector";
import { formatDemoOutput } from "./ethereum";

/** Merge action-panel response/error into inspector tabs. */
export function mergeInspector(
  inspector: DemoInspectorProps | undefined,
  response?: unknown,
  error?: unknown,
): DemoInspectorProps | undefined {
  const request = inspector?.request ?? inspector?.rpc;
  const responseBody =
    error !== undefined && error !== ""
      ? formatDemoOutput(error)
      : response !== undefined && response !== ""
        ? formatDemoOutput(response)
        : inspector?.response ?? inspector?.raw;

  if (!inspector?.user && !request && !responseBody && !inspector?.hash) {
    return undefined;
  }

  return {
    ...inspector,
    request,
    response: responseBody,
    responseError: Boolean(error),
  };
}
