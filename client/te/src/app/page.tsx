export default function Home() {
  const handleLogin = () => {
    // Implement login logic here, e.g., redirect to login page or open a login modal
    console.log('Login button clicked');
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to the Teacher's Evaluation System</h1>
      <p className="mt-4 text-lg text-gray-600">Please log in to access your dashboard and manage your reports.</p>
      <button onClick={handleLogin} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Login
      </button>
    </main>
  )
}