import { requireUser } from "@/lib/session";
import TripForm from "./TripForm";

export default async function NewTripPage() {
  await requireUser("ORG_ADMIN");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Post a trip</h1>
      <TripForm />
    </div>
  );
}
