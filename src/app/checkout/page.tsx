import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <CheckoutForm
      user={{
        id: session.user.id ?? "",
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
    />
  );
}
