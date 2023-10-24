export type FriendStatus = "none" | "sent" | "received" | "friend";

export type HomeFeedEnum = "none" | "following" | "friends";

export type ProfileFeedEnum = "posts" | "likes";

export type UserPokemon = {
  id: number;
  name: string;
  profileImage: string;
  bot: boolean;
};
