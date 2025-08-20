import SignupForm from '@/components/auth/SignupForm';

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;