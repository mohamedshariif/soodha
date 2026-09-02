import { Plus } from "lucide-react";

export function AddButton({ label, onClick }: { label: string; onClick:() => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1 rounded-full bg-primary p-4 text-white text-sm font-semibold shadow-lg lg:rounded-lg lg:px-3 lg:py-2 lg:shadow-none hover:bg-primary-hover cursor-pointer transition-colors duration-300"
    >
      <Plus className="w-5 h-5"/>
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}