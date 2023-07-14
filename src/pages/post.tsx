import TextInput from "~/components/TextInput";

export default function PostPage({ pokemonName = "charmander" }) {
  return (
    <div>
      posting
      <TextInput pokemonName={pokemonName} />
    </div>
  );
}
