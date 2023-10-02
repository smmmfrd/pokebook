import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconMap } from "~/utils/IconsMap";

type ProfileImageProps = {
  styleExtensions?: string;
  src: string | null;
  size: "large" | "medium" | "small";
  bot: boolean;
  href?: string;
};

export default function ProfileImage(props: ProfileImageProps) {
  const router = useRouter();

  const iconSize = `${
    props.size === "small"
      ? "h-3 w-3"
      : props.size === "medium"
      ? "h-4 w-4"
      : "h-8 w-8"
  }`;

  return (
    <div className="relative block h-min w-min">
      <ImageComponent {...props} />
      {props.bot && (
        <div
          className={`${iconSize} tooltip tooltip-top absolute bottom-0 left-0 cursor-pointer rounded-full bg-base-100`}
          data-tip="Bot"
          title="Click here to learn more!"
          onClick={(e) => {
            e.stopPropagation();
            void router.push("/about");
          }}
        >
          {IconMap.bot}
        </div>
      )}
    </div>
  );
}

function ImageComponent({
  src,
  styleExtensions = "",
  size = "large",
  bot,
  href,
}: ProfileImageProps) {
  const heightAndWidth = `${
    size === "small" ? "h-8 w-8" : size === "medium" ? "h-12 w-12" : "h-24 w-24"
  }`;

  const mainStyles = `${styleExtensions} relative ${heightAndWidth} overflow-hidden rounded-full ring ring-primary bg-base-300/[0.1]`;

  const PokemonImage = () => (
    <>
      {src == null ? (
        IconMap.profile
      ) : (
        <Image
          src={src}
          alt={`Username's profile image`}
          height={size === "small" ? 24 : size === "medium" ? 48 : 96}
          width={size === "small" ? 24 : size === "medium" ? 48 : 96}
          className={`${heightAndWidth} max-w-none`}
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link className={`block ${mainStyles}`} href={href}>
        <PokemonImage />
      </Link>
    );
  }

  return (
    <div className={mainStyles}>
      <PokemonImage />
    </div>
  );
}
