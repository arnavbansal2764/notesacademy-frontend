import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get('error') ?? 'Unknown error';
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Authentication Error
      </h1>
      <p className="mb-6 whitespace-pre-wrap">{error}</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => router.push('/auth')}
      >
        Back to Sign In
      </button>
    </div>
  );
}
