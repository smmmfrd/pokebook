import Image from "next/image";
import Link from "next/link";
import { IconMap } from "~/utils/IconsMap";

type ProfileImageProps = {
  styleExtensions?: string;
  src: string | null;
  href: string;
};

export default function ProfileImage({
  src,
  styleExtensions = "",
  href,
}: ProfileImageProps) {
  return (
    <Link
      className={`${styleExtensions} relative h-24 w-24 overflow-hidden rounded-full border-4 border-base-content`}
      href={href}
    >
      {src == null ? (
        IconMap.profile
      ) : (
        <Image
          src={src}
          alt={`Username's profile image`}
          height={96}
          width={96}
          className="absolute -left-1 -top-1 h-24 w-24 max-w-none"
        />
      )}
    </Link>
  );
}
