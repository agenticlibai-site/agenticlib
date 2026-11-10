import SolutionPage, { solutionMetadata } from "../_shared/SolutionPage";
import { getSolution } from "../_shared/solutions";

const s = getSolution("legal-ai");

export const metadata = solutionMetadata(s);

export default function LegalSolutionPage() {
  return <SolutionPage s={s} />;
}
