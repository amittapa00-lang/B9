import Container from "@/components/ui/Container";

interface Props {
  icon: string;
  title: string;
  slogan: string;
}

export default function BrandHero({
  icon,
  title,
  slogan,
}: Props) {
  return (
    <section className="bg-[#F8F8F6] py-28">

      <Container>

        <div className="text-center">

          <div className="text-8xl">

            {icon}

          </div>

          <h1 className="mt-8 text-6xl font-bold">

            {title}

          </h1>

          <p className="mt-6 text-xl text-gray-600">

            {slogan}

          </p>

        </div>

      </Container>

    </section>
  );
}