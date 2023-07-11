import Image from "next/image";
import { IconMap } from "~/utils/IconsMap";

type ProfileImageProps = {
  styleExtensions?: string;
  src?: string | null;
};

export default function ProfileImage({
  src,
  styleExtensions = "",
}: ProfileImageProps) {
  return (
    <div className={`${styleExtensions} h-12 w-12 overflow-hidden`}>
      {src == null ? (
        IconMap.profile
      ) : (
        <Image src={src!} alt={`Username's profile image`} fill />
      )}
    </div>
  );
}
