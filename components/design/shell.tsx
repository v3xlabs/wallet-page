import type { FC, PropsWithChildren } from "react";

export const DemoShell: FC<PropsWithChildren<{ source?: string; }>> = ({ children, source }) => (
  <div className="my-6 overflow-hidden rounded-lg border border-primary">
    <div className="bg-code-block px-5 py-4">
      {children}
    </div>
  </div>
);
