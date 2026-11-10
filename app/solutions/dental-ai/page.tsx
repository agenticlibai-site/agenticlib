import SolutionPage, { solutionMetadata } from "../_shared/SolutionPage";
import { getSolution } from "../_shared/solutions";

const s = getSolution("dental-ai");

export const metadata = solutionMetadata(s);

export default function DentalSolutionPage() {
  return <SolutionPage s={s} />;
}
