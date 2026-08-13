import Section from "@/components/common/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { company } from "@/data/company";

export default function AboutCompany() {
  return (
    <Section>

      <SectionTitle
        subtitle="เกี่ยวกับเรา"
        title="เราคือใคร"
      />

      <div className="mx-auto max-w-4xl">

        <p className="text-center text-lg leading-9 text-gray-600">

          {company.description}

        </p>

      </div>

    </Section>
  );
}