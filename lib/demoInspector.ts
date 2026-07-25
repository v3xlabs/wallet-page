import type { DemoInspectorProps as DemoInspectorProperties } from "../components/wallet/DemoInspector";
import { formatDemoOutput } from "./ethereum";

/** Merge action-panel response/error into inspector tabs. */
export const mergeInspector = (
  inspector: DemoInspectorProperties | undefined,
  response?: unknown,
  error?: unknown,
): DemoInspectorProperties | undefined => {
  const request = inspector?.request;
  const responseBody
    = error !== undefined && error !== ""
      ? formatDemoOutput(error)
      : (response !== undefined && response !== ""
          ? formatDemoOutput(response)
          : inspector?.response);

  if (!inspector?.user && !request && !responseBody && !inspector?.hash) {
    return undefined;
  }

  return {
    ...inspector,
    request,
    response: responseBody,
    responseError: Boolean(error),
  };
};
