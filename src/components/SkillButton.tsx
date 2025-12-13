import { skillIcons } from "@/lib/skill-icons";
type SkillButtonProps = { name: string; icon: string };
export default function SkillButton({ name, icon }: SkillButtonProps) {
  const Icon = skillIcons[icon];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {Icon && <Icon />}
      {name}
    </span>
  );
}
