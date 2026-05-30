export default async function handler(req, res) {
    // Tolak jika bukan request POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode tidak diizinkan' });
    }

    // MEMBACA TOKEN DARI VARIABEL LINGKUNGAN VERCEL YANG TERKUNCI (100% AMAN DARI INSPECT ELEMENT)
    const token = process.env.VERCEL_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'Konfigurasi server salah. VERCEL_TOKEN belum diatur di Dashboard Vercel.' });
    }

    const { projectName, fileContent } = req.body;

    try {
        // Mengirimkan request asli dari server backend langsung ke Vercel API resmi
        const vercelResponse = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: projectName,
                files: [
                    {
                        file: 'index.html',
                        data: fileContent
                    }
                ],
                projectSettings: {
                    framework: null
                }
            })
        });

        const result = await vercelResponse.json();

        if (vercelResponse.ok) {
            // Kembalikan URL hasil deploy ke frontend
            return res.status(200).json({ url: result.url });
        } else {
            return res.status(vercelResponse.status).json({ error: result.error?.message || 'Gagal deploy ke Vercel' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Kesalahan internal pada server backend' });
    }
}

