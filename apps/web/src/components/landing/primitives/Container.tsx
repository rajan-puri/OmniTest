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
      className={`w-full max-w-[1240px] mx-auto px-[clamp(20px,5vw,56px)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
