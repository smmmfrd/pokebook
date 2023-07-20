import { IconMap } from "~/utils/IconsMap";

type NavbarIconProps = {
  icon: keyof typeof IconMap;
  styleExtensions?: string;
};

export default function NavbarIcon({
  icon,
  styleExtensions = "",
}: NavbarIconProps) {
  return (
    <div className={`fill-current ${styleExtensions}`}>{IconMap[icon]}</div>
  );
}
