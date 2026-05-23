"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

/**
 * Submit button s automatickým loading stavom cez useFormStatus.
 * Pri server action sa automaticky disable-uje a zobrazí spinner.
 */
export function SubmitButton({
  label,
  loadingLabel,
}: {
  label: string;
  loadingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
      {pending ? loadingLabel : label}
    </button>
  );
}
