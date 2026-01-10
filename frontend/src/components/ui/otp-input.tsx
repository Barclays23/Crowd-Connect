// components/ui/OtpInput.tsx
import { forwardRef, useRef, useEffect, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
}

export const OtpInput = forwardRef<HTMLInputElement[], OtpInputProps>(
  (
    {
      value = "",
      onChange,
      length = 6,
      disabled = false,
      error = false,
      className,
      inputClassName,
      autoFocus = true,
      onComplete,
    },
    ref
  ) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => inputRefs.current.filter(Boolean) as HTMLInputElement[]);

    // Create an array representation of the OTP
    const otpArray = value
      .replace(/\D/g, "")
      .slice(0, length)
      .split("");
    
    // Pad with empty strings to match length
    while (otpArray.length < length) {
      otpArray.push("");
    }

    const focusNext = (index: number) => {
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleChange = (index: number, input: string) => {
      const digit = input.replace(/\D/g, "").slice(-1);
      
      // Update the array at the specific index
      const newArray = [...otpArray];
      newArray[index] = digit;
      
      const newValue = newArray.join("");
      onChange(newValue);
      
      // Only move to next if a digit was entered
      if (digit) {
        setTimeout(() => {
          focusNext(index);
        }, 0);
      }
      
      if (newValue.replace(/\D/g, "").length >= length && onComplete) {
        onComplete(newValue);
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();

        // If current position has a value, clear it
        if (otpArray[index]) {
          const newArray = [...otpArray];
          newArray[index] = "";
          onChange(newArray.join(""));
          return;
        }

        // If current position is empty, move to previous and clear it
        if (index > 0) {
          const newArray = [...otpArray];
          newArray[index - 1] = "";
          onChange(newArray.join(""));
          inputRefs.current[index - 1]?.focus();
        }
      } 
      else if (e.key === "Delete") {
        e.preventDefault();
        
        // Delete always clears current position
        if (otpArray[index]) {
          const newArray = [...otpArray];
          newArray[index] = "";
          onChange(newArray.join(""));
        }
      }
      else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } 
      else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
      if (!pasted) return;

      const newArray = [...otpArray];
      let pos = index;

      for (const char of pasted) {
        if (pos >= length) break;
        newArray[pos] = char;
        pos++;
      }

      const newValue = newArray.join("");
      onChange(newValue);
      inputRefs.current[Math.min(pos, length - 1)]?.focus();

      if (newValue.replace(/\D/g, "").length >= length && onComplete) {
        onComplete(newValue);
      }
    };

    useEffect(() => {
      if (autoFocus) {
        inputRefs.current[0]?.focus();
      }
    }, [autoFocus]);

    return (
      <div className={cn("flex justify-center gap-3 sm:gap-4", className)}>
        {otpArray.map((char, index) => {
          return (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(e, index)}
              onFocus={(e) => e.target.select()}
              disabled={disabled}
              autoComplete="one-time-code"
              className={cn(
                "w-11 h-11 sm:w-12 sm:h-12 text-center text-xl font-semibold p-0",
                error && "border-destructive focus:ring-destructive/40 text-destructive",
                inputClassName
              )}
            />
          );
        })}
      </div>
    );
  }
);

OtpInput.displayName = "OtpInput";