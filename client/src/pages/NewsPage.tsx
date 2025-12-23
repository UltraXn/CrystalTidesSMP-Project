import { useState, useEffect } from "react"

interface NewsPiece {
    id: string | number;
    title: string;
    content: string;
    image?: string;
    status: string;
    created_at: string;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsPiece[]>([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL
        if (!apiUrl) {
            console.error("VITE_API_URL no está definida. Reinicia el servidor frontend.")
            // Fallback para evitar pantalla negra si falta la env
            setTimeout(() => setLoading(false), 0)
            return
        }

        fetch(`${apiUrl}/news`)
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta de red")
                return res.json()
            })
            .then(data => {
                const published = Array.isArray(data) ? data.filter(n => n.status === 'Published') : []
                setNews(published)
                setLoading(false)
            })
            .catch(err => {
                console.error("Error fetching news:", err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div style={{ paddingTop: "100px", minHeight: "100vh", background: "#050505", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff" }}>
                <h2>Cargando noticias...</h2>
            </div>
        )
    }

    return (
        <div style={{ paddingTop: "120px", color: "white", textAlign: "center" }}>
            <h1>Debug Mode: NewsPage</h1>
            <p>Si ves esto, la página renderiza.</p>
            <p>Noticias encontradas: {news.length}</p>
            <div style={{ textAlign: "left", margin: "20px" }}>
                <pre>{JSON.stringify(news, null, 2)}</pre>
            </div>
        </div>
    )
}
