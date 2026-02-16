import { Suspense } from "react";
import HomePage from "./homepage";


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
