declare module 'react-phone-input-2' {
    import type { ComponentType } from 'react';
    export type PhoneInputProps = {
        value?: string;
        country?: string;
        onChange?: (value: string, data: unknown, event: unknown, formattedValue: string) => void;
        inputProps?: Record<string, unknown>;
        inputClass?: string;
        buttonClass?: string;
        containerClass?: string;
        dropdownClass?: string;
        searchClass?: string;
        enableSearch?: boolean;
        disableSearchIcon?: boolean;
        specialLabel?: string;
        placeholder?: string;
    };
    const PhoneInput: ComponentType<PhoneInputProps>;
    export default PhoneInput;
}
