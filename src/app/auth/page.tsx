import SignInForm from "@/components/auth/sign-in-page";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <SignInForm />
    </div>
  );
}
