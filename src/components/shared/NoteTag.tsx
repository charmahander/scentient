import { cn } from "@/lib/utils";

const familyClass: Record<string, string> = {
  citrus: "note-citrus",
  floral: "note-floral",
  woody: "note-woody",
  oriental: "note-oriental",
  fresh: "note-fresh",
  gourmand: "note-gourmand",
  aquatic: "note-aquatic",
  green: "note-green",
  spicy: "note-spicy",
  musky: "note-musky",
};

interface NoteTagProps {
  name: string;
  family?: string;
  size?: "sm" | "md";
  className?: string;
}

export function NoteTag({ name, family = "default", size = "sm", className }: NoteTagProps) {
  const key = family.toLowerCase().split(" ")[0];
  const cls = familyClass[key] ?? "note-default";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        cls,
        className
      )}
    >
      {name}
    </span>
  );
}
