import { GetStaticProps } from "next";
import Image from "next/image";
import { caller } from "~/server/api/root";

type SimplePokemon = {
  id: number;
  name: string;
  user: boolean;
  profileImage: string;
};

type PokedoxProps = {
  pokemon: SimplePokemon[];
};

export const getStaticProps: GetStaticProps<PokedoxProps> = async () => {
  const { simplePokemon } = await caller.pokemon.getAllPokemon();
  return { props: { pokemon: simplePokemon } };
};

export default function Pokedex({ pokemon }: PokedoxProps) {
  return (
    <>
      <h2 className="p-2 text-4xl font-bold">Pokemon</h2>
      <div className="flex flex-wrap justify-around gap-2 p-2">
        {pokemon.map((mon) => (
          <section
            key={mon.id}
            className="h-36 w-36 rounded-md border-2 bg-base-content p-2 text-center"
          >
            <span className="flex justify-between capitalize text-base-100">
              {mon.name}
              <input
                type="checkbox"
                checked={mon.user}
                className="checkbox-warning checkbox cursor-auto"
                onChange={() => {}}
              />
            </span>
            <Image
              src={mon.profileImage}
              alt={`${mon.name}`}
              height={96}
              width={96}
              className="m-auto"
            />
          </section>
        ))}
      </div>
    </>
  );
}
