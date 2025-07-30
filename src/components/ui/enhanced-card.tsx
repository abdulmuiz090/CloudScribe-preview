
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  elevated?: boolean;
  animated?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, hover = true, elevated = false, animated = true, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "transition-all duration-300",
        hover && "hover:shadow-xl hover:-translate-y-1",
        elevated && "shadow-lg",
        animated && "animate-fade-in",
        "border-border/50 hover:border-border",
        "bg-card/50 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
)
EnhancedCard.displayName = "EnhancedCard"

export { EnhancedCard }
