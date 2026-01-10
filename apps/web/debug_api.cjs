async function test() {
    try {
        const response = await fetch('http://localhost:3000/api/explain-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                errors: [{ message: "test error", line: 1, severity: "error" }],
                codeSnippet: "print(x)",
                fileName: "test.py",
                languageId: "python"
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

test();
