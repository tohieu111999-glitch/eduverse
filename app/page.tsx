import { auth } from "@/src/lib/auth";
import { LandingPage } from "@/src/components/landing/landing-page";

export default async function Home() {
  const session = await auth();
  return <LandingPage isLoggedIn={!!session} />;
}
