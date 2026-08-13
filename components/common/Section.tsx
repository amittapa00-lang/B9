import Container from "@/components/ui/Container";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Section({
  children,
  className = "",
}: Props) {
  return (
    <section className={`py-24 ${className}`}>

      <Container>

        {children}

      </Container>

    </section>
  );
}