
const WEBHOOK_URL = 'http://localhost:3001/api/webhooks/kofi';

const mockDonation = {
    message_id: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'Donation',
    from_name: 'Test Testerson',
    message: '¡Esta es una prueba de donación en vivo! 🐙',
    amount: '5.00',
    currency: 'USD',
    url: 'https://ko-fi.com',
    is_public: true
};

async function sendTestWebhook() {
    console.log('Enviando donación de prueba a:', WEBHOOK_URL);
    console.log('Payload:', mockDonation);

    try {
        // Ko-Fi envía los datos como x-www-form-urlencoded donde 'data' es un JSON string
        const params = new URLSearchParams();
        params.append('data', JSON.stringify(mockDonation));

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: params
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);

        if (response.ok) {
            console.log('✅ ¡Prueba exitosa! Revisa el feed de donaciones en la web.');
        } else {
            console.log('❌ Falló la prueba.');
        }

    } catch (error) {
        console.error('Error enviando webhook:', error.message);
        console.log('SUGERENCIA: Asegúrate de que tu servidor backend esté corriendo en el puerto 3000.');
    }
}

sendTestWebhook();
