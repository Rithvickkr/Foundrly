type ToastProps = {
    title?: string
    description?: string
    variant?: "default" | "destructive"
  }
  
  export function toast(props: ToastProps) {
    // In a real implementation, this would add the toast to a toast store
    console.log("Toast:", props)
  
    // Create a simple alert for demonstration purposes
    if (typeof window !== "undefined") {
      alert(`${props.title}\n${props.description}`)
    }
  }
  
  