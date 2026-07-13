import type { FC, PropsWithChildren } from "react";

export const DemoShell: FC<PropsWithChildren<{ source?: string; }>> = ({ children, source }) => {
  console.log("DemoShell");

  return (
    <div className="wallet-demo">
      <div className="wallet-demo-panel">
        {children}
      </div>
    </div>
  );
};
