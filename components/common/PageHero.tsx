import Container from "@/components/ui/Container";

interface Props {
  title: string;
  subtitle?: string;
}

export default function PageHero({
  title,
  subtitle,
}: Props) {
  return (
    <section className="bg-[#F8F8F6] py-28">

      <Container>

        <div className="text-center">

          {subtitle && (

            <p className="uppercase tracking-[0.3em] text-[#0B3D2E]">

              {subtitle}

            </p>

          )}

          <h1 className="mt-6 text-5xl font-bold lg:text-6xl">

            {title}

          </h1>

        </div>

      </Container>

    </section>
  );
}