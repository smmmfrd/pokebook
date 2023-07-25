import moment from "moment";
import Link from "next/link";
import NavbarIcon from "./NavbarIcon";
import ProfileImage from "./ProfileImage";

type PostCardProps = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    profileImage: string | null;
    pokemon: {
      name: string;
    } | null;
  };
};

const dateTimeFormatter = (createdAt: Date) => moment(createdAt).fromNow();

export default function PostCard({
  id,
  content,
  createdAt,
  user,
}: PostCardProps) {
  return (
    <section key={id} className="flex w-full flex-col gap-2 border-b px-8 py-4">
      <header className="flex items-start gap-6">
        <ProfileImage
          styleExtensions="relative"
          src={user.profileImage}
          href={`/profile/${user.id}`}
        />
        <div className="flex flex-col gap-2">
          <Link
            className="text-xl font-bold capitalize hover:underline"
            href={`/profile/${user.id}`}
          >
            {user?.pokemon?.name}
          </Link>
          <p className="text-xs font-thin">{dateTimeFormatter(createdAt)}</p>
        </div>
      </header>
      <p>{content}</p>
      <footer className="flex gap-2">
        <button className="btn-ghost btn-sm btn">
          <NavbarIcon icon="comment" styleExtensions="w-6 h-6" />0
        </button>
        <button className="btn-ghost btn-sm btn">
          <NavbarIcon icon="heart" styleExtensions="w-6 h-6" />
          1000
        </button>
      </footer>
    </section>
  );
}

// More twitter looking post style, doesn't work in this project though...
// function AltStylePostCard() {
//   return (
//     <section className="relative flex w-full flex-col gap-2 border-b py-4 pl-20 pr-8">
//       <ProfileImage
//         styleExtensions="absolute top-6 left-4"
//         src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png"
//       />
//       <header className="flex items-center gap-2">
//         <p className="text-xl font-bold">Username</p>
//         <p>⋅</p>
//         <p className="text-sm font-thin">Time posted</p>
//       </header>
//       <p>
//         Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem sed iusto
//         nisi sint illum nesciunt perspiciatis eos commodi voluptatibus nulla
//         voluptatum labore, dignissimos porro doloremque harum, blanditiis
//         tenetur? Non, saepe!
//       </p>
//     </section>
//   );
// }
