import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  bleed?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  bleed = false,
  ...props
}) => {
  if (bleed) {
    return (
      <div className={`w-full ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-[1280px] mx-auto px-[clamp(20px,5vw,64px)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
