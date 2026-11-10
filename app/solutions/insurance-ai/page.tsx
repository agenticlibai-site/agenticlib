import SolutionPage, { solutionMetadata } from "../_shared/SolutionPage";
import { getSolution } from "../_shared/solutions";

const s = getSolution("insurance-ai");

export const metadata = solutionMetadata(s);

export default function InsuranceSolutionPage() {
  return <SolutionPage s={s} />;
}
