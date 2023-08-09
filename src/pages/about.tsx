import Head from "next/head";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About | Pokebook</title>
      </Head>
      <h2>About</h2>
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
        </Link>
      </p>
      <p>All rights to Pokèmon belong to Nintendo.</p>
    </>
  );
}
