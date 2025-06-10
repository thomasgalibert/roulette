import { createSignal, onMount } from 'solid-js';

export default function ApiExample() {
  const [health, setHealth] = createSignal<string>('');
  const [greeting, setGreeting] = createSignal<string>('');
  const [name, setName] = createSignal<string>('');

  onMount(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/health');
      const data = await response.json();
      setHealth(data.message);
    } catch (error) {
      setHealth('Backend not connected');
    }
  });

  const fetchGreeting = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/hello?name=${name()}`);
      const data = await response.json();
      setGreeting(data.message);
    } catch (error) {
      setGreeting('Error fetching greeting');
    }
  };

  return (
    <div>
      <h2>Backend Connection</h2>
      <p>Status: {health() || 'Checking...'}</p>
      
      <div style={{ "margin-top": "20px" }}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
        />
        <button onClick={fetchGreeting}>Get Greeting</button>
        {greeting() && <p>{greeting()}</p>}
      </div>
    </div>
  );
}
