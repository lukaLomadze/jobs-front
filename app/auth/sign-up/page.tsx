"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Choose how you want to register
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth/sign-up/user" className="block">
            <Button variant="outline" className="w-full justify-start" size="lg">
              I&apos;m a job seeker — create user account
            </Button>
          </Link>
          <Link href="/auth/sign-up/company" className="block">
            <Button variant="outline" className="w-full justify-start" size="lg">
              I&apos;m a company — register company
            </Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
