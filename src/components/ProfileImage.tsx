import Image from "next/image";
import Link from "next/link";
import { IconMap } from "~/utils/IconsMap";

type ProfileImageProps = {
  styleExtensions?: string;
  src: string | null;
  href?: string;
  small?: boolean;
};

export default function ProfileImage({
  src,
  styleExtensions = "",
  href,
  small = false,
}: ProfileImageProps) {
  const mainStyles = `${styleExtensions} relative ${
    small ? "h-12 w-12" : "h-24 w-24"
  } overflow-hidden rounded-full ${
    small ? "ring-1" : "ring"
  } ring-primary bg-base-300/[0.1]`;

  const ImageComponent = () => (
    <>
      {src == null ? (
        IconMap.profile
      ) : (
        <Image
          src={src}
          alt={`Username's profile image`}
          height={small ? 48 : 96}
          width={small ? 48 : 96}
          className={`absolute ${small ? "h-12 w-12" : "h-24 w-24"} max-w-none`}
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link className={mainStyles} href={href}>
        <ImageComponent />
      </Link>
    );
  }

  return (
    <div className={mainStyles}>
      <ImageComponent />
    </div>
  );
}
