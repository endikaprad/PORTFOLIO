/* ══════════════════════════════════════════
   worker.js — Portfolio Endika Prado
   Sirve el portfolio estático + maneja el
   formulario de contacto con Resend
══════════════════════════════════════════ */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // ── Endpoint del formulario de contacto ──
        if (request.method === 'POST' && url.pathname === '/api/contact') {
            return handleContact(request, env);
        }

        // ── Resto: servir archivos estáticos ──
        return env.ASSETS.fetch(request);
    }
};

async function handleContact(request, env) {
    // Cabeceras CORS para que GitHub Pages / el propio Worker pueda llamarlo
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { name, email, message } = await request.json();

        // Validación básica
        if (!name || !email || !message) {
            return Response.json(
                { error: 'Faltan campos obligatorios.' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Llamada a Resend
        const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Portfolio <onboarding@resend.dev>',
                to: ['endikapradodev@gmail.com'],
                reply_to: email,
                subject: `Nuevo mensaje de ${name} — Portfolio`,
                html: `
                    <h2>Nuevo mensaje desde tu portfolio</h2>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Mensaje:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                `,
            }),
        });

        if (!resendRes.ok) {
            const err = await resendRes.json();
            console.error('Resend error:', err);
            return Response.json(
                { error: 'Error al enviar el mensaje.' },
                { status: 500, headers: corsHeaders }
            );
        }

        return Response.json(
            { ok: true },
            { status: 200, headers: corsHeaders }
        );

    } catch (err) {
        console.error('Worker error:', err);
        return Response.json(
            { error: 'Error interno del servidor.' },
            { status: 500, headers: corsHeaders }
        );
    }
}
