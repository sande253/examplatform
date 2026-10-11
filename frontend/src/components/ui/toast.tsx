"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onDismiss?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, variant = "default", onDismiss, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 z-50 flex items-start gap-3 rounded-lg border p-4 shadow-xl min-w-[300px] max-w-[400px] animate-in slide-in-from-bottom-5",
          variant === "destructive"
            ? "border-red-500/50 bg-red-900/20 backdrop-blur-sm"
            : "border-slate-700 bg-slate-800 backdrop-blur-sm"
        )}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <div
              className={cn(
                "font-semibold text-sm mb-1",
                variant === "destructive" ? "text-red-400" : "text-white"
              )}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              className={cn(
                "text-sm",
                variant === "destructive" ? "text-red-300" : "text-slate-300"
              )}
            >
              {description}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              "rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity",
              variant === "destructive" ? "text-red-400" : "text-slate-400"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
