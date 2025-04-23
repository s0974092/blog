import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"

type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "選擇選項...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (option: Option) => {
    onChange(selected.filter((s) => s !== option.value))
  }

  const handleSelect = (option: Option) => {
    setInputValue("")
    onChange([...selected, option.value])
    setOpen(true)
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && selected.length > 0) {
          onChange(selected.slice(0, -1))
        }
      }
      if (e.key === "Escape") {
        input.blur()
      }
    }
  }

  const selectables = options.filter((option) => 
    !selected.includes(option.value) && 
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
    >
      <div
        className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((selectedValue) => {
            const option = options.find((opt) => opt.value === selectedValue)
            if (!option) return null
            return (
              <Badge
                key={option.value}
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {option.label}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={handleInputChange}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => setOpen(false), 200)
            }}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open ? (
          <div className="absolute top-0 z-[9999] w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandPrimitive.List className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden p-1", className)}>
              {selectables.length > 0 ? (
                selectables.map((option) => (
                  <CommandPrimitive.Item
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                    className={cn(
                      "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                    )}
                  >
                    {option.label}
                  </CommandPrimitive.Item>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  無符合的選項
                </div>
              )}
            </CommandPrimitive.List>
          </div>
        ) : null}
      </div>
    </Command>
  )
}