import Image from "next/image";
import Link from "next/link";
import { IconMap } from "~/utils/IconsMap";

type ProfileImageProps = {
  styleExtensions?: string;
  src: string | null;
  href?: string;
  size: "large" | "medium" | "small";
};

export default function ProfileImage({
  src,
  styleExtensions = "",
  href,
  size = "large",
}: ProfileImageProps) {
  const heightAndWidth = `${
    size === "small" ? "h-8 w-8" : size === "medium" ? "h-12 w-12" : "h-24 w-24"
  }`;

  const mainStyles = `${styleExtensions} relative ${heightAndWidth} overflow-hidden rounded-full ring ring-primary bg-base-300/[0.1]`;

  const ImageComponent = () => (
    <>
      {src == null ? (
        IconMap.profile
      ) : (
        <Image
          src={src}
          alt={`Username's profile image`}
          height={size === "small" ? 24 : size === "medium" ? 48 : 96}
          width={size === "small" ? 24 : size === "medium" ? 48 : 96}
          className={`absolute ${heightAndWidth} max-w-none`}
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
