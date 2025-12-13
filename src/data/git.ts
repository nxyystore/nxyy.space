"use server";

export async function avatar(): Promise<string> {
  const res = await fetch("https://api.github.com/users/prettylittlelies", {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Failed to fetch GitHub user");
  const data = await res.json();
  return data.avatar_url as string;
}
