import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface StaticList {
    label: string;
    value: string;
}

interface StaticDropdownProps {
    list: StaticList[];
    placeholder?: string;
    selectedValue?: string;
    onSelect?: (value: string) => void;
    className?: string;
    disable?: boolean;
    triggerTextColor?: string; // New prop for trigger text color
    dropdownTextColor?: string; // New prop for dropdown text color
    selectedTextColor?: string; // New prop for selected item text color
}

export function StaticDropdown({
    list,
    placeholder = "Select an option...",
    selectedValue,
    onSelect,
    className,
    disable = true,
    triggerTextColor = "text-gray-700", // Default color
    dropdownTextColor = "text-gray-700", // Default color
    selectedTextColor = "text-primary", // Default color for selected item
}: StaticDropdownProps) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const selectedItem = list.find(item => item.value === selectedValue);

    const handleSelect = (value: string) => {
        if (onSelect) {
            onSelect(value === selectedValue ? "" : value);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-between",
                        triggerTextColor, // Apply custom text color
                        className
                    )}
                    ref={triggerRef}
                    disabled={disable}
                >
                    {selectedItem ? selectedItem.label : placeholder}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0"
                style={{ width: triggerRef.current?.clientWidth }}
                align="start"
            >
                <div className="grid gap-1">
                    {list.map((item) => (
                        <Button
                            key={item.value}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start",
                                dropdownTextColor, // Default dropdown text color
                                selectedValue === item.value && cn(
                                    "bg-accent",
                                    selectedTextColor // Selected item text color
                                )
                            )}
                            onClick={() => handleSelect(item.value)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}