import { Loading } from './Loading';

type ButtonSpinnerProps = {
    className?: string;
};

/** Compact circular spinner for auth buttons (sign in / sign out) and other small elements. */
export const ButtonSpinner = ({ className }: ButtonSpinnerProps) => {
    return <Loading size="sm" className={className} />;
};
