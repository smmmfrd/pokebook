import ProfileImage from "./ProfileImage";

type PostProps = {
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

export default function Post({ id, content, createdAt, user }: PostProps) {
  return (
    <section key={id} className="flex w-full flex-col gap-2 border-b px-8 py-4">
      <header className="flex items-center gap-2">
        <ProfileImage styleExtensions="relative" src={user.profileImage} />
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold">{user?.pokemon?.name}</p>
          <p className="text-xs font-thin">{createdAt.toDateString()}</p>
        </div>
      </header>
      <p>{content}</p>
    </section>
  );
}

// More twitter looking post style, doesn't work in this project though...
function AltStylePost() {
  return (
    <section className="relative flex w-full flex-col gap-2 border-b py-4 pl-20 pr-8">
      <ProfileImage
        styleExtensions="absolute top-6 left-4"
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png"
      />
      <header className="flex items-center gap-2">
        <p className="text-xl font-bold">Username</p>
        <p>⋅</p>
        <p className="text-sm font-thin">Time posted</p>
      </header>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem sed iusto
        nisi sint illum nesciunt perspiciatis eos commodi voluptatibus nulla
        voluptatum labore, dignissimos porro doloremque harum, blanditiis
        tenetur? Non, saepe!
      </p>
    </section>
  );
}
