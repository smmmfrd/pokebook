import ProfileImage from "./ProfileImage";

export default function Post() {
  return (
    <section className="flex w-full flex-col gap-6 border-b-[1px] px-8 py-4">
      <header className="flex items-center gap-2">
        <ProfileImage
          styleExtensions="relative"
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png"
        />
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold">Username</p>
          <p className="text-sm font-thin">time posted</p>
        </div>
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

// More twitter looking post style, doesn't work in this project though...
function AltStylePost() {
  return (
    <section className="relative flex w-full flex-col gap-2 border-b-[1px] py-4 pl-20 pr-8">
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
