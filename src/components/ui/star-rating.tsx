import { Star, StarHalf } from "lucide-react";
import { cn } from "~/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  maxRating = 5,
  className,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")}
        />,
      );
    }

    // Add half star if needed
    if (hasHalfStar && fullStars < maxRating) {
      stars.push(
        <StarHalf
          key="half-star"
          className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")}
        />,
      );
    }

    // Add empty stars
    const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={cn(sizeClasses[size], "text-muted-foreground")}
        />,
      );
    }

    return stars;
  };

  return <div className={cn("flex", className)}>{renderStars()}</div>;
}
