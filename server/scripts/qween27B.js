const url = 'https://cell-neck-nominated-automobile.trycloudflare.com/v1/chat/completions';
const apiKey = 'ollama';
const modelName = 'qwen3.8-27b-uncensored-mtp';

async function testOllamaAPI() {
    console.log('Sending request to API...\n');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    { role: 'system', content: 'You are a helpful AI assistant.' },
                    { role: 'user', content: 'Hi, can you introduce yourself in one short sentence?' }
                ],
                temperature: 0.7,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        console.log('--- RESPONSE ---\n');
        console.log(data.choices[0].message.content);
        console.log('\n----------------');
    } catch (error) {
        console.error('Error during API call:', error.message);
    }
}

testOllamaAPI();
