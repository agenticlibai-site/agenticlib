import SolutionPage, { solutionMetadata } from "../_shared/SolutionPage";
import { getSolution } from "../_shared/solutions";

const s = getSolution("sales-ai");

export const metadata = solutionMetadata(s);

export default function SalesSolutionPage() {
  return <SolutionPage s={s} />;
}
