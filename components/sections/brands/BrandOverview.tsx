import Section from "@/components/common/Section";

interface Props {
  description: string;
}

export default function BrandOverview({
  description,
}: Props) {
  return (
    <Section>

      <div className="mx-auto max-w-3xl text-center">

        <p className="text-lg leading-9 text-gray-600">

          {description}

        </p>

      </div>

    </Section>
  );
}