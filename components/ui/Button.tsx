import React from "react";
import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  className?: string;
  href?: string;
  onClick?: () => void;
}

export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  href,
  onClick,
}: ButtonProps) {
  
  const baseStyles = `
    group
    relative
    inline-flex
    min-w-0
    items-center
    rounded-full
    overflow-hidden
    p-1.5
    transition-all
    duration-500
    active:scale-[0.97]
  `;

  const variants = {
    primary: {
      button: "maui-button-primary",
      fill: "maui-button-fill",
      text: "",
      iconContainer: "maui-button-icon",
      // Define the icon component for primary
      Icon: ArrowUpRight, 
    },
    secondary: {
      button: "maui-button-secondary",
      fill: "hidden", 
      text: " ",
      iconContainer: "maui-button-icon",
      // Define the icon component for secondary
      Icon: Play,
    },
  };

  const current = variants[variant];
  const IconComponent = current.Icon;
  const classNames = `${baseStyles} ${current.button} ${className}`;
  const content = (
    <>
      {/* Fill Layer (Only for Primary) */}
      {variant === "primary" && (
        <span
          className={`
            absolute
            inset-0
            z-0
            scale-0
            rounded-full
            origin-center
            transition-transform
            duration-700
            ease-[cubic-bezier(0.19,1,0.22,1)]
            group-hover:scale-[2.5]
            ${current.fill}
          `}
        />
      )}

      <div className="relative z-10 grid w-full grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-1.5 sm:grid-cols-[24px_minmax(0,1fr)_auto] sm:gap-2">
        {/* The Left Padding Spacer */}
        <div className="w-4 sm:w-6" />

        {/* TEXT */}
        <span
          className={`
            text-[15px]
            font-semibold
            tracking-tight
            text-center
            pr-1
            transition-colors
            duration-500
            whitespace-nowrap
            ${current.text}
          `}
        >
          {children}
        </span>

        {/* ICON CONTAINER */}
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            transition-all
            duration-500
            sm:h-11
            sm:w-11
            ${current.iconContainer}
          `}
        >
          <IconComponent
            size={variant === "secondary" ? 16 : 20}
            className={`transition-transform duration-500 ${variant === "primary" ? "group-hover:rotate-45" : "group-hover:scale-110"}`}
          />
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classNames}
    >
      {content}
    </button>
  );
}
