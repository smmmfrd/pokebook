type ProfileImageProps = {
  styleExtensions?: string;
};

export default function ProfileImage({
  styleExtensions = "",
}: ProfileImageProps) {
  return (
    <div
      className={`${styleExtensions} h-12 w-12 rounded-full border-[1px]`}
    ></div>
  );
}
