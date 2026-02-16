'use client';
import { Suspense } from "react";
import HomePage from "./Homepage";


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
