import Hero from "@/components/Hero"
import Section from "@/components/Layout/Section"
import ServerWidgets from "@/components/Widgets/ServerWidgets"


export default function Home() {
    return (
        <>
            <Hero />
            <Section title="sobre el servidor">
                <Section>
                    <p>CrystalTides es un refugio construido con manos múltiples: un mundo donde la comunidad sostiene el cielo y el compañerismo marca el ritmo de cada paso. Aquí, las historias nacen en equipo, las metas se alcanzan en conjunto y cada jugador se vuelve parte de una marea que crece, respira y avanza unida.
                        Si quieres sentir el pulso de este mundo más de cerca, únete a la corriente: acompaña a Killubysmali en su canal de Twitch y sumérgete en la calidez colectiva del Discord de La Pecerita de killu. Allí comienza realmente la aventura, donde cada voz importa y cada presencia deja huella.</p>
                </Section>

                <Section>
                    <ServerWidgets />
                </Section>
            </Section>
        </>
    )
}

