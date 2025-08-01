import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  endIconPaddingRight?: number; // 單位 px，預設 40
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, endIconPaddingRight = 40, containerClassName, ...props }, ref) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;

    return (
      <div className={cn('w-auto relative', containerClassName)}>
        {React.isValidElement(StartIcon) && (
          <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2">
            {/* <StartIcon size={18} className="text-muted-foreground" /> */}
            {StartIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background py-2 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            startIcon ? "pl-8" : "",
            className
          )}
          style={{
            paddingRight: endIcon ? endIconPaddingRight : undefined,
            ...(props.style || {})
          }}
          ref={ref}
          {...props}
        />
        {React.isValidElement(EndIcon) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {/* <EndIcon className="text-muted-foreground" size={18} /> */}
            {EndIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
