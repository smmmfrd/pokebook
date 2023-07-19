import Image from "next/image";
import Link from "next/link";
import { IconMap } from "~/utils/IconsMap";

type ProfileImageProps = {
  styleExtensions?: string;
  src: string | null;
  href?: string;
};

export default function ProfileImage({
  src,
  styleExtensions = "",
  href,
}: ProfileImageProps) {
  // const mainStyles = `${styleExtensions} relative h-24 w-24 overflow-hidden rounded-full border-4 border-base-content`;
  const mainStyles = `${styleExtensions} relative h-24 w-24 overflow-hidden rounded-full bg-base-300`;

  const ImageComponent = () => (
    <>
      {src == null ? (
        IconMap.profile
      ) : (
        <Image
          src={src}
          alt={`Username's profile image`}
          height={96}
          width={96}
          // className="absolute -left-1 -top-1 h-24 w-24 max-w-none"
          className="absolute h-24 w-24 max-w-none"
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
