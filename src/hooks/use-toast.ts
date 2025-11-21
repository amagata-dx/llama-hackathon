import { toast as sonnerToast } from "sonner"

interface ToastOptions {
  variant?: "default" | "destructive"
  title?: string
  description?: string
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { variant, title, description } = options

    if (variant === "destructive") {
      sonnerToast.error(title || "エラー", {
        description,
      })
    } else {
      sonnerToast.success(title || "成功", {
        description,
      })
    }
  }

  return { toast }
}

