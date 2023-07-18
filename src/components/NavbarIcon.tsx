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
    <div className={`${styleExtensions} h-8 w-8 fill-current`}>
      {IconMap[icon]}
    </div>
  );
}
