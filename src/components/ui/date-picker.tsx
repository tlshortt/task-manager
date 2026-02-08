import * as React from "react"
import { format } from "date-fns"
import CalendarIcon from "lucide-react/dist/esm/icons/calendar"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange: (date?: Date) => void
  placeholder?: string
  minDate?: Date
  className?: string
}

function DatePicker({ date, onDateChange, placeholder = "Pick a date", minDate, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => {
            onDateChange(day ?? undefined)
            setOpen(false)
          }}
          disabled={minDate ? (d) => d < minDate : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
