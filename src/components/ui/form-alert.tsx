import { CircleAlert } from "lucide-react";

export function FormAlert({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
      <div className="flex gap-2">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
}