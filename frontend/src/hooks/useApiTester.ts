import { useRef, type FormEvent } from "react";

/** Form handler and response box ref for the local API tester. */
export function useApiTester() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);

  async function testEndpoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const endpoint = formData.get("endpoint") as string;
      const url = new URL(endpoint, location.href);
      const method = formData.get("method") as string;
      const res = await fetch(url, { method });

      const data = await res.json();
      responseInputRef.current!.value = JSON.stringify(data, null, 2);
    } catch (error) {
      responseInputRef.current!.value = String(error);
    }
  }

  return { responseInputRef, testEndpoint };
}
