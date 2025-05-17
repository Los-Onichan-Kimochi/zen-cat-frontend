import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, StarIcon } from "lucide-react";

export interface PlanCardProps {
  title: string;
  subtitle: string;
  features: string[];
  buttonLabel: string;
  highlight?: boolean;
  onClick?: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  subtitle,
  features,
  buttonLabel,
  highlight = false,
  onClick,
}) => (
  <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="px-6 pt-6 space-y-1">
      <CardTitle className="text-lg text-center font-black">{title}</CardTitle>
      <CardDescription className="flex items-center text-sm text-gray-600 text-center">
        {highlight && <StarIcon className="w-4 h-4 text-yellow-500 mr-1 text-center" />}
        {subtitle}
      </CardDescription>
    </CardHeader>

    <CardContent className="px-6 py-4 flex-grow">
      <Separator className="my-4" />
      <ul className="space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start">
            <CheckIcon className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
            <span className="ml-2 text-sm text-gray-700">{f}</span>
          </li>
        ))}
      </ul>
    </CardContent>

    <CardFooter className="px-6 pb-6 mt-auto">
      <Button
        className="w-full bg-black text-white hover:bg-gray-800 transition cursor-pointer"
        onClick={onClick}
      >
        {buttonLabel}
      </Button>
    </CardFooter>
  </Card>
);

export default PlanCard;