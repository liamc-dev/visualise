import { useState } from "react";

export type Validator = (value: string) => string | null;

export type FieldBind = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
};

export function useField(initial = "", validate?: Validator) {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);

  const error = validate ? validate(value) : null;
  const showError = touched && !!error;
  const isValid = touched && !error;

  const bind: FieldBind = {
    value,
    onChange: (e) => setValue(e.target.value),
    onBlur: () => setTouched(true),
  };

  return {
    value,
    setValue,
    touched,
    setTouched,
    error,
    showError,
    isValid,
    bind,
  };
}
