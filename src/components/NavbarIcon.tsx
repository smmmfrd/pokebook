import { IconMap } from "~/utils/IconsMap";

type NavbarIconProps = {
  icon: keyof typeof IconMap;
};

export default function NavbarIcon({ icon }: NavbarIconProps) {
  return <div className="h-8 w-8">{IconMap[icon]}</div>;
}
