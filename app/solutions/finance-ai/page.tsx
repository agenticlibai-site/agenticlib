import SolutionPage, { solutionMetadata } from "../_shared/SolutionPage";
import { getSolution } from "../_shared/solutions";

const s = getSolution("finance-ai");

export const metadata = solutionMetadata(s);

export default function FinanceSolutionPage() {
  return <SolutionPage s={s} />;
}
