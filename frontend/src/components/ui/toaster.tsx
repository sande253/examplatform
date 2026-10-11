"use client"

import { useToast } from "./use-toast"
import { Toast } from "./toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            bottom: `${4 + index * 5}rem`,
          }}
          className="fixed right-4 z-50"
        >
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={() => dismiss(toast.id)}
          />
        </div>
      ))}
    </>
  )
}
