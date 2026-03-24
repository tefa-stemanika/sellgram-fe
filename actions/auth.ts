"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const saveToken = async (token: string, remember?: boolean) => {
  const cookieStore = await cookies();
  return new Promise((resolve) => {
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
    });

    resolve("Successfully saved");
  });
};

export const removeToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("token");

  redirect("/login");
};
