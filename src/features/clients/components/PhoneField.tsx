import PhoneInputImport from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FormField } from '@/components/ui';
import { cn } from '@/lib/utils';
// CJS package — Vite ESM interop may wrap the component on `.default`
const PhoneInput = (PhoneInputImport as unknown as {
    default?: typeof PhoneInputImport;
})
    .default ?? PhoneInputImport;
type PhoneFieldProps = {
    id: string;
    label?: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    className?: string;
};
export const PhoneField = ({ id, label = 'Phone', required, value, onChange, error, className, }: PhoneFieldProps) => {
    return (<FormField label={label} htmlFor={id} required={required} error={error} className={cn('relative z-30 overflow-visible', className)}>
      <PhoneInput country="at" value={value} enableSearch disableSearchIcon specialLabel="" searchPlaceholder="Search country" placeholder="Phone number" containerClass={cn('phone-field')} dropdownClass="phone-field-dropdown" searchClass="phone-field-search" inputProps={{ id, name: id }} onChange={(next) => onChange(next)}/>
    </FormField>);
};
