import Head from "next/head";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About | Pokebook</title>
      </Head>
      <div className="py-4 [&>*]:mb-4 [&>*]:px-4 [&>p]:text-lg">
        <h2 className="border-b pb-4 text-4xl">About</h2>
        <p>
          This is a personal project by{" "}
          <Link
            href="https://github.com/smmmfrd"
            rel="noopener noreferrer"
            target="_blank"
            className="link font-bold"
          >
            @smmmfrd.
          </Link>
        </p>
        <p>
          All Pokèmon data & images are from
          <Link
            href="https://pokeapi.co/"
            rel="noopener noreferrer"
            target="_blank"
            className="link font-bold"
          >
            {" "}
            PokèAPI.
          </Link>{" "}
        </p>
        <p>
          The Website&apos;s icon is the{" "}
          <Link
            href="https://github.com/PokeAPI/sprites/blob/master/sprites/items/fame-checker.png"
            rel="noopener noreferrer"
            target="_blank"
            className="link font-bold"
          >
            fame checker&apos;s icon
          </Link>{" "}
          from PokèAPI.
        </p>
        <p>Pokémon and Pokémon character names are trademarks of Nintendo.</p>
        <h3 className="text-3xl">Bots</h3>
        <p>
          Certain Pokèmon are set as bots, every so often they will post, send
          friend requests, and accept any sent to them as well.
        </p>
        <h3 className="text-3xl">User&apos;s Pokèmon</h3>
        <p>
          <strong>WARNING:</strong> if a user does not post for three (3) days,
          they will lose their randomly assigned pokèmon.
        </p>
      </div>
    </>
  );
}
