function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('IDLE'); 
  const [message, setMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = manualCode || searchParams.get('code');

    if (!email || !code) {
      setStatus('ERROR');
      setMessage('Please provide both email and verification code.');
      return;
    }

    setStatus('VERIFYING');
    try {
      const res = await fetch('/api/verify', { // Ensure '/auth' is removed here
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('SUCCESS');
        setMessage('Account verified successfully!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setStatus('ERROR');
        setMessage(data.message || 'Verification failed.');
      }
    } catch (error) {
      setStatus('ERROR');
      setMessage('Connection error. Please try again.');
    }
  };

  // Automatically trigger if code is in URL
  useEffect(() => {
    if (searchParams.get('code') && searchParams.get('email')) {
      handleVerify();
    }
  }, []);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
      {status === 'IDLE' || status === 'ERROR' ? (
        <form onSubmit={handleVerify} className="flex flex-col items-center">
          <ShieldCheck className="text-blue-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-900 mb-4">Enter Verification Code</h2>
          <input 
            type="email" 
            placeholder="Your Email"
            className="w-full p-3 mb-3 border rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="6-Digit Code"
            className="w-full p-3 mb-6 border rounded-xl text-center text-2xl tracking-widest"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold w-full">
            Verify Account
          </button>
          {status === 'ERROR' && <p className="text-red-500 mt-4">{message}</p>}
        </form>
      ) : null}

      {status === 'VERIFYING' && (
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p>Verifying...</p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="flex flex-col items-center">
          <CheckCircle className="text-green-600 mb-4" size={48} />
          <h2 className="text-xl font-bold">{message}</h2>
        </div>
      )}
    </div>
  );
}