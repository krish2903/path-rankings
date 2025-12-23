import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {

  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !flex !justify-center group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-black/5 group-[.toaster]:shadow-lg !rounded-3xl !overflow-hidden",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props} />
  );
}

export { Toaster }
