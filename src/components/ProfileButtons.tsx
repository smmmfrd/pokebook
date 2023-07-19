export default function ProfileButtons({ profileId }: { profileId: string }) {
  return (
    <div className="flex gap-2">
      <button className="btn-info btn-xs btn">Follow</button>
      {/* <button className="btn-error btn-xs btn">Un-Follow</button> */}
      <button className="btn-success btn-xs btn">Friend Req.</button>
      {/* <button className="btn-error btn-xs btn">Un-Friend</button> */}
    </div>
  );
}
